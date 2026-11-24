import { Card, CardContent, CardHeader, Price } from '../../../components/ui';
import type { CartLine } from '../../cart/types';

export interface OrderSummaryProps {
  items: CartLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency?: string;
}

/**
 * Read-only order summary panel on `/checkout` displaying server-validated
 * line items, subtotal, shipping, and total.
 */
export function OrderSummary({
  items,
  subtotalCents,
  shippingCents,
  totalCents,
  currency = 'INR',
}: OrderSummaryProps) {
  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Card padding="lg" className="sticky top-20">
      <CardHeader>
        <h2 className="text-lg font-semibold text-text">Order Summary</h2>
        <p className="text-sm text-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="divide-y divide-border text-sm">
          {items.map((line) => (
            <li key={line.product.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text">{line.product.name}</p>
                <p className="text-xs text-muted">Qty: {line.quantity}</p>
              </div>
              <Price
                cents={line.lineTotalCents}
                currency={currency}
                className="shrink-0 font-medium text-text"
              />
            </li>
          ))}
        </ul>

        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted">Subtotal</span>
            <Price cents={subtotalCents} currency={currency} className="font-medium text-text" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted">Shipping</span>
            {shippingCents === 0 ? (
              <span className="font-medium text-success">Free</span>
            ) : (
              <Price cents={shippingCents} currency={currency} className="font-medium text-text" />
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-text">
            <span>Total</span>
            <Price cents={totalCents} currency={currency} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
