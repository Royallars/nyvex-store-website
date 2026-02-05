'use client';

import { useState } from 'react';

export default function AccountPage() {
  const [name, setName] = useState('');
  const [uuid, setUuid] = useState('');
  const [info, setInfo] = useState('');

  async function lookup() {
    if (!name) return;
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${name}`);
    if (!res.ok) {
      setInfo('Name nicht gefunden.');
      return;
    }
    const data = await res.json();
    setUuid(data.id || '');
    setInfo('UUID erfolgreich geladen.');
  }

  return (
    <main className="mx-auto w-[min(800px,95%)] py-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Account Setup</h1>
        <p className="mb-4 text-slate-300">Speichere deinen Minecraft Namen und lade optional deine UUID.</p>
        <div className="grid gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="Minecraft Name" />
          <button onClick={lookup} className="rounded-lg bg-purple-500 px-3 py-2">UUID Lookup</button>
          <input value={uuid} readOnly className="rounded-lg border border-purple-400/30 bg-transparent p-2" placeholder="UUID" />
          <p className="text-sm text-cyan-300">{info}</p>
        </div>
      </section>
    </main>
  );
}
