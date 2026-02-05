'use client';

import Link from 'next/link';
import { useCart } from './cart-provider';

export type ProductView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  iconPath: string;
  category: { slug: string; name: string };
};

export function ProductCard({ product }: { product: ProductView }) {
  const { add } = useCart();
  return (
    <article className="card p-4">
      <img src={product.iconPath} alt={product.name} className="mx-auto h-24 w-24" />
      <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
      <p className="text-sm text-slate-300">{product.description}</p>
      <p className="mt-2 font-semibold text-cyan-300">{(product.priceCents / 100).toFixed(2)} €</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => add({ productId: product.id, quantity: 1, name: product.name, unitCents: product.priceCents, iconPath: product.iconPath })}
          className="rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 px-3 py-1 text-sm font-semibold text-slate-900"
        >
          Add
        </button>
        <Link href={`/shop/${product.slug}`} className="rounded-lg border border-purple-400/40 px-3 py-1 text-sm">Details</Link>
      </div>
    </article>
  );
}
