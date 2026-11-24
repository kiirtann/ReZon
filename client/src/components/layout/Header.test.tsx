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
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('rezone-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays the cart icon link with live count badge from the cart store', () => {
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

  it('shows default emoji profile icon for guests, no Menu button, and opens guest dropdown', () => {
    renderHeader({ user: null });

    expect(screen.getByRole('link', { name: /Re\s*Zone/i })).toHaveAttribute('href', '/');
    expect(
      screen.queryByRole('button', { name: /toggle navigation menu/i }),
    ).not.toBeInTheDocument();

    const profileBtn = screen.getByRole('button', { name: /profile menu/i });
    expect(profileBtn).toHaveTextContent('👤');

    fireEvent.click(profileBtn);
    expect(screen.getByRole('menu', { name: /profile options/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /sign in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('menuitem', { name: /create account/i })).toHaveAttribute(
      'href',
      '/register',
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu', { name: /profile options/i })).not.toBeInTheDocument();
  });

  it('shows profile circle + username and order actions in dropdown, and signs out on click', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { ok: true } });

    renderHeader({
      initialEntry: '/orders',
      user: { id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace' },
    });

    const profileBtn = screen.getByRole('button', { name: /profile menu/i });
    expect(profileBtn).toHaveTextContent('AL');

    fireEvent.click(profileBtn);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /my profile/i })).toHaveAttribute(
      'href',
      '/profile',
    );
    expect(screen.getByRole('menuitem', { name: /my orders/i })).toHaveAttribute('href', '/orders');
    expect(screen.getByRole('menuitem', { name: /checkout/i })).toHaveAttribute(
      'href',
      '/checkout',
    );
    expect(screen.queryByRole('menuitem', { name: /my cart/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: /sign out/i }));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/logout');
    });
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/');
    });
  });

  it('toggles dark and light mode via the sun/moon icon switch near Cart', () => {
    renderHeader({ user: null });

    const themeBtn = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(themeBtn).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('rezone-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
