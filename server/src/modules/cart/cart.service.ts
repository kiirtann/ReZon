import { env } from '../../config/env.js';
import { computeTotals } from '../../lib/pricing.js';
import { prisma } from '../../lib/prisma.js';
import type { ProductSummaryDto } from '../products/products.service.js';
import type { CartItemInput } from './cart.schema.js';

export interface CartLineDto {
  product: ProductSummaryDto;
  quantity: number;
  lineTotalCents: number;
}

export type CartIssueDto =
  | { productId: string; type: 'NOT_FOUND' }
  | { productId: string; type: 'INACTIVE' }
  | { productId: string; type: 'INSUFFICIENT_STOCK'; available: number };

export interface ValidateCartResult {
  items: CartLineDto[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  issues: CartIssueDto[];
}

/**
 * Validates cart items against authoritative database state.
 * - Merges duplicate productId entries by summing their quantities.
 * - Never trusts client-supplied prices; computes line totals and shipping from DB prices.
 * - Reports NOT_FOUND, INACTIVE, and INSUFFICIENT_STOCK issues.
 * - Active products with stock > 0 are included in `items` with quantity capped at available stock;
 *   out-of-stock active products (stock === 0) are flagged as INSUFFICIENT_STOCK (available: 0)
 *   and excluded from purchasable `items` and totals.
 */
export async function validateCart(rawItems: CartItemInput[]): Promise<ValidateCartResult> {
  const mergedQuantities = new Map<string, number>();
  for (const item of rawItems) {
    mergedQuantities.set(
      item.productId,
      (mergedQuantities.get(item.productId) ?? 0) + item.quantity,
    );
  }

  if (mergedQuantities.size === 0) {
    return {
      items: [],
      subtotalCents: 0,
      shippingCents: 0,
      totalCents: 0,
      currency: env.CURRENCY,
      issues: [],
    };
  }

  const productIds = Array.from(mergedQuantities.keys());
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      imageUrl: true,
      stock: true,
      isActive: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const productById = new Map(products.map((product) => [product.id, product]));
  const items: CartLineDto[] = [];
  const issues: CartIssueDto[] = [];

  for (const [productId, requestedQty] of mergedQuantities.entries()) {
    const product = productById.get(productId);

    if (!product) {
      issues.push({ productId, type: 'NOT_FOUND' });
      continue;
    }

    if (!product.isActive) {
      issues.push({ productId, type: 'INACTIVE' });
      continue;
    }

    if (requestedQty > product.stock) {
      issues.push({ productId, type: 'INSUFFICIENT_STOCK', available: product.stock });
    }

    const effectiveQty = Math.min(requestedQty, product.stock);
    if (effectiveQty <= 0) {
      continue;
    }

    const { isActive: _isActive, ...productSummary } = product;
    void _isActive;
    items.push({
      product: productSummary,
      quantity: effectiveQty,
      lineTotalCents: productSummary.priceCents * effectiveQty,
    });
  }

  const totals = computeTotals(
    items.map((line) => ({
      unitPriceCents: line.product.priceCents,
      quantity: line.quantity,
    })),
  );

  return {
    items,
    ...totals,
    currency: env.CURRENCY,
    issues,
  };
}
