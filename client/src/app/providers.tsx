import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

export interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root application providers (TanStack Query, and later auth/toast contexts).
 */
export function Providers({ children }: ProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
