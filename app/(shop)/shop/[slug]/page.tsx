import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug }, include: { commandTemplates: true, category: true } });
  if (!product) return notFound();

  return (
    <main className="mx-auto w-[min(900px,95%)] py-8">
      <article className="card grid gap-6 p-6 md:grid-cols-2">
        <img src={product.iconPath} className="mx-auto h-56 w-56" alt={product.name} />
        <div>
          <p className="text-sm uppercase tracking-wide text-cyan-300">{product.category.name}</p>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-2 text-slate-300">{product.description}</p>
          <p className="mt-3 text-2xl font-bold text-purple-300">{(product.priceCents / 100).toFixed(2)} €</p>
          <h3 className="mt-4 font-semibold">Perks</h3>
          <ul className="list-disc pl-5 text-slate-300">
            {(product.perks as string[]).map((perk) => <li key={perk}>{perk}</li>)}
          </ul>
        </div>
      </article>
    </main>
  );
}
