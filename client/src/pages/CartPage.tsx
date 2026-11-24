import { Link } from 'react-router-dom';
import { Container } from '../components/layout';
import { Alert, Button, Card, EmptyState, Skeleton } from '../components/ui';
import { useCartValidation } from '../features/cart/api';
import { CartLineItem } from '../features/cart/components/CartLineItem';
import { CartSummary } from '../features/cart/components/CartSummary';
import { selectCartCount, useCartStore } from '../features/cart/store';
import type { CartIssue } from '../features/cart/types';

/**
 * Shopping cart page (`/cart`) reading persisted `{ productId, quantity }` items
 * from Zustand and validating prices, shipping, and stock against `POST /cart/validate`.
 */
export function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const itemCount = useCartStore(selectCartCount);

  const validationQuery = useCartValidation(items);

  if (items.length === 0) {
    return (
      <Container className="py-12">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Your Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added any products yet."
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
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Your Cart</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2].map((n) => (
              <Card key={n} padding="md">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </Card>
            ))}
          </div>
          <div>
            <Card padding="lg" className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  if (validationQuery.isError) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Your Cart</h1>
        <Alert
          variant="danger"
          title="Could not validate your cart"
          onRetry={() => validationQuery.refetch()}
        >
          Unable to verify current prices and stock. Please try again.
        </Alert>
      </Container>
    );
  }

  const data = validationQuery.data;
  if (!data) {
    return null;
  }

  const issueByProductId = new Map<string, CartIssue>();
  for (const issue of data.issues) {
    issueByProductId.set(issue.productId, issue);
  }

  const unavailableIssues = data.issues.filter(
    (issue) => issue.type === 'NOT_FOUND' || issue.type === 'INACTIVE',
  );
  const hasBlockingIssues = data.issues.length > 0;

  function handleRemoveUnavailable() {
    for (const issue of unavailableIssues) {
      removeItem(issue.productId);
    }
  }

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <Link
          to="/products"
          className="text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Continue shopping
        </Link>
      </div>

      {unavailableIssues.length > 0 && (
        <Alert variant="danger" title="Some items are no longer available" className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {unavailableIssues.length}{' '}
              {unavailableIssues.length === 1 ? 'item in your cart is' : 'items in your cart are'}{' '}
              unavailable or removed from the catalog.
            </span>
            <Button type="button" variant="secondary" size="sm" onClick={handleRemoveUnavailable}>
              Remove unavailable {unavailableIssues.length === 1 ? 'item' : 'items'}
            </Button>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {data.items.map((line) => (
            <CartLineItem
              key={line.product.id}
              line={line}
              currency={data.currency}
              issue={issueByProductId.get(line.product.id)}
              onUpdateQuantity={setQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div>
          <CartSummary
            subtotalCents={data.subtotalCents}
            shippingCents={data.shippingCents}
            totalCents={data.totalCents}
            currency={data.currency}
            itemCount={itemCount}
            hasBlockingIssues={hasBlockingIssues}
          />
        </div>
      </div>
    </Container>
  );
}
