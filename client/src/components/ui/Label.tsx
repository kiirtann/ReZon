import type { LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

/**
 * Accessible form label with an optional required indicator.
 */
export function Label({ required = false, className = '', children, ...rest }: LabelProps) {
  return (
    <label className={`block text-sm font-medium text-text ${className}`} {...rest}>
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-danger">
          *
        </span>
      )}
    </label>
  );
}
