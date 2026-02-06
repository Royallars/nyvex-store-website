'use client';

import Link from 'next/link';
import { useCart } from './cart-provider';
import { motion } from 'framer-motion';

export type ProductView = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  iconPath: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  category: { slug: string; name: string };
};

export function ProductCard({ product }: { product: ProductView }) {
  const { add } = useCart();
  return (
    <motion.article whileHover={{ y: -6, rotateX: 3, rotateY: -3 }} className="card p-4 [transform-style:preserve-3d]">
      <div className="relative">
        {product.isBestValue ? <span className="absolute right-0 top-0 rounded bg-fuchsia-500 px-2 py-1 text-xs font-bold">Best Value</span> : null}
        {product.isPopular ? <span className="absolute left-0 top-0 rounded bg-cyan-500 px-2 py-1 text-xs font-bold text-slate-900">Popular</span> : null}
        <img src={product.iconPath} alt={product.name} className="mx-auto h-24 w-24" />
      </div>
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
    </motion.article>
  );
}
