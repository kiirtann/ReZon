import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '../features/checkout/types';
import { ApiError, apiClient } from '../lib/apiClient';
import { OrderDetailPage } from './OrderDetailPage';
import { OrderHistoryPage } from './OrderHistoryPage';

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord_101',
    status: 'PAID',
    currency: 'INR',
    subtotalCents: 199900,
    shippingCents: 9900,
    totalCents: 209800,
    shippingAddress: {
      fullName: 'Ada Lovelace',
      line1: '123 MG Road',
      line2: 'Suite 4B',
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
    paidAt: '2026-11-24T08:05:00.000Z',
    ...overrides,
  };
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderOrderHistory() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<OrderHistoryPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderOrderDetail(orderId = 'ord_101') {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OrderHistoryPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty state linking to /products when user has no orders', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: [] });

    renderOrderHistory();

    expect(await screen.findByText(/no orders yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start shopping/i })).toHaveAttribute(
      'href',
      '/products',
    );
  });

  it('renders order list with status badges and links to order details', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: [
        makeOrder({ id: 'ord_paid', status: 'PAID' }),
        makeOrder({
          id: 'ord_pending',
          status: 'PENDING',
          paidAt: null,
          items: [
            { productId: 'p1', productName: 'Mouse', unitPriceCents: 50000, quantity: 2 },
            { productId: 'p2', productName: 'Pad', unitPriceCents: 20000, quantity: 1 },
          ],
          subtotalCents: 120000,
          shippingCents: 0,
          totalCents: 120000,
        }),
        makeOrder({ id: 'ord_cancelled', status: 'CANCELLED', paidAt: null }),
        makeOrder({ id: 'ord_failed', status: 'FAILED', paidAt: null }),
      ],
    });

    renderOrderHistory();

    expect(await screen.findByText('#ord_paid')).toBeInTheDocument();
    expect(screen.getByText('#ord_pending')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText(/3 items/)).toBeInTheDocument();

    const detailLinks = screen.getAllByRole('link', { name: /view details/i });
    expect(detailLinks[0]).toHaveAttribute('href', '/orders/ord_paid');
    expect(detailLinks[1]).toHaveAttribute('href', '/orders/ord_pending');
  });

  it('renders error alert with retry when loading orders fails', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(
      new ApiError(500, 'INTERNAL_ERROR', 'Server error'),
    );

    renderOrderHistory();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/could not load your orders/i);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});

describe('OrderDetailPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders order header, line items, shipping address, and totals breakdown', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: makeOrder({
        id: 'ord_555',
        status: 'PAID',
        items: [
          {
            productId: 'prod_1',
            productName: 'Mechanical Keyboard',
            unitPriceCents: 199900,
            quantity: 2,
          },
        ],
        subtotalCents: 399800,
        shippingCents: 9900,
        totalCents: 409700,
      }),
    });

    renderOrderDetail('ord_555');

    expect(await screen.findByText('#ord_555')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Shipping address
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('123 MG Road')).toBeInTheDocument();
    expect(screen.getByText('Suite 4B')).toBeInTheDocument();
    expect(screen.getByText(/Bengaluru, Karnataka 560001/)).toBeInTheDocument();
    expect(screen.getByText('Phone: 9876543210')).toBeInTheDocument();

    // Totals breakdown & item prices
    expect(screen.getByText('₹1,999.00')).toBeInTheDocument();
    expect(screen.getByText('Subtotal').nextElementSibling).toHaveTextContent('₹3,998.00');
    expect(screen.getByText('Shipping').nextElementSibling).toHaveTextContent('₹99.00');
    expect(screen.getByText('Total').nextElementSibling).toHaveTextContent('₹4,097.00');

    expect(screen.getByRole('link', { name: /back to orders/i })).toHaveAttribute(
      'href',
      '/orders',
    );
  });

  it('renders not-found alert with back link on 404', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(
      new ApiError(404, 'NOT_FOUND', 'Order not found'),
    );

    renderOrderDetail('missing_id');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/order not found/i);
    expect(screen.getByRole('link', { name: /back to orders/i })).toHaveAttribute(
      'href',
      '/orders',
    );
  });
});
