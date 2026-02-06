import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const creators = await prisma.affiliateCreator.findMany({ include: { orders: true, payouts: true } });
  const rows = ['code,displayName,orders,commissionCents,payoutsCents'];
  for (const c of creators) {
    const commission = c.orders.reduce((s, o) => s + o.affiliateCommissionCents, 0);
    const payouts = c.payouts.reduce((s, p) => s + p.amountCents, 0);
    rows.push(`${c.code},${c.displayName},${c.orders.length},${commission},${payouts}`);
  }

  return new NextResponse(rows.join('\n'), {
    headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="affiliate-payouts.csv"' }
  });
}
