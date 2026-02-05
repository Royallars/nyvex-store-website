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
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' }, include: { items: true } });
      await prisma.deliveryJob.create({ data: { orderId: order.id, status: 'PENDING' } });
      await sendOrderEmail(order.email, 'Nyvex Bestellung bezahlt', `<p>Danke ${order.minecraftName}, deine Bestellung wird geliefert.</p>`);
    }
  }

  return NextResponse.json({ received: true });
}
