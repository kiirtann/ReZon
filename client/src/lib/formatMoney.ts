/**
 * Formats integer minor units (e.g. paise or cents) into a localized currency string.
 * Money is stored as integers across the stack to avoid floating-point rounding bugs.
 */
export function formatMoney(cents: number, currency = 'INR'): string {
  const normalizedCurrency = currency.toUpperCase();
  const locale = normalizedCurrency === 'INR' ? 'en-IN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalizedCurrency,
  }).format(cents / 100);
}
