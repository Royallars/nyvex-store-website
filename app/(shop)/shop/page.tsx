import { prisma } from '@/lib/prisma';
import { ShopGrid } from '@/components/shop-grid';

export default async function ShopPage() {
  const products = await prisma.product.findMany({ include: { category: true }, where: { active: true }, orderBy: { createdAt: 'asc' } });

  return (
    <main className="mx-auto w-[min(1200px,95%)] py-8">
      <h1 className="pixel-title mb-2 text-xl text-cyan-300">Nyvex Store</h1>
      <p className="mb-4 text-sm text-slate-300">Kategorien: Ränge, Coins, Tokens, Rechte, Bundles, Subscriptions, Season Pass, Cosmetics.</p>
      <ShopGrid
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          priceCents: p.priceCents,
          iconPath: p.iconPath,
          isPopular: p.isPopular,
          isBestValue: p.isBestValue,
          category: { slug: p.category.slug, name: p.category.name }
        }))}
      />
    </main>
  );
}
