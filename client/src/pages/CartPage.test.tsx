import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from '../features/cart/store';
import { apiClient } from '../lib/apiClient';
import { CartPage } from './CartPage';

function renderCartPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CartPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty cart state when there are no items in the store', () => {
    const postSpy = vi.spyOn(apiClient, 'post');
    renderCartPage();

    expect(screen.getByRole('heading', { level: 1, name: /your cart/i })).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse products/i })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('renders validated cart items and order summary', async () => {
    useCartStore.setState({
      items: [{ productId: 'prod-1', quantity: 2 }],
    });

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        items: [
          {
            product: {
              id: 'prod-1',
              name: 'Mechanical Keyboard',
              slug: 'mechanical-keyboard',
              priceCents: 499900,
              imageUrl: 'https://example.com/keyboard.jpg',
              stock: 8,
              category: { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
            },
            quantity: 2,
            lineTotalCents: 999800,
          },
        ],
        subtotalCents: 999800,
        shippingCents: 0,
        totalCents: 999800,
        currency: 'INR',
        issues: [],
      },
    });

    renderCartPage();

    expect(await screen.findByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your cart \(2 items\)/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();

    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(checkoutButton).toBeEnabled();
  });

  it('shows unavailable alert for INACTIVE or NOT_FOUND issues and allows removing them', async () => {
    useCartStore.setState({
      items: [
        { productId: 'prod-inactive', quantity: 1 },
        { productId: 'prod-missing', quantity: 1 },
      ],
    });

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        items: [
          {
            product: {
              id: 'prod-inactive',
              name: 'Discontinued Lamp',
              slug: 'discontinued-lamp',
              priceCents: 199900,
              imageUrl: 'https://example.com/lamp.jpg',
              stock: 0,
              category: { id: 'cat-2', name: 'Home', slug: 'home' },
            },
            quantity: 1,
            lineTotalCents: 199900,
          },
        ],
        subtotalCents: 199900,
        shippingCents: 9900,
        totalCents: 209800,
        currency: 'INR',
        issues: [
          { productId: 'prod-inactive', type: 'INACTIVE' },
          { productId: 'prod-missing', type: 'NOT_FOUND' },
        ],
      },
    });

    renderCartPage();

    expect(await screen.findByText('Some items are no longer available')).toBeInTheDocument();
    expect(screen.getByText('This product is no longer available.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /remove unavailable items/i }));

    await waitFor(() => {
      expect(useCartStore.getState().items).toEqual([]);
    });
    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument();
  });
});
