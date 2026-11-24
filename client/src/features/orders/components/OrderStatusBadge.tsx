import { Badge, type BadgeSize, type BadgeVariant } from '../../../components/ui';
import type { OrderStatus } from '../../checkout/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  PAID: { label: 'Paid', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'neutral' },
  FAILED: { label: 'Failed', variant: 'danger' },
};

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: BadgeSize;
  className?: string;
}

/**
 * Maps an `OrderStatus` enum value to a semantic `Badge` variant and human-readable label.
 */
export function OrderStatusBadge({ status, size = 'sm', className }: OrderStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status];

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  );
}
