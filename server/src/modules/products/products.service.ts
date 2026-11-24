import type { Prisma } from '@prisma/client';
import { notFoundError } from '../../lib/errors.js';
import { prisma } from '../../lib/prisma.js';
import type { CategoryDto } from '../categories/categories.service.js';
import type { ListProductsQuery } from './products.schema.js';

export interface ProductSummaryDto {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  category: CategoryDto;
}

export interface ProductDetailDto extends ProductSummaryDto {
  description: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const productSummarySelect = {
  id: true,
  name: true,
  slug: true,
  priceCents: true,
  imageUrl: true,
  stock: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect;

const productDetailSelect = {
  ...productSummarySelect,
  description: true,
} satisfies Prisma.ProductSelect;

function buildOrderBy(sort: ListProductsQuery['sort']): Prisma.ProductOrderByWithRelationInput[] {
  // Secondary sort by id keeps pagination deterministic when primary sort keys tie.
  switch (sort) {
    case 'price_asc':
      return [{ priceCents: 'asc' }, { id: 'asc' }];
    case 'price_desc':
      return [{ priceCents: 'desc' }, { id: 'asc' }];
    case 'name_asc':
      return [{ name: 'asc' }, { id: 'asc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }, { id: 'asc' }];
  }
}

/**
 * Lists active products matching optional search, category, and price filters with pagination.
 */
export async function listProducts(
  query: ListProductsQuery,
): Promise<{ data: ProductSummaryDto[]; meta: PaginationMeta }> {
  const { search, category, minPrice, maxPrice, sort, page, limit } = query;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(search
      ? {
          OR: [{ name: { contains: search } }, { description: { contains: search } }],
        }
      : {}),
    ...(category
      ? {
          category: { slug: category },
        }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          priceCents: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const skip = (page - 1) * limit;
  const orderBy = buildOrderBy(sort);

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: productSummarySelect,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Fetches a single active product by slug, or throws 404 NOT_FOUND.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetailDto> {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: productDetailSelect,
  });

  if (!product) {
    throw notFoundError('Product not found');
  }

  return product;
}
