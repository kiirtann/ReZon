import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductFilters } from './ProductFilters';

const categories = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
  { id: 'cat-2', name: 'Home', slug: 'home' },
];

describe('ProductFilters', () => {
  it('calls onCategoryChange when selecting a category', () => {
    const onCategoryChange = vi.fn();

    render(
      <ProductFilters
        categories={categories}
        selectedCategory=""
        onCategoryChange={onCategoryChange}
        onPriceApply={vi.fn()}
        onClear={vi.fn()}
        hasActiveFilters={false}
      />,
    );

    fireEvent.click(screen.getByLabelText('Electronics'));
    expect(onCategoryChange).toHaveBeenCalledWith('electronics');
  });

  it('converts rupee inputs to minor units (paise) on price apply', () => {
    const onPriceApply = vi.fn();

    render(
      <ProductFilters
        categories={categories}
        selectedCategory=""
        onCategoryChange={vi.fn()}
        onPriceApply={onPriceApply}
        onClear={vi.fn()}
        hasActiveFilters={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Min (₹)'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('Max (₹)'), { target: { value: '1999.50' } });
    fireEvent.click(screen.getByRole('button', { name: /apply price/i }));

    expect(onPriceApply).toHaveBeenCalledWith(50000, 199950);
  });

  it('renders Clear filters button only when filters are active', () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <ProductFilters
        categories={categories}
        selectedCategory=""
        onCategoryChange={vi.fn()}
        onPriceApply={vi.fn()}
        onClear={onClear}
        hasActiveFilters={false}
      />,
    );

    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

    rerender(
      <ProductFilters
        categories={categories}
        selectedCategory="electronics"
        onCategoryChange={vi.fn()}
        onPriceApply={vi.fn()}
        onClear={onClear}
        hasActiveFilters
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
