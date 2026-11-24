import { Link } from 'react-router-dom';
import { Badge, Card, Price } from '../../../components/ui';
import type { ProductSummary } from '../types';

export interface ProductCardProps {
  product: ProductSummary;
}

/**
 * Displays a single product summary card with image, category badge,
 * title link, formatted price, and out-of-stock indicator.
 */
export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <Card
      padding="none"
      className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <Link
        to={`/products/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block aspect-[4/3] w-full overflow-hidden bg-surface focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="neutral" size="sm">
              {product.category.name}
            </Badge>
            {isOutOfStock && (
              <Badge variant="danger" size="sm">
                Out of stock
              </Badge>
            )}
          </div>

          <h3 className="text-base font-semibold leading-snug text-text">
            <Link
              to={`/products/${product.slug}`}
              className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="pt-1">
          <Price cents={product.priceCents} className="text-base font-bold text-text" />
        </div>
      </div>
    </Card>
  );
}
