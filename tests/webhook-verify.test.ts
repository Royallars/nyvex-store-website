import { describe, expect, it } from 'vitest';
import crypto from 'crypto';
import { verifyHmac } from '@/lib/security';

describe('verifyHmac', () => {
  it('verifies valid signature', () => {
    const payload = JSON.stringify({ hello: 'nyvex' });
    const secret = 'top-secret';
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(verifyHmac(payload, sig, secret)).toBe(true);
  });

  it('rejects invalid signature', () => {
    expect(verifyHmac('{"x":1}', 'wrong', 'top-secret')).toBe(false);
  });
});
