import type { ProductSummary } from '../products/types';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartLine {
  product: ProductSummary;
  quantity: number;
  lineTotalCents: number;
}

export type CartIssueType = 'NOT_FOUND' | 'INACTIVE' | 'INSUFFICIENT_STOCK';

export interface CartIssue {
  productId: string;
  type: CartIssueType;
  available?: number;
}

export interface CartValidationResult {
  items: CartLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  issues: CartIssue[];
}
