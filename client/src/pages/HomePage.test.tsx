import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../lib/apiClient';
import { HomePage } from './HomePage';

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HomePage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders hero, categories, and featured products on success', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (path: string) => {
      if (path === '/categories') {
        return {
          data: [
            { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
            { id: 'cat-2', name: 'Books', slug: 'books' },
          ],
        };
      }
      if (path.startsWith('/products')) {
        return {
          data: [
            {
              id: 'prod-1',
              name: 'Wireless Headphones',
              slug: 'wireless-headphones',
              priceCents: 249900,
              imageUrl: 'https://example.com/headphones.jpg',
              stock: 10,
              category: { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
            },
          ],
          meta: { page: 1, limit: 8, total: 1, totalPages: 1 },
        };
      }
      throw new Error(`Unexpected path: ${path}`);
    });

    renderHomePage();

    expect(
      screen.getByRole('heading', { name: /everyday essentials, thoughtfully curated/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shop all products/i })).toHaveAttribute(
      'href',
      '/products',
    );

    expect(await screen.findByRole('link', { name: /electronics/i })).toHaveAttribute(
      'href',
      '/products?category=electronics',
    );
    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();
  });

  it('renders empty state when there are no featured products', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (path: string) => {
      if (path === '/categories') return { data: [] };
      return { data: [], meta: { page: 1, limit: 8, total: 0, totalPages: 0 } };
    });

    renderHomePage();

    expect(await screen.findByText('No featured products yet')).toBeInTheDocument();
  });

  it('renders error alert with retry button when featured products fail to load', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation(async (path: string) => {
      if (path === '/categories') return { data: [] };
      throw new Error('Network error');
    });

    renderHomePage();

    expect(await screen.findByText('Could not load featured products')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
