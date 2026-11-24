import type { HTMLAttributes } from 'react';

export type BadgeVariant = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-surface text-text border-border',
  primary: 'bg-primary text-white border-transparent',
  // Accent uses dark text (#0f172a) on amber (#f59e0b) to maintain >= 4.5:1 WCAG AA contrast.
  accent: 'bg-accent text-text border-transparent',
  success: 'bg-success-bg text-success border-success/20',
  warning: 'bg-warning-bg text-warning border-warning/20',
  danger: 'bg-danger-bg text-danger border-danger/20',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

/**
 * Compact pill for order statuses, stock indicators, and category tags.
 */
export function Badge({
  variant = 'neutral',
  size = 'sm',
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
