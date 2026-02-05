import crypto from 'crypto';

export function verifyHmac(payload: string, provided: string | null, secret: string) {
  if (!provided) return false;
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(provided));
}

export async function verifyHmacWithReplay(payload: string, signature: string | null, secret: string, timestamp: number, nonce: string) {
  if (!verifyHmac(payload, signature, secret)) return { ok: false, reason: 'bad-signature' };
  const drift = Math.abs(Date.now() - timestamp);
  if (drift > 5 * 60_000) return { ok: false, reason: 'stale-timestamp' };

  const { prisma } = await import('./prisma');
  const existing = await prisma.replayNonce.findUnique({ where: { nonce } });
  if (existing) return { ok: false, reason: 'replay' };
  await prisma.replayNonce.create({ data: { nonce } });
  return { ok: true };
}
