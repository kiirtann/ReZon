import { Link } from 'react-router-dom';
import { Card, Price } from '../../../components/ui';
import type { Order } from '../../checkout/types';
import { OrderStatusBadge } from './OrderStatusBadge';

export interface OrderCardProps {
  order: Order;
}

function formatOrderDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(isoDate));
}

/**
 * Summary card for a single order in the order history list.
 */
export function OrderCard({ order }: OrderCardProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemLabel = totalItems === 1 ? '1 item' : `${totalItems} items`;

  return (
    <Card padding="md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-semibold text-text">
              Order <span className="font-mono">#{order.id}</span>
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted">
            Placed on {formatOrderDate(order.createdAt)} · {itemLabel}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted">Total</p>
            <Price
              cents={order.totalCents}
              currency={order.currency}
              className="text-base font-semibold text-text"
            />
          </div>
          <Link
            to={`/orders/${order.id}`}
            className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-surface px-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View details
          </Link>
        </div>
      </div>
    </Card>
  );
}
