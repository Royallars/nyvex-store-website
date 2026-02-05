import { describe, expect, it } from 'vitest';
import { calculateRankUpgradePrice, calculateTotalCents } from '@/lib/pricing';

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

describe('calculateRankUpgradePrice', () => {
  it('returns difference with floor at zero', () => {
    expect(calculateRankUpgradePrice(499, 1499)).toBe(1000);
    expect(calculateRankUpgradePrice(1499, 499)).toBe(0);
  });
});
