import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiClient } from '../../../lib/apiClient';
import { GuestOnlyRoute } from './GuestOnlyRoute';
import { ProtectedRoute } from './ProtectedRoute';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderWithRouter(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<div>Orders Secret Content</div>} />
          </Route>
          <Route element={<GuestOnlyRoute />}>
            <Route path="/login" element={<LocationDisplay />} />
          </Route>
          <Route path="/" element={<LocationDisplay />} />
          <Route path="/checkout" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading spinner while auth session is being checked', () => {
    vi.spyOn(apiClient, 'get').mockReturnValueOnce(new Promise(() => {}));

    renderWithRouter('/orders');

    expect(screen.getByRole('status', { name: /checking authentication/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated users (401) to /login with encoded redirect', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(
      new ApiError(401, 'UNAUTHENTICATED', 'Authentication required'),
    );

    renderWithRouter('/orders?page=2');

    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/login?redirect=%2Forders%3Fpage%3D2',
    );
    expect(screen.queryByText('Orders Secret Content')).not.toBeInTheDocument();
  });

  it('renders protected content when user is authenticated', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace' },
    });

    renderWithRouter('/orders');

    expect(await screen.findByText('Orders Secret Content')).toBeInTheDocument();
  });
});

describe('GuestOnlyRoute', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects authenticated users away from /login to ?redirect', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace' },
    });

    renderWithRouter('/login?redirect=%2Fcheckout');

    expect(await screen.findByTestId('location')).toHaveTextContent('/checkout');
  });
});
