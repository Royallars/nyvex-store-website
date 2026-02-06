import Link from 'next/link';
import { Hero3D } from '@/components/hero-3d';
import { prisma } from '@/lib/prisma';
import { ServerStatus } from '@/components/server-status';
import { CountdownDeal } from '@/components/countdown-deal';

export default async function HomePage() {
  const testimonials = await prisma.review.findMany({ where: { isFeatured: true }, take: 5, orderBy: { createdAt: 'desc' } });
  const deal = await prisma.deal.findFirst({ where: { active: true }, orderBy: { endsAt: 'asc' } });

  return (
    <main className="mx-auto w-[min(1200px,95%)] space-y-8 py-10">
      {deal ? <CountdownDeal name={deal.name} endsAt={deal.endsAt.toISOString()} discountPct={deal.discountPct} /> : null}
      <section className="grid gap-8 rounded-3xl border border-cyan-400/30 bg-[#0e0a21]/70 p-8 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="pixel-title text-xs text-cyan-300">Official Nyvex Store</p>
          <h1 className="text-4xl font-extrabold text-white">Max Conversion Shop für Nyvex Network</h1>
          <p className="text-slate-300">
            Ränge, Coins, Tokens, Rechte, Bundles, VIP Pass und Season Pass – alles automatisch geliefert auf <strong>play.nyvex.org</strong> (1.21.x).
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 font-semibold text-slate-900">Jetzt kaufen</Link>
            <Link href="/checkout" className="rounded-xl border border-purple-400/50 px-4 py-2">Zum Checkout</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="card p-3"><h3 className="font-semibold">Prison</h3><p className="text-sm text-slate-300">Progression + Token-System</p></div>
            <div className="card p-3"><h3 className="font-semibold">Survival</h3><p className="text-sm text-slate-300">Economy + Claims</p></div>
            <div className="card p-3"><h3 className="font-semibold">Bedwars</h3><p className="text-sm text-slate-300">Competitive PvP</p></div>
          </div>
        </div>
        <Hero3D />
      </section>

      <ServerStatus />

      <section className="grid gap-4 md:grid-cols-5">
        {testimonials.map((t) => (
          <article key={t.id} className="card p-4">
            <p className="text-sm text-slate-200">“{t.quote}”</p>
            <p className="mt-2 text-xs text-cyan-300">- {t.authorName} ({t.rating}/5)</p>
          </article>
        ))}
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-bold">FAQ & Garantie</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li><strong>Automatische Lieferung:</strong> Nach Zahlung wird dein Kauf automatisch verarbeitet.</li>
          <li><strong>Dauer:</strong> Meist unter 3 Minuten, max. 10 Minuten.</li>
          <li><strong>Support:</strong> Discord Support Link im Admin-Panel/README.</li>
        </ul>
      </section>
    </main>
  );
}
