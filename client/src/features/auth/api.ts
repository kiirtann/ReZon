import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiClient, type ApiResponse } from '../../lib/apiClient';
import type { LoginInput, RegisterInput, User } from './types';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

/**
 * Fetches the currently authenticated user from `GET /auth/me`.
 * A `401` response means the visitor is logged out, so it resolves to `null`
 * rather than putting the query into an error state.
 */
export function useMe() {
  return useQuery<User | null>({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        return response.data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const response = await apiClient.post<ApiResponse<User>>('/auth/login', input);
      return response.data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const response = await apiClient.post<ApiResponse<User>>('/auth/register', input);
      return response.data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post<void>('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null);
      void queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}
