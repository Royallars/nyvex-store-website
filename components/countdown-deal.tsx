'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function left(iso: string) {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

export function CountdownDeal({ name, endsAt, discountPct }: { name: string; endsAt: string; discountPct: number }) {
  const [seconds, setSeconds] = useState(() => left(endsAt));
  useEffect(() => {
    const t = setInterval(() => setSeconds(left(endsAt)), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-fuchsia-400/40 bg-gradient-to-r from-purple-700/30 to-cyan-600/20 p-4"
    >
      <p className="pixel-title text-xs text-fuchsia-200">{name} • {discountPct}% OFF</p>
      <p className="text-lg font-bold">Endet in {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}</p>
    </motion.section>
  );
}
