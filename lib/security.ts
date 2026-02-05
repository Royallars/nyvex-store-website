import crypto from 'crypto';

export function verifyHmac(payload: string, provided: string | null, secret: string) {
  if (!provided) return false;
  const digest = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(provided));
}
