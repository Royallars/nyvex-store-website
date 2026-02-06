'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type CartLine = { productId: string; quantity: number; name: string; unitCents: number; iconPath: string };

type CartContextType = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('nyvex-cart');
    if (raw) setLines(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem('nyvex-cart', JSON.stringify(lines));
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      add: (line: CartLine) =>
        setLines((prev) => {
          const found = prev.find((x) => x.productId === line.productId);
          if (found) return prev.map((x) => (x.productId === line.productId ? { ...x, quantity: x.quantity + 1 } : x));
          return [...prev, line];
        }),
      remove: (productId: string) => setLines((prev) => prev.filter((x) => x.productId !== productId)),
      clear: () => setLines([])
    }),
    [lines]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('Cart context missing');
  return ctx;
}
