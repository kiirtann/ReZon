import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  EmptyState,
  FormField,
  Input,
  Pagination,
  Price,
  QuantityStepper,
  Select,
  Skeleton,
  Spinner,
} from '../components/ui';

const COLOR_SWATCHES = [
  { name: 'Primary', token: '--color-primary', className: 'bg-primary' },
  { name: 'Primary Hover', token: '--color-primary-hover', className: 'bg-primary-hover' },
  { name: 'Accent', token: '--color-accent', className: 'bg-accent' },
  { name: 'Background', token: '--color-bg', className: 'bg-bg border border-border' },
  { name: 'Surface', token: '--color-surface', className: 'bg-surface border border-border' },
  { name: 'Text', token: '--color-text', className: 'bg-text' },
  { name: 'Muted', token: '--color-muted', className: 'bg-muted' },
  { name: 'Border', token: '--color-border', className: 'bg-border' },
  { name: 'Success', token: '--color-success', className: 'bg-success' },
  { name: 'Warning', token: '--color-warning', className: 'bg-warning' },
  { name: 'Danger', token: '--color-danger', className: 'bg-danger' },
  { name: 'Info', token: '--color-info', className: 'bg-info' },
];

/**
 * Dev-only design system showcase at `/styleguide` (T1.2 & T1.4).
 * Displays all design tokens and interactive UI primitives.
 */
export function StyleguidePage() {
  const [qty, setQty] = useState(1);
  const [page, setPage] = useState(2);

  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">ReZone Styleguide</h1>
          <a href="/" className="text-sm font-medium text-primary hover:underline">
            ← Back to Home
          </a>
        </div>
        <p className="text-sm text-muted">
          Design tokens and reusable UI primitives defined in <code>docs/05-UI_DESIGN.md</code>.
        </p>
      </header>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Color Tokens</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.token} className="space-y-1.5">
              <div className={`h-12 w-full rounded-md ${swatch.className}`} />
              <p className="text-sm font-medium">{swatch.name}</p>
              <p className="text-xs text-muted">{swatch.token}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Typography Scale</h2>
        <Card className="space-y-2">
          <p className="text-4xl font-bold">40px — Display / Hero</p>
          <p className="text-3xl font-bold">32px — Page Title</p>
          <p className="text-2xl font-semibold">24px — Section Heading</p>
          <p className="text-xl font-semibold">20px — Card Title</p>
          <p className="text-base">16px — Body text (base)</p>
          <p className="text-sm text-muted">14px — Secondary / muted text</p>
          <p className="text-xs text-muted">12px — Captions & badges</p>
        </Card>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>
      </section>

      {/* Form controls */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Form Controls</h2>
        <Card className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Email address"
            htmlFor="sg-email"
            required
            hint="We never share your email."
          >
            <Input id="sg-email" type="email" placeholder="you@example.com" />
          </FormField>
          <FormField
            label="Postal code"
            htmlFor="sg-postal"
            required
            error="Postal code must be 6 digits"
          >
            <Input id="sg-postal" error defaultValue="123" />
          </FormField>
          <FormField label="Sort order" htmlFor="sg-sort">
            <Select id="sg-sort" defaultValue="newest">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </Select>
          </FormField>
        </Card>
      </section>

      {/* Badges & Prices */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Badges, Prices & Steppers</h2>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">Electronics</Badge>
            <Badge variant="primary">Featured</Badge>
            <Badge variant="accent">Sale</Badge>
            <Badge variant="success">PAID</Badge>
            <Badge variant="warning">PENDING</Badge>
            <Badge variant="danger">Out of stock</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-lg font-semibold">
              INR: <Price cents={129900} currency="INR" />
            </div>
            <div className="text-lg font-semibold">
              USD: <Price cents={2499} currency="USD" />
            </div>
            <QuantityStepper value={qty} onChange={setQty} min={1} max={10} />
          </div>
        </Card>
      </section>

      {/* Card slots */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Card Structure</h2>
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Order Summary</h3>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <Price cents={149800} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <Price cents={9900} />
            </div>
          </CardContent>
          <CardFooter className="mt-3 flex justify-between font-semibold">
            <span>Total</span>
            <Price cents={159700} />
          </CardFooter>
        </Card>
      </section>

      {/* Alerts & Loading */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Alerts, Spinners & Skeletons</h2>
        <div className="space-y-3">
          <Alert variant="info" title="Heads up">
            Orders placed before 5 PM ship the same day.
          </Alert>
          <Alert variant="success" title="Payment confirmed">
            Your order has been paid and is being prepared.
          </Alert>
          <Alert variant="warning" title="Low stock">
            Only 2 items left in stock. Your cart quantity was adjusted.
          </Alert>
          <Alert variant="danger" title="Could not load products" onRetry={() => {}}>
            Network error while contacting the server.
          </Alert>
        </div>
        <Card className="space-y-3">
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </section>

      {/* Pagination & EmptyState */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pagination & Empty State</h2>
        <Card className="space-y-6">
          <Pagination page={page} totalPages={10} onPageChange={setPage} />
          <EmptyState
            title="No products match your filters"
            description="Try removing some filters or searching for a different keyword."
            action={<Button variant="secondary">Clear filters</Button>}
          />
        </Card>
      </section>
    </main>
  );
}
