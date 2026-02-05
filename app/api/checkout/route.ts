import { NextRequest, NextResponse } from 'next/server';
import { checkoutSchema } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { calculateTotalCents } from '@/lib/pricing';
import { limit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!limit(`checkout:${ip}`, 10, 60_000)) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });

  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const products = await prisma.product.findMany({ where: { id: { in: parsed.data.lines.map((x) => x.productId) } } });
  const lineItems = parsed.data.lines.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    if (!product) throw new Error('Product missing');
    return {
      quantity: line.quantity,
      price_data: {
        currency: 'eur',
        product_data: { name: product.name },
        unit_amount: product.priceCents
      }
    };
  });

  const totalCents = calculateTotalCents(
    parsed.data.lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitCents: products.find((p) => p.id === line.productId)?.priceCents || 0
    }))
  );

  const order = await prisma.order.create({
    data: {
      email: parsed.data.email,
      minecraftName: parsed.data.minecraftName,
      status: 'PENDING',
      totalCents,
      currency: 'EUR',
      items: {
        create: parsed.data.lines.map((line) => ({
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
    metadata: { orderId: order.id, minecraftName: parsed.data.minecraftName },
    customer_email: parsed.data.email
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });

  return NextResponse.json({ url: session.url });
}
