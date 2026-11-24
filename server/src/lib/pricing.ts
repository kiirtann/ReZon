/**
 * Shared cart & order pricing rules (server-side source of truth).
 * All monetary amounts are integers in minor units (paise for INR, cents for USD).
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 99_900; // ₹999.00
export const STANDARD_SHIPPING_CENTS = 4_900; // ₹49.00

export interface PricedLine {
  unitPriceCents: number;
  quantity: number;
}

export interface OrderTotals {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

/**
 * Computes shipping in minor units:
 * - ₹0 for an empty cart (subtotal <= 0)
 * - ₹0 when subtotal is at or above ₹999 (99,900 paise)
 * - ₹49 (4,900 paise) otherwise
 */
export function computeShippingCents(subtotalCents: number): number {
  if (subtotalCents <= 0) {
    return 0;
  }
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
}

/**
 * Computes subtotal, shipping, and total in minor units from authoritative line items.
 */
export function computeTotals(lines: PricedLine[]): OrderTotals {
  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const shippingCents = computeShippingCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  return {
    subtotalCents,
    shippingCents,
    totalCents,
  };
}
