import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from '../features/cart/store';
import type { Order } from '../features/checkout/types';
import { apiClient } from '../lib/apiClient';
import { CheckoutSuccessPage } from './CheckoutSuccessPage';

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord_123',
    status: 'PAID',
    currency: 'INR',
    subtotalCents: 199900,
    shippingCents: 0,
    totalCents: 199900,
    shippingAddress: {
      fullName: 'Ada Lovelace',
      line1: '123 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      phone: '9876543210',
    },
    items: [
      {
        productId: 'prod_1',
        productName: 'Mechanical Keyboard',
        unitPriceCents: 199900,
        quantity: 1,
      },
    ],
    createdAt: '2026-11-24T08:00:00.000Z',
    paidAt: '2026-11-24T08:00:05.000Z',
    ...overrides,
  };
}

function renderSuccessPage(initialEntry = '/checkout/success?orderId=ord_123') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CheckoutSuccessPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [{ productId: 'prod_1', quantity: 1 }] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows pending spinner state and keeps cart while order is PENDING', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: makeOrder({ status: 'PENDING', paidAt: null }),
    });

    renderSuccessPage();

    expect(await screen.findByText(/confirming your payment/i)).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /confirming your payment/i })).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('clears the cart and shows confirmation details when order is PAID', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: makeOrder({ status: 'PAID' }),
    });

    renderSuccessPage();

    expect(await screen.findByText(/order confirmed!/i)).toBeInTheDocument();
    expect(screen.getByText(/order #ord_123/i)).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view order/i })).toHaveAttribute(
      'href',
      '/orders/ord_123',
    );
    expect(screen.getByRole('link', { name: /continue shopping/i })).toHaveAttribute(
      'href',
      '/products',
    );

    await waitFor(() => {
      expect(useCartStore.getState().items).toEqual([]);
    });
  });

  it('shows an error alert with link to cart when order is CANCELLED', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: makeOrder({ status: 'CANCELLED', paidAt: null }),
    });

    renderSuccessPage();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/payment was not completed/i);
    expect(screen.getByRole('link', { name: /return to cart/i })).toHaveAttribute('href', '/cart');
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('shows an error alert when orderId query param is missing', () => {
    renderSuccessPage('/checkout/success');

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/missing order reference/i);
    expect(screen.getByRole('link', { name: /return to cart/i })).toHaveAttribute('href', '/cart');
  });
});
