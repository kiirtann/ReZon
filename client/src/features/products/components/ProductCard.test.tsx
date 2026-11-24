import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { ProductSummary } from '../types';
import { ProductCard } from './ProductCard';

const baseProduct: ProductSummary = {
  id: 'prod-1',
  name: 'Mechanical Keyboard',
  slug: 'mechanical-keyboard',
  priceCents: 499900,
  imageUrl: 'https://example.com/keyboard.jpg',
  stock: 12,
  category: { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
};

describe('ProductCard', () => {
  it('renders product details and links to the product detail page', () => {
    render(
      <MemoryRouter>
        <ProductCard product={baseProduct} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    const titleLink = screen.getByRole('link', { name: 'Mechanical Keyboard' });
    expect(titleLink).toHaveAttribute('href', '/products/mechanical-keyboard');
    expect(screen.getByText('₹4,999.00')).toBeInTheDocument();
    expect(screen.queryByText('Out of stock')).not.toBeInTheDocument();
  });

  it('shows "Out of stock" badge when stock is 0', () => {
    render(
      <MemoryRouter>
        <ProductCard product={{ ...baseProduct, stock: 0 }} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });
});
