import { prisma } from '@/lib/prisma';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ include: { deliveryJobs: true }, orderBy: { createdAt: 'desc' }, take: 30 });
  return (
    <main className="mx-auto w-[min(1000px,95%)] py-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Orders & Delivery</h1>
        <div className="space-y-2 py-2">
          {orders.map((o) => (
            <div key={o.id} className="rounded border border-purple-400/20 p-2">
              <p className="font-semibold">{o.minecraftName} • {(o.totalCents / 100).toFixed(2)} € • {o.status}</p>
              <p className="text-sm text-slate-300">Jobs: {o.deliveryJobs.map((j) => j.status).join(', ') || 'none'}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
