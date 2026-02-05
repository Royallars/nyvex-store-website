'use client';

import { useCart } from '@/components/cart-provider';
import { calculateRankUpgradePrice, calculateTotalCents } from '@/lib/pricing';
import { useMemo, useState } from 'react';

const rankPrice: Record<string, number> = { knight: 499, lord: 999, paladin: 1499, duke: 2499, king: 3999 };

export default function CheckoutPage() {
  const { lines, remove, clear, add } = useCart();
  const [minecraftName, setMinecraftName] = useState('');
  const [email, setEmail] = useState('');
  const [giftTarget, setGiftTarget] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [currentRankSlug, setCurrentRankSlug] = useState('');
  const [msg, setMsg] = useState('');

  const total = useMemo(() => calculateTotalCents(lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitCents: l.unitCents }))), [lines]);
  const selectedRank = lines.find((x) => Object.keys(rankPrice).includes(x.name.toLowerCase()));
  const upgradeHint = selectedRank && currentRankSlug ? calculateRankUpgradePrice(rankPrice[currentRankSlug] || 0, rankPrice[selectedRank.name.toLowerCase()] || 0) : null;

  async function checkout() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        minecraftName,
        giftTarget: giftTarget || undefined,
        promoCode: promoCode || undefined,
        affiliateCode: affiliateCode || undefined,
        currentRankSlug: currentRankSlug || undefined,
        addOrderBump: false,
        lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
      })
    });
    const data = await res.json();
    if (!res.ok) return setMsg(typeof data.error === 'string' ? data.error : 'Checkout Fehler');
    clear();
    window.location.href = data.url;
  }

  return (
    <main className="mx-auto w-[min(1100px,95%)] py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-4">
          <h1 className="text-2xl font-bold">Warenkorb</h1>
          <div className="space-y-2 py-3">
            {lines.map((line) => (
              <div className="flex items-center justify-between rounded border border-purple-400/20 p-2" key={line.productId}>
                <div className="flex items-center gap-2"><img src={line.iconPath} className="h-8 w-8" /><span>{line.name} x{line.quantity}</span></div>
                <button className="text-red-300" onClick={() => remove(line.productId)}>X</button>
              </div>
            ))}
          </div>
          <p className="font-semibold text-cyan-300">Total: {(total / 100).toFixed(2)} €</p>

          <div className="mt-4 rounded border border-emerald-400/30 bg-emerald-500/10 p-3">
            <h3 className="font-semibold">Order Bump</h3>
            <p className="text-sm text-slate-300">+100 Tokens für nur 1.99€</p>
            <button
              className="mt-2 rounded bg-emerald-500 px-3 py-1 text-sm font-bold text-slate-900"
              onClick={() => add({ productId: 'upsell-100tokens', quantity: 1, name: 'Upsell +100 Tokens', unitCents: 199, iconPath: '/icons/products/tokens-100.svg' })}
            >
              Hinzufügen
            </button>
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-xl font-bold">Checkout</h2>
          <div className="space-y-2 py-2">
            <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="Minecraft Name" value={minecraftName} onChange={(e) => setMinecraftName(e.target.value)} />
            <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="Gift für (optional MC Name)" value={giftTarget} onChange={(e) => setGiftTarget(e.target.value)} />
            <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="Promo Code (optional)" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
            <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="Creator Code (optional)" value={affiliateCode} onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())} />
            <select className="w-full rounded-lg border border-purple-400/30 bg-[#100a24] p-2" value={currentRankSlug} onChange={(e) => setCurrentRankSlug(e.target.value)}>
              <option value="">Dein aktueller Rang (optional)</option>
              <option value="knight">Knight</option>
              <option value="lord">Lord</option>
              <option value="paladin">Paladin</option>
              <option value="duke">Duke</option>
            </select>
            {upgradeHint !== null ? <p className="text-sm text-emerald-300">Upgrade-Preis Hinweis: {(upgradeHint / 100).toFixed(2)} €</p> : null}
            <button onClick={checkout} className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 px-3 py-2 font-bold text-slate-900">Mit Stripe bezahlen</button>
          </div>
          <p className="text-sm text-cyan-300">{msg}</p>
        </section>
      </div>
    </main>
  );
}
