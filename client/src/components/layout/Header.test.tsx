import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authKeys } from '../../features/auth/api';
import { useCartStore } from '../../features/cart/store';
import { ApiError, apiClient } from '../../lib/apiClient';
import { Header } from './Header';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderHeader(options?: {
  initialEntry?: string;
  user?: { id: string; email: string; name: string } | null;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  if (options?.user !== undefined) {
    queryClient.setQueryData(authKeys.me, options.user);
  }

  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[options?.initialEntry ?? '/']}>
        <Header />
        <Routes>
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return { ...view, queryClient };
}

describe('Header', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays the live cart count badge from the cart store', () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue(
      new ApiError(401, 'UNAUTHENTICATED', 'Not signed in'),
    );

    useCartStore.setState({
      items: [
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 3 },
      ],
    });

    renderHeader({ user: null });

    const cartLink = screen.getByRole('link', { name: 'Cart, 5 items' });
    expect(cartLink).toHaveAttribute('href', '/cart');
    expect(cartLink).toHaveTextContent('5');
  });

  it('navigates to /products?search=... on search submit', () => {
    renderHeader({ user: null });

    const searchInput = screen.getByLabelText(/search products/i);
    fireEvent.change(searchInput, { target: { value: '  wireless mouse  ' } });
    fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/products?search=wireless%20mouse');
  });

  it('shows Login and Register links for guest users', () => {
    renderHeader({ user: null });

    expect(screen.getByRole('link', { name: /^login$/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /^register$/i })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('shows user name and Sign out button for authenticated users, and logs out on click', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { ok: true } });

    renderHeader({
      initialEntry: '/orders',
      user: { id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace' },
    });

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^orders$/i })).toHaveAttribute('href', '/orders');

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/logout');
    });
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/');
    });
  });
});
