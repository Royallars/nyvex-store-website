import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const form = await req.formData();
  const orderId = String(form.get('orderId'));
  const order = await prisma.order.update({ where: { id: orderId }, data: { status: 'REFUNDED' }, include: { items: { include: { product: true } } } });

  await prisma.deliveryJob.create({ data: { orderId: order.id, status: 'PENDING', type: 'REVOKE' } });
  await prisma.auditLog.create({ data: { actorId: null, action: 'order.refunded', payload: { orderId } } });

  return NextResponse.redirect(new URL('/admin/orders', req.url));
}
