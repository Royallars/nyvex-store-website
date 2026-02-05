import './globals.css';
import type { Metadata } from 'next';
import { Inter, Press_Start_2P } from 'next/font/google';
import Link from 'next/link';
import { CartProvider } from '@/components/cart-provider';

const inter = Inter({ subsets: ['latin'] });
const press = Press_Start_2P({ subsets: ['latin'], weight: '400', variable: '--font-press' });

export const metadata: Metadata = {
  title: 'Nyvex Network Store',
  description: 'Premium Minecraft 1.21.x Shop - play.nyvex.org'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.className} ${press.variable}`}>
      <body>
        <CartProvider>
          <header className="sticky top-0 z-30 border-b border-purple-500/30 bg-[#0a0616]/90 backdrop-blur">
            <div className="mx-auto flex w-[min(1200px,95%)] flex-wrap items-center justify-between gap-2 py-4">
              <Link href="/" className="flex items-center gap-3 font-bold">
                <img src="/icons/products/king.svg" alt="logo" className="h-10 w-10 rounded" />
                <div>
                  <p className="pixel-title text-xs text-cyan-300">NYVEX NETWORK</p>
                  <p className="text-xs text-slate-400">play.nyvex.org • 1.21.x</p>
                </div>
              </Link>
              <nav className="flex gap-2 text-sm">
                <Link href="/shop" className="rounded-lg border border-purple-400/40 px-3 py-1">Shop</Link>
                <Link href="/checkout" className="rounded-lg border border-purple-400/40 px-3 py-1">Checkout</Link>
                <Link href="/account" className="rounded-lg border border-purple-400/40 px-3 py-1">Account</Link>
                <Link href="/admin" className="rounded-lg border border-purple-400/40 px-3 py-1">Admin</Link>
              </nav>
            </div>
          </header>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
