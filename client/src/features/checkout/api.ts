import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../lib/apiClient';
import type {
  CreateAddressInput,
  CreateOrderInput,
  CreateOrderResponse,
  Order,
  SavedAddress,
} from './types';

export const orderKeys = {
  all: ['orders'] as const,
  detail: (orderId: string) => ['orders', orderId] as const,
};

export const addressKeys = {
  all: ['addresses'] as const,
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

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.all,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SavedAddress[]>>('/addresses');
      return response.data;
    },
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAddressInput) => {
      const response = await apiClient.post<ApiResponse<SavedAddress>>('/addresses', input);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await apiClient.patch<ApiResponse<SavedAddress>>(
        `/addresses/${addressId}/default`,
      );
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      await apiClient.delete<void>(`/addresses/${addressId}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}
