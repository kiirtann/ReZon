import { Link, useParams } from 'react-router-dom';
import { Container } from '../components/layout';
import { Alert, Card, CardContent, CardHeader, Price, Skeleton } from '../components/ui';
import { useOrder } from '../features/orders/api';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { ApiError } from '../lib/apiClient';

function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

function getOrderErrorInfo(error: unknown): {
  title: string;
  message: string;
  canRetry: boolean;
} {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return {
        title: 'Order not found',
        message: 'We could not find an order with that ID.',
        canRetry: false,
      };
    }
    if (error.status === 403) {
      return {
        title: 'Access denied',
        message: 'You do not have permission to view this order.',
        canRetry: false,
      };
    }
  }
  return {
    title: 'Could not load order',
    message: 'Something went wrong while loading this order. Please try again.',
    canRetry: true,
  };
}

/**
 * Displays the full details of a single order (`/orders/:id`):
 * status, timestamps, line items, shipping address, and totals breakdown.
 */
export function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const orderQuery = useOrder(id);

  if (orderQuery.isLoading) {
    return (
      <Container className="py-8">
        <div className="mx-auto max-w-3xl space-y-6" aria-label="Loading order details">
          <Skeleton className="h-4 w-32" />
          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-56" />
          </Card>
          <Card padding="lg" className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
        </div>
      </Container>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    const { title, message, canRetry } = getOrderErrorInfo(orderQuery.error);

    return (
      <Container className="py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <Alert
            variant="danger"
            title={title}
            onRetry={canRetry ? () => orderQuery.refetch() : undefined}
          >
            <p>{message}</p>
          </Alert>
          <div>
            <Link
              to="/orders"
              className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              ← Back to orders
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const order = orderQuery.data;
  const { shippingAddress } = order;

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            to="/orders"
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Back to orders
          </Link>
        </div>

        <Card padding="lg">
          <CardHeader className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-text">
                Order <span className="font-mono">#{order.id}</span>
              </h1>
              <p className="text-sm text-muted">Placed on {formatDateTime(order.createdAt)}</p>
              {order.paidAt && (
                <p className="text-sm text-muted">Paid on {formatDateTime(order.paidAt)}</p>
              )}
            </div>
            <OrderStatusBadge status={order.status} size="md" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
                Items
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium text-muted">
                      <th className="py-2 pr-4">Product</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit price</th>
                      <th className="py-2 pl-4 text-right">Line total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="py-3 pr-4 font-medium text-text">{item.productName}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-muted">
                          <Price cents={item.unitPriceCents} currency={order.currency} />
                        </td>
                        <td className="py-3 pl-4 text-right font-medium text-text">
                          <Price
                            cents={item.unitPriceCents * item.quantity}
                            currency={order.currency}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-2">
              <div className="space-y-1.5 text-sm">
                <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
                  Shipping address
                </h2>
                <address className="not-italic leading-relaxed text-text">
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.line1}</p>
                  {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.country}</p>
                  <p className="text-muted">Phone: {shippingAddress.phone}</p>
                </address>
              </div>

              <div className="space-y-2 text-sm">
                <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">
                  Order summary
                </h2>
                <dl className="space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="font-medium text-text">
                      <Price cents={order.subtotalCents} currency={order.currency} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted">Shipping</dt>
                    <dd className="font-medium text-text">
                      <Price cents={order.shippingCents} currency={order.currency} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-text">
                    <dt>Total</dt>
                    <dd>
                      <Price cents={order.totalCents} currency={order.currency} />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
