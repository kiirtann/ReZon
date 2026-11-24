import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardFooter, CardHeader, Price } from '../../../components/ui';

export interface CartSummaryProps {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency?: string;
  itemCount: number;
  hasBlockingIssues: boolean;
  isLoading?: boolean;
}

/**
 * Order summary panel on `/cart` showing server-calculated subtotal,
 * shipping (with free shipping hint), total, and checkout CTA.
 */
export function CartSummary({
  subtotalCents,
  shippingCents,
  totalCents,
  currency = 'INR',
  itemCount,
  hasBlockingIssues,
  isLoading = false,
}: CartSummaryProps) {
  const navigate = useNavigate();
  const isCheckoutDisabled = itemCount === 0 || hasBlockingIssues || isLoading;

  return (
    <Card padding="lg" className="sticky top-20">
      <CardHeader>
        <h2 className="text-lg font-semibold text-text">Order Summary</h2>
        <p className="text-sm text-muted">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
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

        <p className="text-xs text-muted">
          {shippingCents === 0 && subtotalCents > 0
            ? 'You qualify for free shipping!'
            : 'Free shipping on orders ₹999+'}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-text">
          <span>Total</span>
          <Price cents={totalCents} currency={currency} />
        </div>
      </CardContent>

      <CardFooter className="mt-4">
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={isCheckoutDisabled}
          onClick={() => navigate('/checkout')}
          className="w-full"
        >
          Proceed to checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
