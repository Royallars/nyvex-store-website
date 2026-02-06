import { prisma } from '@/lib/prisma';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  return (
    <main className="mx-auto w-[min(1000px,95%)] py-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Produkte</h1>
        <div className="mt-3 space-y-2">
          {products.map((p) => (
            <form key={p.id} className="grid grid-cols-5 gap-2 rounded border border-purple-400/20 p-2" action="/api/admin/products" method="post">
              <input type="hidden" name="id" value={p.id} />
              <input name="name" defaultValue={p.name} className="rounded bg-transparent border border-purple-400/20 px-2" />
              <input name="priceCents" defaultValue={p.priceCents} className="rounded bg-transparent border border-purple-400/20 px-2" />
              <input name="iconPath" defaultValue={p.iconPath} className="rounded bg-transparent border border-purple-400/20 px-2" />
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="active" defaultChecked={p.active} /> Aktiv</label>
              <button className="rounded bg-purple-500 px-2 py-1 text-sm">Speichern</button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
