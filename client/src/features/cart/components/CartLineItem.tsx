import { Link } from 'react-router-dom';
import { Alert, Button, Card, Price, QuantityStepper } from '../../../components/ui';
import type { CartIssue, CartLine } from '../types';

export interface CartLineItemProps {
  line: CartLine;
  currency?: string;
  issue?: CartIssue;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

/**
 * Single product row in `/cart` with thumbnail, unit price, quantity stepper,
 * line total, remove action, and inline stock/availability warning if flagged.
 */
export function CartLineItem({
  line,
  currency = 'INR',
  issue,
  onUpdateQuantity,
  onRemove,
}: CartLineItemProps) {
  const { product, quantity, lineTotalCents } = line;
  const maxStepperQty = Math.min(99, Math.max(1, product.stock));

  return (
    <Card padding="md" className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            to={`/products/${product.slug}`}
            className="shrink-0 overflow-hidden rounded-md border border-border bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-20 w-20 object-cover sm:h-24 sm:w-24"
            />
          </Link>

          <div className="min-w-0 space-y-1">
            <Link
              to={`/products/${product.slug}`}
              className="block font-semibold text-text hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {product.name}
            </Link>
            <p className="text-xs text-muted">{product.category.name}</p>
            <p className="text-sm text-muted">
              Unit price: <Price cents={product.priceCents} currency={currency} />
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
          <QuantityStepper
            value={quantity}
            min={1}
            max={maxStepperQty}
            onChange={(next) => onUpdateQuantity(product.id, next)}
            label={`Quantity for ${product.name}`}
          />

          <div className="min-w-24 text-right">
            <Price cents={lineTotalCents} currency={currency} className="font-semibold text-text" />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(product.id)}
            aria-label={`Remove ${product.name} from cart`}
            className="text-danger hover:bg-danger-bg hover:text-danger"
          >
            Remove
          </Button>
        </div>
      </div>

      {issue && issue.type === 'INSUFFICIENT_STOCK' && (
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {issue.available && issue.available > 0
                ? `Only ${issue.available} left in stock. Adjust quantity to continue.`
                : 'This item is currently out of stock.'}
            </span>
            {issue.available && issue.available > 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onUpdateQuantity(product.id, issue.available!)}
              >
                Set to {issue.available}
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onRemove(product.id)}
              >
                Remove item
              </Button>
            )}
          </div>
        </Alert>
      )}

      {issue && (issue.type === 'NOT_FOUND' || issue.type === 'INACTIVE') && (
        <Alert variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>This product is no longer available.</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onRemove(product.id)}
            >
              Remove item
            </Button>
          </div>
        </Alert>
      )}
    </Card>
  );
}
