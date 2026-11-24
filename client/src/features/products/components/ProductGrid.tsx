import { Card, Skeleton } from '../../../components/ui';
import type { ProductSummary } from '../types';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  products: ProductSummary[];
  loading?: boolean;
  skeletonCount?: number;
}

function ProductCardSkeleton() {
  return (
    <Card padding="none" className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </Card>
  );
}

/**
 * Responsive grid of product cards with skeleton loading state.
 */
export function ProductGrid({ products, loading = false, skeletonCount = 12 }: ProductGridProps) {
  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading products"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
