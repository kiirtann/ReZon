import { Link } from 'react-router-dom';
import { Container } from './Container';

/**
 * Global site footer with brand summary, quick links, and learning-project note.
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-8 text-sm text-muted">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/"
            className="text-base font-bold tracking-tight text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
          >
            Re<span className="text-primary">Zone</span>
          </Link>
          <p className="mt-1 text-xs text-muted">
            A full-stack e-commerce learning project built with React, Express, Prisma, and Stripe.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
          <Link
            to="/products"
            className="hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
          >
            Products
          </Link>
          <Link
            to="/cart"
            className="hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
          >
            Cart
          </Link>
          <Link
            to="/orders"
            className="hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
          >
            Orders
          </Link>
          <Link
            to="/styleguide"
            className="hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
          >
            Styleguide
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
