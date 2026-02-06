import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CreatorStatsPage() {
  const creators = await prisma.affiliateCreator.findMany({ include: { orders: true, payouts: true } });
  return (
    <main className="mx-auto w-[min(1000px,95%)] py-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Creator Stats</h1>
        <div className="mt-3 space-y-2">
          {creators.map((c) => {
            const commission = c.orders.reduce((s, o) => s + o.affiliateCommissionCents, 0);
            const payouts = c.payouts.reduce((s, p) => s + p.amountCents, 0);
            return (
              <div key={c.id} className="rounded border border-purple-400/20 p-2">
                <p className="font-semibold">{c.displayName} ({c.code})</p>
                <p className="text-sm text-slate-300">Orders: {c.orders.length} • Commission: {(commission / 100).toFixed(2)} € • Payouts: {(payouts / 100).toFixed(2)} €</p>
              </div>
            );
          })}
        </div>
        <Link href="/api/admin/affiliate-export" className="mt-3 inline-block rounded border border-purple-400/40 px-3 py-1">Payout CSV export</Link>
      </section>
    </main>
  );
}
