import { Link } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Badge, Card } from '../components/ui';

/**
 * Friendly 404 fallback page with navigation back to Home and Products.
 */
export function NotFoundPage() {
  return (
    <Container className="py-16">
      <Card padding="lg" className="mx-auto max-w-lg text-center">
        <Badge variant="warning" size="md">
          404 · Page not found
        </Badge>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-text">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-sm text-muted">
          The page you&apos;re looking for may have moved or doesn&apos;t exist.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back to home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Browse products
          </Link>
        </div>
      </Card>
    </Container>
  );
}
