import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/**
 * Text/number/email/password input primitive.
 * Uses `forwardRef` so `react-hook-form`'s `register()` can attach its ref directly.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, className = '', ...rest },
  ref,
) {
  const borderClass = error
    ? 'border-danger focus-visible:outline-danger'
    : 'border-border focus-visible:outline-primary';

  return (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={`w-full rounded-md border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 ${borderClass} ${className}`}
      {...rest}
    />
  );
});
