import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ include: { deliveryJobs: true, affiliate: true }, orderBy: { createdAt: 'desc' }, take: 30 });
  const pending = await prisma.deliveryJob.count({ where: { status: 'PENDING' } });
  const failed = await prisma.deliveryJob.count({ where: { status: 'FAILED' } });
  const delivered = await prisma.deliveryJob.findMany({ where: { status: 'DELIVERED', startedAt: { not: null }, finishedAt: { not: null } }, take: 50 });
  const avgDeliveryMs = delivered.length
    ? Math.round(delivered.reduce((sum, d) => sum + (d.finishedAt!.getTime() - d.startedAt!.getTime()), 0) / delivered.length)
    : 0;

  return (
    <main className="mx-auto w-[min(1000px,95%)] py-8 space-y-4">
      <section className="card p-4">
        <h1 className="text-2xl font-bold">Monitoring</h1>
        <div className="mt-2 grid gap-2 md:grid-cols-3 text-sm">
          <p>Pending Jobs: <strong>{pending}</strong></p>
          <p>Failed Jobs: <strong>{failed}</strong></p>
          <p>Avg Delivery Time: <strong>{avgDeliveryMs} ms</strong></p>
        </div>
        <Link className="mt-3 inline-block rounded border border-purple-400/40 px-3 py-1" href="/api/admin/affiliate-export">Affiliate CSV Export</Link>
      </section>

      <section className="card p-6">
        <h1 className="text-2xl font-bold">Orders & Delivery</h1>
        <div className="space-y-2 py-2">
          {orders.map((o) => (
            <div key={o.id} className="rounded border border-purple-400/20 p-2">
              <p className="font-semibold">{o.minecraftName} • {(o.totalCents / 100).toFixed(2)} € • {o.status}</p>
              <p className="text-sm text-slate-300">Affiliate: {o.affiliate?.code || '-'} / Gift: {o.giftedTo || '-'}</p>
              <p className="text-sm text-slate-300">Jobs: {o.deliveryJobs.map((j) => j.status).join(', ') || 'none'}</p>
              <form action="/api/admin/refund" method="post" className="mt-2">
                <input type="hidden" name="orderId" value={o.id} />
                <button className="rounded bg-rose-600 px-2 py-1 text-sm">Mark REFUNDED + Revoke</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
