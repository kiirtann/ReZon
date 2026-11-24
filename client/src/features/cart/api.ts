import { useQuery } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../lib/apiClient';
import type { CartItem, CartValidationResult } from './types';

export const cartKeys = {
  validate: (items: CartItem[]) => ['cart', 'validate', items] as const,
};

/**
 * Validates the persisted client cart against server prices, shipping rules, and stock.
 */
export function useCartValidation(items: CartItem[]) {
  return useQuery({
    queryKey: cartKeys.validate(items),
    queryFn: async () => {
      const response = await apiClient.post<ApiResponse<CartValidationResult>>('/cart/validate', {
        items,
      });
      return response.data;
    },
    enabled: items.length > 0,
  });
}
