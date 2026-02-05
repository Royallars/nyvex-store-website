import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { limit } from '@/lib/rate-limit';

function sameDay(a: Date, b: Date) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!limit(`daily:${session.user.email}`, 6, 60_000)) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const last = await prisma.dailyClaim.findFirst({ where: { userId: user.id }, orderBy: { claimDate: 'desc' } });
  const now = new Date();
  if (last && sameDay(last.claimDate, now)) return NextResponse.json({ error: 'Already claimed today' }, { status: 400 });

  const streak = last ? (Math.floor((now.getTime() - last.claimDate.getTime()) / 86400000) <= 1 ? last.streak + 1 : 1) : 1;

  await prisma.dailyClaim.create({ data: { userId: user.id, claimDate: now, streak } });
  const order = await prisma.order.create({
    data: {
      email: user.email,
      minecraftName: user.minecraftName || 'Unknown',
      status: 'PAID',
      totalCents: 0,
      loyaltyPointsEarned: 0,
      items: { create: [] }
    }
  });
  await prisma.deliveryJob.create({ data: { orderId: order.id, type: 'DAILY_REWARD', status: 'PENDING' } });

  return NextResponse.json({ ok: true, streak, reward: streak % 7 === 0 ? 'Bonus Tokens' : 'Small Tokens' });
}
