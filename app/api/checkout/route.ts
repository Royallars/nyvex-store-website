import { NextRequest, NextResponse } from 'next/server';
import { checkoutSchema } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { calculateRankUpgradePrice, calculateTotalCents } from '@/lib/pricing';
import { limit } from '@/lib/rate-limit';

const rankOrder = ['knight', 'lord', 'paladin', 'duke', 'king'];

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!limit(`checkout:${ip}`, 12, 60_000)) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });

  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });


  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const minAgeMinutes = Number(process.env.MIN_ACCOUNT_AGE_MINUTES || 0);
  if (existingUser && minAgeMinutes > 0) {
    const ageMs = Date.now() - existingUser.createdAt.getTime();
    if (ageMs < minAgeMinutes * 60_000) return NextResponse.json({ error: 'Account too new for checkout' }, { status: 403 });
  }
  const blocked = await prisma.fraudBlocklist.findFirst({
    where: { value: { in: [parsed.data.minecraftName, parsed.data.giftTarget || '', ip] } }
  });
  if (blocked) return NextResponse.json({ error: 'Player blocked' }, { status: 403 });

  const normalLines = parsed.data.lines.filter((l) => l.productId !== 'upsell-100tokens');
  const products = await prisma.product.findMany({ where: { id: { in: normalLines.map((x) => x.productId) } } });

  let lineItems: any[] = [];
  for (const line of normalLines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) return NextResponse.json({ error: 'Product missing' }, { status: 400 });

    lineItems.push({
      quantity: line.quantity,
      price_data: {
        currency: 'eur',
        product_data: { name: product.name },
        unit_amount: product.priceCents
      }
    });
  }

  if (parsed.data.addOrderBump || parsed.data.lines.some((x) => x.productId === 'upsell-100tokens')) {
    lineItems.push({ quantity: 1, price_data: { currency: 'eur', product_data: { name: 'Upsell +100 Tokens' }, unit_amount: 199 } });
  }

  let totalCents = calculateTotalCents(
    normalLines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitCents: products.find((p) => p.id === line.productId)?.priceCents || 0
    }))
  );

  if (parsed.data.lines.some((x) => x.productId === 'upsell-100tokens')) totalCents += 199;

  const rankTarget = products.find((p) => p.categoryId && rankOrder.includes(p.slug));
  if (rankTarget && parsed.data.currentRankSlug && rankOrder.includes(parsed.data.currentRankSlug)) {
    const old = products.find((p) => p.slug === parsed.data.currentRankSlug)?.priceCents ?? 0;
    const diff = calculateRankUpgradePrice(old, rankTarget.priceCents);
    totalCents = Math.min(totalCents, diff + (totalCents - rankTarget.priceCents));
  }

  let affiliateId: string | undefined;
  let affiliateCommissionCents = 0;
  if (parsed.data.affiliateCode) {
    const creator = await prisma.affiliateCreator.findUnique({ where: { code: parsed.data.affiliateCode } });
    if (creator) {
      affiliateId = creator.id;
      affiliateCommissionCents = Math.round(totalCents * (creator.commissionPct / 100));
    }
  }

  const loyaltyPointsEarned = Math.floor((totalCents / 100) * 10);

  const order = await prisma.order.create({
    data: {
      email: parsed.data.email,
      minecraftName: parsed.data.minecraftName,
      isGift: !!parsed.data.giftTarget,
      giftedTo: parsed.data.giftTarget,
      affiliateCode: parsed.data.affiliateCode,
      affiliateId,
      affiliateCommissionCents,
      promoCode: parsed.data.promoCode,
      previousRank: parsed.data.currentRankSlug,
      upgradedRank: rankTarget?.slug,
      status: 'PENDING',
      totalCents,
      currency: 'EUR',
      loyaltyPointsEarned,
      items: {
        create: normalLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitCents: products.find((p) => p.id === line.productId)?.priceCents || 0
        }))
      }
    }
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?paid=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancel=1`,
    metadata: { orderId: order.id, minecraftName: parsed.data.minecraftName, giftTarget: parsed.data.giftTarget || '' },
    customer_email: parsed.data.email,
    allow_promotion_codes: true,
    payment_method_types: ['card', 'klarna']
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

  return NextResponse.json({ url: session.url });
}
