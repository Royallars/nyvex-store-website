'use client';

import { useMemo, useState } from 'react';
import { ProductCard, type ProductView } from './product-card';

export function ShopGrid({ products }: { products: ProductView[] }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');

  const filtered = useMemo(() => {
    const base = products.filter((p) => {
      const okQ = `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase());
      const okC = category === 'all' || p.category.slug === category;
      return okQ && okC;
    });

    if (sort === 'price-asc') base.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === 'price-desc') base.sort((a, b) => b.priceCents - a.priceCents);
    if (sort === 'best-value') base.sort((a, b) => Number(b.isBestValue) - Number(a.isBestValue));
    if (sort === 'popular') base.sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
    return base;
  }, [products, q, category, sort]);

  const categories = Array.from(new Set(products.map((p) => p.category.slug)));

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suche..." className="rounded-lg border border-purple-400/30 bg-transparent px-3 py-2" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-purple-400/30 bg-[#100a24] px-3 py-2">
          <option value="all">Alle</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-purple-400/30 bg-[#100a24] px-3 py-2">
          <option value="popular">Popular</option>
          <option value="best-value">Best Value</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  );
}
