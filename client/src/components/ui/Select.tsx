import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

/**
 * Native `<select>` primitive styled to match `Input`.
 * Uses `forwardRef` for `react-hook-form` compatibility.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { error = false, className = '', children, ...rest },
  ref,
) {
  const borderClass = error
    ? 'border-danger focus-visible:outline-danger'
    : 'border-border focus-visible:outline-primary';

  return (
    <select
      ref={ref}
      aria-invalid={error || undefined}
      className={`w-full rounded-md border bg-bg px-3 py-2 text-sm text-text focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 ${borderClass} ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
});
