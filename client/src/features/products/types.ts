export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  category: Category;
}

export interface Product extends ProductSummary {
  description: string;
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

export interface ProductsQueryParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}
