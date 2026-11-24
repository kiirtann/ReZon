import { useQuery } from '@tanstack/react-query';
import { apiClient, type ApiResponse, type PaginatedResponse } from '../../lib/apiClient';
import type { Category, Product, ProductsQueryParams, ProductSummary } from './types';

export const productKeys = {
  all: ['products'] as const,
  categories: ['categories'] as const,
  list: (params: ProductsQueryParams) => ['products', 'list', params] as const,
  detail: (slug: string) => ['products', 'detail', slug] as const,
};

export function buildProductsQueryString(params: ProductsQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.minPrice !== undefined && !Number.isNaN(params.minPrice)) {
    searchParams.set('minPrice', String(params.minPrice));
  }
  if (params.maxPrice !== undefined && !Number.isNaN(params.maxPrice)) {
    searchParams.set('maxPrice', String(params.maxPrice));
  }
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.page !== undefined && params.page > 0) {
    searchParams.set('page', String(params.page));
  }
  if (params.limit !== undefined && params.limit > 0) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
      return response.data;
    },
  });
}

export function useProducts(params: ProductsQueryParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProductSummary>>(
        `/products${buildProductsQueryString(params)}`,
      ),
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(slug ?? ''),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Product>>(
        `/products/${encodeURIComponent(slug!)}`,
      );
      return response.data;
    },
    enabled: Boolean(slug),
  });
}
