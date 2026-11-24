import { describe, expect, it } from 'vitest';
import {
  computeShippingCents,
  computeTotals,
  FREE_SHIPPING_THRESHOLD_CENTS,
  STANDARD_SHIPPING_CENTS,
} from './pricing.js';

describe('pricing utilities', () => {
  describe('computeShippingCents', () => {
    it('returns 0 for empty or non-positive subtotals', () => {
      expect(computeShippingCents(0)).toBe(0);
      expect(computeShippingCents(-100)).toBe(0);
    });

    it('returns standard shipping below the free-shipping threshold', () => {
      expect(computeShippingCents(1)).toBe(STANDARD_SHIPPING_CENTS);
      expect(computeShippingCents(FREE_SHIPPING_THRESHOLD_CENTS - 1)).toBe(STANDARD_SHIPPING_CENTS);
    });

    it('returns 0 at the exact free-shipping threshold (99900)', () => {
      expect(FREE_SHIPPING_THRESHOLD_CENTS).toBe(99_900);
      expect(computeShippingCents(99_900)).toBe(0);
    });

    it('returns 0 above the free-shipping threshold', () => {
      expect(computeShippingCents(99_901)).toBe(0);
      expect(computeShippingCents(250_000)).toBe(0);
    });
  });

  describe('computeTotals', () => {
    it('returns all zeros for an empty item list', () => {
      expect(computeTotals([])).toEqual({
        subtotalCents: 0,
        shippingCents: 0,
        totalCents: 0,
      });
    });

    it('adds standard shipping when subtotal is below threshold', () => {
      expect(
        computeTotals([
          { unitPriceCents: 20_000, quantity: 2 },
          { unitPriceCents: 10_000, quantity: 1 },
        ]),
      ).toEqual({
        subtotalCents: 50_000,
        shippingCents: STANDARD_SHIPPING_CENTS,
        totalCents: 50_000 + STANDARD_SHIPPING_CENTS,
      });
    });

    it('waives shipping when subtotal equals the exact threshold (99900)', () => {
      expect(computeTotals([{ unitPriceCents: 33_300, quantity: 3 }])).toEqual({
        subtotalCents: 99_900,
        shippingCents: 0,
        totalCents: 99_900,
      });
    });

    it('waives shipping when subtotal is above the threshold', () => {
      expect(computeTotals([{ unitPriceCents: 60_000, quantity: 2 }])).toEqual({
        subtotalCents: 120_000,
        shippingCents: 0,
        totalCents: 120_000,
      });
    });
  });
});
