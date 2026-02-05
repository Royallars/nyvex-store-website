'use client';

import { useCart } from '@/components/cart-provider';
import { calculateTotalCents } from '@/lib/pricing';
import { useState } from 'react';

export default function CheckoutPage() {
  const { lines, remove, clear } = useCart();
  const [minecraftName, setMinecraftName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const total = calculateTotalCents(lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitCents: l.unitCents })));

  async function checkout() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        minecraftName,
        lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
      })
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || 'Checkout Fehler');
    clear();
    window.location.href = data.url;
  }

  return (
    <main className="mx-auto w-[min(1000px,95%)] py-8">
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
        </section>

        <section className="card p-4">
          <h2 className="text-xl font-bold">Checkout</h2>
          <div className="space-y-2 py-2">
            <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="Minecraft Name" value={minecraftName} onChange={(e) => setMinecraftName(e.target.value)} />
            <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={checkout} className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 px-3 py-2 font-bold text-slate-900">Mit Stripe bezahlen</button>
          </div>
          <p className="text-sm text-cyan-300">{msg}</p>
        </section>
      </div>
    </main>
  );
}
