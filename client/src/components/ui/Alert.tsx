import type { ReactNode } from 'react';
import { Button } from './Button';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info: 'bg-info-bg text-info border-info/25',
  success: 'bg-success-bg text-success border-success/25',
  warning: 'bg-warning-bg text-warning border-warning/25',
  danger: 'bg-danger-bg text-danger border-danger/25',
};

/**
 * Inline feedback banner for API errors, stock warnings, and confirmations.
 * Uses `role="alert"` for warning/danger so urgent messages are announced immediately.
 */
export function Alert({
  variant = 'info',
  title,
  children,
  onRetry,
  retryLabel = 'Retry',
  className = '',
}: AlertProps) {
  const role = variant === 'danger' || variant === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={`flex flex-col gap-2 rounded-md border p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <div className="space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="shrink-0 self-start sm:self-center"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
