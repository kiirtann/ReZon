import { Select } from '../../../components/ui';
import type { ProductSort } from '../types';

export interface SortSelectProps {
  value: ProductSort;
  onChange: (sort: ProductSort) => void;
  id?: string;
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

/**
 * Accessible sort dropdown for the product catalog.
 */
export function SortSelect({ value, onChange, id = 'product-sort' }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="shrink-0 text-sm font-medium text-muted">
        Sort by
      </label>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as ProductSort)}
        className="w-auto min-w-44"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
