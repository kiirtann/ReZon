import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../components/layout';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Price,
  QuantityStepper,
  Skeleton,
} from '../components/ui';
import { useProduct } from '../features/products/api';
import { useCartStore } from '../features/cart/store';
import { ApiError } from '../lib/apiClient';

/**
 * Product detail page (`/products/:slug`) showing gallery image, category,
 * pricing, stock availability, quantity stepper, and add-to-cart action.
 */
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState<{ quantity: number; name: string } | null>(
    null,
  );

  const addItem = useCartStore((s) => s.addItem);
  const productQuery = useProduct(slug);
  const product = productQuery.data;

  if (productQuery.isLoading) {
    return (
      <Container className="py-8">
        <Skeleton className="mb-6 h-4 w-56" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>
      </Container>
    );
  }

  if (productQuery.isError) {
    const isNotFound = productQuery.error instanceof ApiError && productQuery.error.status === 404;

    if (isNotFound) {
      return (
        <Container className="py-12">
          <EmptyState
            title="Product not found"
            description="This product may have been removed or is no longer available."
            action={
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Browse all products
              </Link>
            }
          />
        </Container>
      );
    }

    return (
      <Container className="py-12">
        <Alert
          variant="danger"
          title="Could not load product"
          onRetry={() => productQuery.refetch()}
        >
          Unable to load product details right now. Please try again.
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return null;
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  function handleAddToCart() {
    if (!product || isOutOfStock) return;
    addItem(product.id, quantity);
    setAddedFeedback({ quantity, name: product.name });
  }

  return (
    <Container className="py-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        <Link
          to="/"
          className="rounded-sm hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to="/products"
          className="rounded-sm hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/products?category=${encodeURIComponent(product.category.slug)}`}
          className="rounded-sm hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {product.category.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-medium text-text">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <img
            src={product.imageUrl}
            alt={product.name}
            decoding="async"
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-start space-y-5">
          <div>
            <Link
              to={`/products?category=${encodeURIComponent(product.category.slug)}`}
              className="inline-block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Badge variant="neutral" size="md">
                {product.category.name}
              </Badge>
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text sm:text-3xl">
              {product.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Price cents={product.priceCents} className="text-2xl font-bold text-text" />
            {isOutOfStock ? (
              <Badge variant="danger" size="md">
                Out of stock
              </Badge>
            ) : isLowStock ? (
              <Badge variant="warning" size="md">
                Only {product.stock} left
              </Badge>
            ) : (
              <Badge variant="success" size="md">
                In stock
              </Badge>
            )}
          </div>

          <p className="leading-relaxed text-muted">{product.description}</p>

          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-text">Quantity</span>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={Math.max(1, product.stock)}
                disabled={isOutOfStock}
              />
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="w-full sm:w-auto sm:min-w-52"
            >
              {isOutOfStock ? 'Out of stock' : 'Add to cart'}
            </Button>

            {addedFeedback && (
              <Alert variant="success" title="Added to cart">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Added {addedFeedback.quantity} × &ldquo;{addedFeedback.name}&rdquo; to your
                    cart.
                  </span>
                  <Link
                    to="/cart"
                    className="font-semibold underline underline-offset-2 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    View cart
                  </Link>
                </div>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
