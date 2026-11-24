import { Link } from 'react-router-dom';
import { Container } from '../components/layout';
import { Alert, Card, EmptyState, Skeleton } from '../components/ui';
import { useOrders } from '../features/orders/api';
import { OrderCard } from '../features/orders/components/OrderCard';

/**
 * Displays the authenticated user's past orders (`/orders`), newest first.
 */
export function OrderHistoryPage() {
  const ordersQuery = useOrders();

  if (ordersQuery.isLoading) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Order history</h1>
        <div className="space-y-4" aria-label="Loading orders">
          {[1, 2, 3].map((n) => (
            <Card key={n} padding="md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  if (ordersQuery.isError) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Order history</h1>
        <Alert
          variant="danger"
          title="Could not load your orders"
          onRetry={() => ordersQuery.refetch()}
        >
          Unable to fetch your order history right now. Please try again.
        </Alert>
      </Container>
    );
  }

  const orders = ordersQuery.data ?? [];

  if (orders.length === 0) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Order history</h1>
        <EmptyState
          title="No orders yet"
          description="You haven't placed any orders yet. Start browsing our catalog to find something you love."
          action={
            <Link
              to="/products"
              className="inline-flex h-10 items-center justify-center rounded-sm bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Start shopping
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Order history</h1>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
