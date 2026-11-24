import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Price } from './Price';

describe('Price', () => {
  it('formats integer minor units as INR by default', () => {
    render(<Price cents={99900} />);
    expect(screen.getByText('₹999.00')).toBeInTheDocument();
  });

  it('formats USD minor units accurately', () => {
    render(<Price cents={2499} currency="USD" />);
    expect(screen.getByText('$24.99')).toBeInTheDocument();
  });

  it('formats zero cents cleanly', () => {
    render(<Price cents={0} currency="INR" />);
    expect(screen.getByText('₹0.00')).toBeInTheDocument();
  });
});
