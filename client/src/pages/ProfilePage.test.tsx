import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { authKeys } from '../features/auth/api';
import { apiClient } from '../lib/apiClient';
import { ProfilePage } from './ProfilePage';

function renderProfilePage(user = { id: 'u1', email: 'ada@example.com', name: 'Ada Lovelace' }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(authKeys.me, user);

  render(
    <QueryClientProvider client={queryClient}>
      <ProfilePage />
    </QueryClientProvider>,
  );

  return { queryClient };
}

describe('ProfilePage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pre-fills account details and submits profile update', async () => {
    const patchSpy = vi
      .spyOn(apiClient, 'patch')
      .mockResolvedValueOnce({ data: { id: 'u1', name: 'Ada Byron', email: 'ada@new.com' } });

    const { queryClient } = renderProfilePage();

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(nameInput).toHaveValue('Ada Lovelace');
    expect(emailInput).toHaveValue('ada@example.com');

    fireEvent.change(nameInput, { target: { value: 'Ada Byron' } });
    fireEvent.change(emailInput, { target: { value: 'ada@new.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith('/auth/me', {
        name: 'Ada Byron',
        email: 'ada@new.com',
      });
    });

    expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument();
    expect(queryClient.getQueryData(authKeys.me)).toEqual({
      id: 'u1',
      name: 'Ada Byron',
      email: 'ada@new.com',
    });
  });

  it('validates password mismatch and submits password change', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce(undefined);

    renderProfilePage();

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpass1234' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'different123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(patchSpy).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith('/auth/password', {
        currentPassword: 'oldpass123',
        newPassword: 'newpass1234',
      });
    });

    expect(await screen.findByText('Password changed successfully.')).toBeInTheDocument();
  });
});
