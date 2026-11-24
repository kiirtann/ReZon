import { Link, useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout';
import { Alert, Card, CardContent } from '../components/ui';

/**
 * Stripe Checkout cancel return page (`/checkout/cancel`).
 * Reassures the user their cart is preserved and links back to `/cart` and `/products`.
 */
export function CheckoutCancelPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-xl">
        <Card padding="lg">
          <CardContent className="space-y-5">
            <Alert variant="warning" title="Payment cancelled">
              Your Stripe Checkout session was cancelled, and no charge was made. Your cart items
              are still saved.
            </Alert>

            {orderId && (
              <p className="text-xs text-muted">
                Reference order: <span className="font-mono text-text">#{orderId}</span>
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                to="/cart"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Return to cart
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Continue shopping
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
