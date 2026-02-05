'use client';

import { useEffect, useState } from 'react';

type Status = { online: boolean; players: number; max: number };

export function ServerStatus() {
  const [status, setStatus] = useState<Status>({ online: false, players: 0, max: 0 });

  useEffect(() => {
    let active = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch('https://api.mcsrvstat.us/2/play.nyvex.org');
        const data = await res.json();
        if (!active) return;
        setStatus({ online: !!data.online, players: data.players?.online || 0, max: data.players?.max || 0 });
      } catch {
        if (!active) return;
        setStatus({ online: false, players: 0, max: 0 });
      }
    };

    fetchStatus();
    const t = setInterval(fetchStatus, 60_000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-cyan-300">Live Status</p>
      <p className="text-lg font-bold">play.nyvex.org</p>
      <p className={status.online ? 'text-emerald-300' : 'text-rose-300'}>{status.online ? 'Online' : 'Offline'}</p>
      <p className="text-sm text-slate-300">Spieler: {status.players}/{status.max}</p>
    </div>
  );
}
