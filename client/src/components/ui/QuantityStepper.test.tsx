import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuantityStepper } from './QuantityStepper';

describe('QuantityStepper', () => {
  it('increments and decrements within bounds', () => {
    const onChange = vi.fn();

    render(<QuantityStepper value={2} onChange={onChange} min={1} max={5} />);

    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('disables decrement at min and increment at max', () => {
    const { rerender } = render(<QuantityStepper value={1} onChange={vi.fn()} min={1} max={3} />);
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeEnabled();

    rerender(<QuantityStepper value={3} onChange={vi.fn()} min={1} max={3} />);
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  });
});
