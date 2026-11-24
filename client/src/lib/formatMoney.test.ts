import { describe, expect, it } from 'vitest';
import { formatMoney } from './formatMoney';

describe('formatMoney', () => {
  it('formats INR minor units with Indian grouping by default', () => {
    expect(formatMoney(123450)).toBe('₹1,234.50');
    expect(formatMoney(10000000)).toBe('₹1,00,000.00');
  });

  it('formats zero and negative amounts cleanly', () => {
    expect(formatMoney(0)).toBe('₹0.00');
    expect(formatMoney(-500)).toBe('-₹5.00');
  });

  it('formats other currencies using en-US locale', () => {
    expect(formatMoney(1999, 'USD')).toBe('$19.99');
    expect(formatMoney(2500, 'usd')).toBe('$25.00');
  });
});
