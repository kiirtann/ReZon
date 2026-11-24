import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../lib/apiClient';
import type { CreateOrderInput, CreateOrderResponse, Order } from './types';

export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => ['orders', orderId] as const,
};

const PENDING_POLL_INTERVAL_MS = 2000;

/**
 * Creates a PENDING order on the server and returns the Stripe Checkout URL.
 */
export function useCreateOrder() {
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const response = await apiClient.post<ApiResponse<CreateOrderResponse>>('/orders', input);
      return response.data;
    },
  });
}

/**
 * Fetches an order by ID and polls every 2 seconds while its status is `PENDING`
 * (waiting for the Stripe webhook to mark it `PAID`, `CANCELLED`, or `FAILED`).
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
      return response.data;
    },
    enabled: Boolean(orderId),
    refetchInterval: (query) =>
      query.state.data?.status === 'PENDING' ? PENDING_POLL_INTERVAL_MS : false,
  });
}
