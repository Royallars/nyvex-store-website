'use client';

import { useState } from 'react';

export default function AccountPage() {
  const [name, setName] = useState('');
  const [uuid, setUuid] = useState('');
  const [info, setInfo] = useState('');
  const [claimInfo, setClaimInfo] = useState('');

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

  async function dailyClaim() {
    const res = await fetch('/api/daily-claim', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) return setClaimInfo(data.error || 'Claim fehlgeschlagen');
    setClaimInfo(`Claim ok! Streak ${data.streak} • Reward: ${data.reward}`);
  }

  async function seasonLoginMission() {
    const res = await fetch('/api/season/mission', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ missionType: 'login' }) });
    const data = await res.json();
    if (!res.ok) return setClaimInfo(data.error || 'Mission fehlgeschlagen');
    setClaimInfo(`Season XP: ${data.xp} • Level ${data.level}`);
  }

  return (
    <main className="mx-auto w-[min(800px,95%)] py-8 space-y-4">
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

      <section className="card p-6">
        <h2 className="text-xl font-bold">Daily Rewards & Season Pass</h2>
        <div className="mt-3 flex gap-2">
          <button onClick={dailyClaim} className="rounded bg-emerald-500 px-3 py-2 font-semibold text-slate-900">Daily Claim</button>
          <button onClick={seasonLoginMission} className="rounded bg-cyan-500 px-3 py-2 font-semibold text-slate-900">Login Mission claim</button>
        </div>
        <p className="mt-2 text-sm text-cyan-300">{claimInfo}</p>
      </section>
    </main>
  );
}
