import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows "API connected" when the health check succeeds', async () => {
    // Replace the real fetch with a fake one, so the test does not need a running server.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { status: 'ok' } }) }),
    );

    render(<HomePage />);

    expect(screen.getByRole('status')).toHaveTextContent('Checking API');
    expect(await screen.findByText('API connected')).toBeInTheDocument();
  });

  it('shows "API unreachable" when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    render(<HomePage />);

    expect(await screen.findByText('API unreachable')).toBeInTheDocument();
  });
});
