export interface PriceProps {
  /** Integer amount in minor units (e.g. paise or cents). Never pass floats. */
  cents: number;
  currency?: string;
  className?: string;
}

/**
 * Formats integer minor units into a localized currency string.
 * Money is stored as integers across the stack to avoid floating-point rounding bugs.
 */
export function Price({ cents, currency = 'INR', className = '' }: PriceProps) {
  const locale = currency.toUpperCase() === 'INR' ? 'en-IN' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);

  return <span className={`tabular-nums ${className}`}>{formatted}</span>;
}
