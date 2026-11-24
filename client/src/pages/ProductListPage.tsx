import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout';
import { Alert, Badge, Button, EmptyState, Pagination } from '../components/ui';
import { useCategories, useProducts } from '../features/products/api';
import { ProductFilters } from '../features/products/components/ProductFilters';
import { ProductGrid } from '../features/products/components/ProductGrid';
import { SortSelect } from '../features/products/components/SortSelect';
import type { ProductSort } from '../features/products/types';

const VALID_SORTS: ProductSort[] = ['newest', 'price_asc', 'price_desc', 'name_asc'];
const PAGE_LIMIT = 12;

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return undefined;
  return parsed;
}

function parsePage(value: string | null): number {
  const parsed = parsePositiveInt(value);
  return parsed && parsed >= 1 ? parsed : 1;
}

function parseSort(value: string | null): ProductSort {
  if (value && VALID_SORTS.includes(value as ProductSort)) {
    return value as ProductSort;
  }
  return 'newest';
}

/**
 * Product catalog page (`/products`) with URL-synced search, category,
 * price range, sort, and pagination controls.
 */
export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const search = searchParams.get('search')?.trim() || undefined;
  const category = searchParams.get('category')?.trim() || '';
  const minPrice = parsePositiveInt(searchParams.get('minPrice'));
  const maxPrice = parsePositiveInt(searchParams.get('maxPrice'));
  const sort = parseSort(searchParams.get('sort'));
  const page = parsePage(searchParams.get('page'));

  const categoriesQuery = useCategories();
  const productsQuery = useProducts({
    search,
    category: category || undefined,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: PAGE_LIMIT,
  });

  const hasActiveFilters = Boolean(
    search || category || minPrice !== undefined || maxPrice !== undefined || sort !== 'newest',
  );

  function updateParams(updates: Record<string, string | undefined>, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    if (resetPage) {
      next.delete('page');
    }
    setSearchParams(next);
  }

  function handleCategoryChange(nextCategory: string) {
    updateParams({ category: nextCategory || undefined });
    setMobileFiltersOpen(false);
  }

  function handlePriceApply(nextMin?: number, nextMax?: number) {
    updateParams({
      minPrice: nextMin !== undefined ? String(nextMin) : undefined,
      maxPrice: nextMax !== undefined ? String(nextMax) : undefined,
    });
    setMobileFiltersOpen(false);
  }

  function handleSortChange(nextSort: ProductSort) {
    updateParams({ sort: nextSort === 'newest' ? undefined : nextSort });
  }

  function handlePageChange(nextPage: number) {
    updateParams({ page: nextPage <= 1 ? undefined : String(nextPage) }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleClearFilters() {
    setSearchParams(new URLSearchParams());
    setMobileFiltersOpen(false);
  }

  const products = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta;

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Products</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            {meta ? (
              <span>
                {meta.total} {meta.total === 1 ? 'result' : 'results'}
              </span>
            ) : (
              <span>Browse our catalog</span>
            )}
            {search && (
              <Badge variant="primary" size="sm" className="gap-1.5">
                <span>Search: &ldquo;{search}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => updateParams({ search: undefined })}
                  aria-label="Clear search"
                  className="ml-0.5 rounded-full px-1 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            aria-expanded={mobileFiltersOpen}
            className="lg:hidden"
          >
            {mobileFiltersOpen ? 'Hide filters' : 'Filters'}
          </Button>
          <SortSelect value={sort} onChange={handleSortChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside
          aria-label="Product filters"
          className={mobileFiltersOpen ? 'block' : 'hidden lg:block'}
        >
          <ProductFilters
            categories={categoriesQuery.data ?? []}
            categoriesLoading={categoriesQuery.isLoading}
            selectedCategory={category}
            minPriceCents={minPrice}
            maxPriceCents={maxPrice}
            onCategoryChange={handleCategoryChange}
            onPriceApply={handlePriceApply}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        <section aria-label="Product results" className="space-y-8">
          {productsQuery.isError ? (
            <Alert
              variant="danger"
              title="Could not load products"
              onRetry={() => productsQuery.refetch()}
            >
              Something went wrong while fetching the catalog. Please try again.
            </Alert>
          ) : productsQuery.isLoading ? (
            <ProductGrid products={[]} loading skeletonCount={PAGE_LIMIT} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              description="Try adjusting your search query, category, or price range."
              action={
                hasActiveFilters ? (
                  <Button variant="primary" onClick={handleClearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <ProductGrid products={products} />
              {meta && meta.totalPages > 1 && (
                <div className="pt-4">
                  <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </Container>
  );
}
