import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Consistent empty/zero-results state for product lists, cart, and order history.
 */
export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface px-6 py-12 text-center ${className}`}
    >
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
