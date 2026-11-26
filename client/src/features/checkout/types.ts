import type { CartItem } from '../cart/types';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
  paidAt: string | null;
}

export interface CreateOrderInput {
  items: CartItem[];
  shippingAddress: ShippingAddress;
}

export interface CreateOrderResponse {
  order: Order;
  checkoutUrl: string;
}

export interface SavedAddress extends ShippingAddress {
  id: string;
  label: string | null;
  isDefault: boolean;
}

export interface CreateAddressInput extends ShippingAddress {
  label?: string;
  isDefault?: boolean;
}
