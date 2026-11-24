import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Alert, Badge, Button, Card, CardHeader, Price, Spinner } from '../components/ui';
import { useOrder } from '../features/checkout/api';
import { apiClient, ApiError } from '../lib/apiClient';

/**
 * Development-only Stripe Checkout simulator shown when STRIPE_SECRET_KEY is not set.
 * Triggers the real signed webhook handler on the server so order status, stock
 * decrement, cart clearing, and order history work end-to-end offline.
 */
export function CheckoutSimulatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId') ?? '';

  const orderQuery = useOrder(orderId);

  const simulateMutation = useMutation({
    mutationFn: async (action: 'complete' | 'expire') => {
      await apiClient.post('/webhooks/stripe/simulate', { orderId, action });
      return action;
    },
    onSuccess: (action) => {
      if (action === 'complete') {
        navigate(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
      } else {
        navigate(`/checkout/cancel?orderId=${encodeURIComponent(orderId)}`);
      }
    },
  });

  if (!orderId) {
    return (
      <Container className="max-w-xl py-10">
        <Alert variant="danger" title="Missing order reference">
          No order ID was provided. Return to your{' '}
          <Link to="/cart" className="font-medium underline">
            cart
          </Link>
          .
        </Alert>
      </Container>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <Container className="flex min-h-[50vh] items-center justify-center py-12">
        <Spinner size="lg" label="Loading checkout session" />
      </Container>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <Container className="max-w-xl py-10">
        <Alert variant="danger" title="Could not load order">
          {orderQuery.error instanceof ApiError
            ? orderQuery.error.message
            : 'Unable to load this checkout session.'}
        </Alert>
      </Container>
    );
  }

  const order = orderQuery.data;

  return (
    <Container className="max-w-xl space-y-6 py-10">
      <Alert variant="info" title="Dev Mode: Simulated Stripe Checkout">
        No Stripe API key is set in <code>server/.env</code>. Paying here fires a real signed
        webhook to <code>/api/v1/webhooks/stripe</code> so your order becomes <strong>PAID</strong>{' '}
        and product stock decrements.
      </Alert>

      <Card padding="lg" className="space-y-5">
        <CardHeader className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-text">Complete Payment</h1>
            <p className="text-xs text-muted">Order ID: {order.id}</p>
          </div>
          <Badge variant="warning">Test Card 4242</Badge>
        </CardHeader>

        <ul className="divide-y divide-border text-sm">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between py-2">
              <span className="text-text">
                {item.productName} × {item.quantity}
              </span>
              <Price cents={item.unitPriceCents * item.quantity} currency={order.currency} />
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-text">
          <span>Total due</span>
          <Price cents={order.totalCents} currency={order.currency} />
        </div>

        {simulateMutation.isError && (
          <Alert variant="danger" title="Simulation failed">
            {simulateMutation.error instanceof ApiError
              ? simulateMutation.error.message
              : 'Could not trigger simulated payment.'}
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            className="flex-1"
            loading={simulateMutation.isPending}
            onClick={() => simulateMutation.mutate('complete')}
          >
            Pay now (Test Card 4242)
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={simulateMutation.isPending}
            onClick={() => simulateMutation.mutate('expire')}
          >
            Cancel payment
          </Button>
        </div>
      </Card>
    </Container>
  );
}
