import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from '../../lib/apiClient';
import { CheckoutPage } from '../../pages/CheckoutPage';
import type { CartValidationResult } from '../cart/types';
import { useCartStore } from '../cart/store';
import type { CreateOrderResponse } from './types';

function makeValidationResult(overrides: Partial<CartValidationResult> = {}): CartValidationResult {
  return {
    items: [
      {
        product: {
          id: 'prod_1',
          name: 'Wireless Mouse',
          slug: 'wireless-mouse',
          priceCents: 149900,
          imageUrl: '/images/mouse.jpg',
          stock: 10,
          category: { id: 'cat_1', name: 'Electronics', slug: 'electronics' },
        },
        quantity: 1,
        lineTotalCents: 149900,
      },
    ],
    subtotalCents: 149900,
    shippingCents: 0,
    totalCents: 149900,
    currency: 'INR',
    issues: [],
    ...overrides,
  };
}

function renderCheckoutPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function fillValidAddressForm() {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Ada Lovelace' } });
  fireEvent.change(screen.getByLabelText(/address line 1/i), { target: { value: '123 MG Road' } });
  fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Bengaluru' } });
  fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'Karnataka' } });
  fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '560001' } });
  fireEvent.change(screen.getByLabelText(/country/i), { target: { value: 'India' } });
  fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '9876543210' } });
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders EmptyState linking to /products when cart is empty', () => {
    renderCheckoutPage();

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse products/i })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('blocks checkout submission and links to /cart when cart validation has issues', async () => {
    useCartStore.setState({ items: [{ productId: 'prod_1', quantity: 5 }] });
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: makeValidationResult({
        issues: [{ productId: 'prod_1', type: 'INSUFFICIENT_STOCK', available: 2 }],
      }),
    });

    renderCheckoutPage();

    expect(await screen.findByText(/cart issues must be resolved/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /review cart/i })).toHaveAttribute('href', '/cart');
    expect(screen.getByRole('button', { name: /pay with stripe/i })).toBeDisabled();
  });

  it('submits shipping address to POST /orders and redirects to Stripe checkoutUrl', async () => {
    useCartStore.setState({ items: [{ productId: 'prod_1', quantity: 1 }] });

    const orderResponse: CreateOrderResponse = {
      order: {
        id: 'ord_1',
        status: 'PENDING',
        currency: 'INR',
        subtotalCents: 149900,
        shippingCents: 0,
        totalCents: 149900,
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
            productName: 'Wireless Mouse',
            unitPriceCents: 149900,
            quantity: 1,
          },
        ],
        createdAt: '2026-11-24T08:00:00.000Z',
        paidAt: null,
      },
      checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_123',
    };

    const assignMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, assign: assignMock },
      writable: true,
    });

    const postSpy = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValueOnce({ data: makeValidationResult() })
      .mockResolvedValueOnce({ data: orderResponse });

    renderCheckoutPage();

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    fillValidAddressForm();
    fireEvent.click(screen.getByRole('button', { name: /pay with stripe/i }));

    await waitFor(() => {
      expect(assignMock).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_test_123');
    });

    expect(postSpy).toHaveBeenLastCalledWith('/orders', {
      items: [{ productId: 'prod_1', quantity: 1 }],
      shippingAddress: {
        fullName: 'Ada Lovelace',
        line1: '123 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
        phone: '9876543210',
      },
    });
  });

  it('displays an Alert with link to /cart when POST /orders returns 409 conflict', async () => {
    useCartStore.setState({ items: [{ productId: 'prod_1', quantity: 1 }] });

    vi.spyOn(apiClient, 'post')
      .mockResolvedValueOnce({ data: makeValidationResult() })
      .mockRejectedValueOnce(new ApiError(409, 'CONFLICT', 'Not enough stock for Wireless Mouse'));

    renderCheckoutPage();

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument();
    fillValidAddressForm();
    fireEvent.click(screen.getByRole('button', { name: /pay with stripe/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Not enough stock for Wireless Mouse');
    expect(screen.getByRole('link', { name: /return to cart/i })).toHaveAttribute('href', '/cart');
  });
});
