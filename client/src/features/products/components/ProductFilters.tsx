import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Label, Skeleton } from '../../../components/ui';
import type { Category } from '../types';

export interface ProductFiltersProps {
  categories: Category[];
  categoriesLoading?: boolean;
  selectedCategory: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  onCategoryChange: (slug: string) => void;
  onPriceApply: (minPriceCents?: number, maxPriceCents?: number) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function centsToRupeesInput(cents?: number): string {
  if (cents === undefined || Number.isNaN(cents)) return '';
  return String(Math.round(cents) / 100);
}

function rupeesInputToCents(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const numeric = Number(trimmed);
  if (Number.isNaN(numeric) || numeric < 0) return undefined;
  return Math.round(numeric * 100);
}

/**
 * Catalog sidebar filter controls for category selection and price range.
 * Price inputs accept rupees in the UI and convert to integer minor units (paise) for the API.
 */
export function ProductFilters({
  categories,
  categoriesLoading = false,
  selectedCategory,
  minPriceCents,
  maxPriceCents,
  onCategoryChange,
  onPriceApply,
  onClear,
  hasActiveFilters,
}: ProductFiltersProps) {
  const [minInput, setMinInput] = useState(() => centsToRupeesInput(minPriceCents));
  const [maxInput, setMaxInput] = useState(() => centsToRupeesInput(maxPriceCents));

  useEffect(() => {
    setMinInput(centsToRupeesInput(minPriceCents));
  }, [minPriceCents]);

  useEffect(() => {
    setMaxInput(centsToRupeesInput(maxPriceCents));
  }, [maxPriceCents]);

  function handlePriceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPriceApply(rupeesInputToCents(minInput), rupeesInputToCents(maxInput));
  }

  return (
    <div className="space-y-6 rounded-md border border-border bg-surface p-4">
      <fieldset className="space-y-2.5">
        <legend className="text-sm font-semibold text-text">Category</legend>

        {categoriesLoading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-center gap-2 rounded-sm py-1 text-sm text-text hover:text-primary">
              <input
                type="radio"
                name="category"
                value=""
                checked={selectedCategory === ''}
                onChange={() => onCategoryChange('')}
                className="h-4 w-4 accent-primary"
              />
              <span>All categories</span>
            </label>

            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 rounded-sm py-1 text-sm text-text hover:text-primary"
              >
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={selectedCategory === category.slug}
                  onChange={() => onCategoryChange(category.slug)}
                  className="h-4 w-4 accent-primary"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <form onSubmit={handlePriceSubmit} className="space-y-3 border-t border-border pt-4">
        <p className="text-sm font-semibold text-text">Price range (₹)</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="filter-min-price">Min (₹)</Label>
            <Input
              id="filter-min-price"
              type="number"
              min={0}
              step="any"
              placeholder="0"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="filter-max-price">Max (₹)</Label>
            <Input
              id="filter-max-price"
              type="number"
              min={0}
              step="any"
              placeholder="Any"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" variant="secondary" size="sm" className="w-full">
          Apply price
        </Button>
      </form>

      {hasActiveFilters && (
        <div className="border-t border-border pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClear} className="w-full">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
