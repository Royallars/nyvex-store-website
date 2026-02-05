import Link from 'next/link';
import { Hero3D } from '@/components/hero-3d';

export default function HomePage() {
  return (
    <main className="mx-auto w-[min(1200px,95%)] py-10">
      <section className="grid gap-8 rounded-3xl border border-cyan-400/30 bg-[#0e0a21]/70 p-8 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="pixel-title text-xs text-cyan-300">Official Nyvex Store</p>
          <h1 className="text-4xl font-extrabold text-white">3D Shop für Nyvex Network</h1>
          <p className="text-slate-300">
            Moderner Webshop für Ränge, Coins, Tokens und Rechte. Minecraft-vibe mit Neon-Purple/Blue, sicherem Stripe Checkout und automatisierter Lieferung.
          </p>
          <div className="flex gap-3">
            <Link href="/shop" className="rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 font-semibold text-slate-900">Zum Shop</Link>
            <Link href="/shop?category=ranks" className="rounded-xl border border-purple-400/50 px-4 py-2">Ränge ansehen</Link>
          </div>
        </div>
        <Hero3D />
      </section>
    </main>
  );
}
