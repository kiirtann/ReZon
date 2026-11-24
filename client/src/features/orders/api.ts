import { useQuery } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../lib/apiClient';
import { orderKeys, useOrder } from '../checkout/api';
import type { Order } from '../checkout/types';

export { orderKeys, useOrder };

/**
 * Fetches the authenticated user's order history, ordered newest first.
 */
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
      return response.data;
    },
  });
}
