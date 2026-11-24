import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authKeys } from '../features/auth/api';
import { ApiError, apiClient } from '../lib/apiClient';
import { LoginPage } from './LoginPage';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderLoginPage(initialEntry = '/login') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return { ...view, queryClient };
}

describe('LoginPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows validation errors for invalid email and empty password without calling API', async () => {
    const postSpy = vi.spyOn(apiClient, 'post');
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('displays API error in an Alert when login fails with 401', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
      new ApiError(401, 'UNAUTHENTICATED', 'Invalid email or password'),
    );

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid email or password');
  });

  it('sets auth query data and navigates to safe redirect on success', async () => {
    const user = { id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace' };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: user });

    const { queryClient } = renderLoginPage('/login?redirect=%2Fcheckout');

    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute(
      'href',
      '/register?redirect=%2Fcheckout',
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/checkout');
    expect(queryClient.getQueryData(authKeys.me)).toEqual(user);
  });

  it('ignores unsafe external redirect URLs and falls back to /', async () => {
    const user = { id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace' };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: user });

    renderLoginPage('/login?redirect=https%3A%2F%2Fevil.com');

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/');
    });
  });
});
