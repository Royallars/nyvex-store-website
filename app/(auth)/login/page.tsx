'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <main className="mx-auto w-[min(500px,95%)] py-8">
      <section className="card p-6">
        <h1 className="mb-4 text-xl font-bold">Login</h1>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await signIn('credentials', { email, password, callbackUrl: '/account' });
          }}
        >
          <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="w-full rounded-lg border border-purple-400/30 bg-transparent p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort" />
          <button className="rounded-lg bg-purple-500 px-3 py-2">Einloggen</button>
        </form>
      </section>
    </main>
  );
}
