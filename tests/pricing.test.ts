import { describe, expect, it } from 'vitest';
import { calculateTotalCents } from '@/lib/pricing';

describe('calculateTotalCents', () => {
  it('sums positive lines', () => {
    expect(
      calculateTotalCents([
        { productId: 'a', quantity: 2, unitCents: 500 },
        { productId: 'b', quantity: 1, unitCents: 300 }
      ])
    ).toBe(1300);
  });
});
