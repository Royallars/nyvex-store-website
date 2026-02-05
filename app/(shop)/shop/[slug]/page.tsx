import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug }, include: { commandTemplates: true, category: true, reviews: true } });
  if (!product) return notFound();

  return (
    <main className="mx-auto w-[min(900px,95%)] py-8">
      <article className="card grid gap-6 p-6 md:grid-cols-2">
        <img src={product.iconPath} className="mx-auto h-56 w-56" alt={product.name} />
        <div>
          <p className="text-sm uppercase tracking-wide text-cyan-300">{product.category.name}</p>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.isBestValue ? <p className="mt-1 inline-block rounded bg-fuchsia-600 px-2 py-1 text-xs">Best Value</p> : null}
          <p className="mt-2 text-slate-300">{product.description}</p>
          <p className="mt-3 text-2xl font-bold text-purple-300">{(product.priceCents / 100).toFixed(2)} €</p>
          <h3 className="mt-4 font-semibold">Perks</h3>
          <ul className="list-disc pl-5 text-slate-300">
            {(product.perks as string[]).map((perk) => <li key={perk}>{perk}</li>)}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/shop?category=ranks" className="rounded border border-purple-400/40 px-2 py-1">Rank Vergleich</Link>
            <span className="rounded border border-cyan-300/40 px-2 py-1">Gift Option im Checkout</span>
          </div>
        </div>
      </article>

      <section className="card mt-4 p-4">
        <h2 className="font-semibold">Reviews</h2>
        {(product.reviews.length ? product.reviews : await prisma.review.findMany({ where: { isFeatured: true }, take: 2 })).map((r) => (
          <p key={r.id} className="mt-2 text-sm text-slate-300">“{r.quote}” - {r.authorName}</p>
        ))}
      </section>
    </main>
  );
}
