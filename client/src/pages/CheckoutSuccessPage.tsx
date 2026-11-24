import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout';
import { Alert, Badge, Card, CardContent, CardHeader, Price, Spinner } from '../components/ui';
import { useCartStore } from '../features/cart/store';
import { useOrder } from '../features/checkout/api';

/**
 * Stripe Checkout success return page (`/checkout/success?orderId=...`).
 * Polls `GET /orders/:id` while `PENDING`, clears the cart once `PAID`,
 * and shows order confirmation or failure feedback.
 */
export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const clearCart = useCartStore((s) => s.clear);

  const orderQuery = useOrder(orderId);
  const order = orderQuery.data;

  useEffect(() => {
    if (order?.status === 'PAID') {
      clearCart();
    }
  }, [order?.status, clearCart]);

  if (!orderId) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-xl">
          <Alert variant="danger" title="Missing order reference">
            <p>We could not find an order ID in the confirmation URL.</p>
            <div className="mt-3 flex flex-wrap gap-4">
              <Link to="/cart" className="font-semibold underline hover:no-underline">
                Return to cart
              </Link>
              <Link to="/products" className="font-semibold underline hover:no-underline">
                Browse products
              </Link>
            </div>
          </Alert>
        </div>
      </Container>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-xl">
          <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
            <Spinner size="lg" label="Confirming your payment" />
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-text">Confirming your payment…</h1>
              <p className="text-sm text-muted">
                Please wait while we verify your payment with Stripe.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-xl space-y-4">
          <Alert
            variant="danger"
            title="Could not load order status"
            onRetry={() => orderQuery.refetch()}
          >
            Unable to confirm your order status right now.
          </Alert>
          <div className="text-center">
            <Link
              to="/cart"
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Return to cart
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  if (order.status === 'PENDING') {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-xl">
          <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
            <Spinner size="lg" label="Confirming your payment" />
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-text">Confirming your payment…</h1>
              <p className="text-sm text-muted">
                Order <span className="font-mono text-text">#{order.id}</span> is awaiting webhook
                confirmation. This usually takes just a few seconds.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  if (order.status === 'CANCELLED' || order.status === 'FAILED') {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-xl">
          <Alert variant="danger" title="Payment was not completed">
            <p>
              Order <span className="font-mono">#{order.id}</span> has status{' '}
              <strong>{order.status}</strong>. No payment was captured.
            </p>
            <div className="mt-3">
              <Link to="/cart" className="font-semibold underline hover:no-underline">
                Return to cart
              </Link>
            </div>
          </Alert>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="success" title="Order confirmed!">
          Thank you for your purchase. Your payment has been received.
        </Alert>

        <Card padding="lg">
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-text">Order #{order.id}</h1>
              <p className="text-sm text-muted">
                We have cleared your cart and recorded your order.
              </p>
            </div>
            <Badge variant="success">{order.status}</Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <ul className="divide-y divide-border text-sm">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-4 py-2.5">
                  <div>
                    <p className="font-medium text-text">{item.productName}</p>
                    <p className="text-xs text-muted">Qty: {item.quantity}</p>
                  </div>
                  <Price
                    cents={item.unitPriceCents * item.quantity}
                    currency={order.currency}
                    className="font-medium text-text"
                  />
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Subtotal</span>
                <Price
                  cents={order.subtotalCents}
                  currency={order.currency}
                  className="font-medium text-text"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Shipping</span>
                {order.shippingCents === 0 ? (
                  <span className="font-medium text-success">Free</span>
                ) : (
                  <Price
                    cents={order.shippingCents}
                    currency={order.currency}
                    className="font-medium text-text"
                  />
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold text-text">
                <span>Total</span>
                <Price cents={order.totalCents} currency={order.currency} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={`/orders/${order.id}`}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                View order
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
