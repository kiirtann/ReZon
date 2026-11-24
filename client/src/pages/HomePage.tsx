import { Link } from 'react-router-dom';
import { Container } from '../components/layout';
import { Alert, EmptyState, Skeleton } from '../components/ui';
import { useCategories, useProducts } from '../features/products/api';
import { ProductGrid } from '../features/products/components/ProductGrid';

/**
 * Storefront landing page (`/`) featuring a hero banner, category tiles,
 * and an 8-item featured products grid.
 */
export function HomePage() {
  const categoriesQuery = useCategories();
  const featuredQuery = useProducts({ limit: 8, sort: 'newest' });

  const categories = categoriesQuery.data ?? [];
  const featuredProducts = featuredQuery.data?.data ?? [];

  return (
    <Container className="space-y-12 py-8 sm:py-12">
      {/* Hero section */}
      <section className="rounded-lg border border-border bg-surface px-6 py-10 sm:px-10 sm:py-14">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            ShopLearn Storefront
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Everyday essentials, thoughtfully curated.
          </h1>
          <p className="text-base text-muted sm:text-lg">
            Browse electronics, home goods, apparel, and books—built step by step with clean
            full-stack architecture.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Shop all products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section aria-labelledby="categories-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="categories-heading" className="text-xl font-bold tracking-tight text-text">
            Shop by category
          </h2>
          <Link
            to="/products"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            All products →
          </Link>
        </div>

        {categoriesQuery.isError ? (
          <Alert
            variant="danger"
            title="Could not load categories"
            onRetry={() => categoriesQuery.refetch()}
          >
            Unable to load categories right now.
          </Alert>
        ) : categoriesQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="flex items-center justify-between rounded-md border border-border bg-bg px-4 py-3.5 text-sm font-semibold text-text shadow-card transition-colors hover:border-primary/40 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span>{category.name}</span>
                <span aria-hidden="true" className="text-muted">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured products */}
      <section aria-labelledby="featured-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="featured-heading" className="text-xl font-bold tracking-tight text-text">
            Featured products
          </h2>
          <Link
            to="/products"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            View all →
          </Link>
        </div>

        {featuredQuery.isError ? (
          <Alert
            variant="danger"
            title="Could not load featured products"
            onRetry={() => featuredQuery.refetch()}
          >
            Something went wrong while loading featured products.
          </Alert>
        ) : featuredQuery.isLoading ? (
          <ProductGrid products={[]} loading skeletonCount={8} />
        ) : featuredProducts.length === 0 ? (
          <EmptyState
            title="No featured products yet"
            description="Check back soon as new items are added to the catalog."
          />
        ) : (
          <ProductGrid products={featuredProducts} />
        )}
      </section>
    </Container>
  );
}
