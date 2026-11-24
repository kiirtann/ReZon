import { Link } from 'react-router-dom';
import { Container } from '../components/layout';
import { Alert, Card, EmptyState, Skeleton } from '../components/ui';
import { useCartValidation } from '../features/cart/api';
import { useCartStore } from '../features/cart/store';
import { useCreateOrder } from '../features/checkout/api';
import { AddressForm } from '../features/checkout/components/AddressForm';
import { OrderSummary } from '../features/checkout/components/OrderSummary';
import type { ShippingAddress } from '../features/checkout/types';
import { ApiError } from '../lib/apiClient';

/**
 * Protected checkout page (`/checkout`).
 * Validates the persisted cart against the server, collects a shipping address,
 * creates a PENDING order via `POST /orders`, and redirects to Stripe Checkout.
 */
export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const validationQuery = useCartValidation(items);
  const createOrderMutation = useCreateOrder();

  if (items.length === 0) {
    return (
      <Container className="py-12">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Checkout</h1>
        <EmptyState
          title="Your cart is empty"
          description="Add some products to your cart before checking out."
          action={
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Browse products
            </Link>
          }
        />
      </Container>
    );
  }

  if (validationQuery.isLoading) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Checkout</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card padding="lg" className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-11 w-full" />
            </Card>
          </div>
          <div>
            <Card padding="lg" className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-full" />
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  if (validationQuery.isError) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Checkout</h1>
        <Alert
          variant="danger"
          title="Could not validate your cart"
          onRetry={() => validationQuery.refetch()}
        >
          Unable to verify current prices and stock before checkout. Please try again.
        </Alert>
      </Container>
    );
  }

  const data = validationQuery.data;
  if (!data) {
    return null;
  }

  const hasBlockingIssues = data.issues.length > 0;

  const orderError = createOrderMutation.error;
  const isConflictError = orderError instanceof ApiError && orderError.status === 409;
  const orderErrorMessage =
    orderError instanceof ApiError
      ? orderError.message
      : orderError instanceof Error
        ? orderError.message
        : 'Unable to create your order. Please try again.';

  function handleAddressSubmit(shippingAddress: ShippingAddress) {
    if (hasBlockingIssues || validationQuery.isLoading) {
      return;
    }

    createOrderMutation.mutate(
      { items, shippingAddress },
      {
        onSuccess: ({ checkoutUrl }) => {
          window.location.assign(checkoutUrl);
        },
      },
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">Checkout</h1>
        <Link
          to="/cart"
          className="text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Back to cart
        </Link>
      </div>

      {hasBlockingIssues && (
        <Alert variant="warning" title="Cart issues must be resolved" className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Some items in your cart have stock or availability changes. Return to your cart to
              update them before paying.
            </span>
            <Link
              to="/cart"
              className="font-semibold underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Review cart
            </Link>
          </div>
        </Alert>
      )}

      {createOrderMutation.isError && (
        <Alert
          variant="danger"
          title={isConflictError ? 'Stock or availability changed' : 'Checkout failed'}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{orderErrorMessage}</span>
            {isConflictError && (
              <Link
                to="/cart"
                className="font-semibold underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Return to cart
              </Link>
            )}
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AddressForm
            onSubmit={handleAddressSubmit}
            isSubmitting={createOrderMutation.isPending}
            disabled={hasBlockingIssues}
          />
        </div>

        <div>
          <OrderSummary
            items={data.items}
            subtotalCents={data.subtotalCents}
            shippingCents={data.shippingCents}
            totalCents={data.totalCents}
            currency={data.currency}
          />
        </div>
      </div>
    </Container>
  );
}
