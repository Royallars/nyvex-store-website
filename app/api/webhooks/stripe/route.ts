import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderEmail } from '@/lib/email';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!stripe || !signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook config missing' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    await prisma.webhookLog.create({ data: { source: 'stripe', eventType: 'unknown', signatureOk: false, payload: { raw: body } } });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await prisma.webhookLog.create({ data: { source: 'stripe', eventType: event.type, signatureOk: true, payload: event as any } });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' }, include: { items: true, user: true } });
      await prisma.deliveryJob.create({ data: { orderId: order.id, status: 'PENDING', type: 'GRANT' } });

      if (order.userId) {
        await prisma.loyaltyWallet.upsert({
          where: { userId: order.userId },
          create: { userId: order.userId, points: order.loyaltyPointsEarned },
          update: { points: { increment: order.loyaltyPointsEarned } }
        });
      }

      await sendOrderEmail(order.email, 'Nyvex Bestellung bezahlt', `<p>Danke ${order.minecraftName}, deine Bestellung wird geliefert.</p>`);
      if (order.isGift && order.giftedTo) {
        await sendOrderEmail(order.email, 'Geschenk bestellt', `<p>Dein Geschenk für ${order.giftedTo} wurde verarbeitet.</p>`);
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    await prisma.auditLog.create({ data: { action: 'subscription.deleted', payload: event as any } });
  }

  return NextResponse.json({ received: true });
}
