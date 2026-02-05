import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="mx-auto w-[min(900px,95%)] py-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-slate-300">Produkte, Commands, Delivery Monitoring, Refund/Revoke, Affiliate Auswertungen.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/products" className="rounded-lg border border-purple-400/40 px-3 py-2">Produkte</Link>
          <Link href="/admin/commands" className="rounded-lg border border-purple-400/40 px-3 py-2">Commands</Link>
          <Link href="/admin/orders" className="rounded-lg border border-purple-400/40 px-3 py-2">Orders</Link>
          <Link href="/api/admin/affiliate-export" className="rounded-lg border border-purple-400/40 px-3 py-2">Affiliate CSV</Link>
                  <Link href="/admin/creators" className="rounded-lg border border-purple-400/40 px-3 py-2">Creators</Link>
        </div>
      </section>
    </main>
  );
}
