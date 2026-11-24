import { createBrowserRouter, Link, type RouteObject } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import { Badge, Card, EmptyState } from '../components/ui';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { StyleguidePage } from '../pages/StyleguidePage';

interface PlaceholderPageProps {
  title: string;
  taskId: string;
  description: string;
}

function PlaceholderPage({ title, taskId, description }: PlaceholderPageProps) {
  return (
    <Container className="py-12">
      <Card padding="lg">
        <EmptyState
          icon={<Badge variant="primary">{taskId}</Badge>}
          title={title}
          description={description}
          action={
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Back to home
            </Link>
          }
        />
      </Card>
    </Container>
  );
}

/**
 * Route table matching the sitemap contract in `docs/05-UI_DESIGN.md`.
 */
export const routes: RouteObject[] = [
  {
    element: <PageShell />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/products',
        element: (
          <PlaceholderPage
            title="Products"
            taskId="T5.2"
            description="Product catalog listing with search, category, price filters, and pagination."
          />
        ),
      },
      {
        path: '/products/:slug',
        element: (
          <PlaceholderPage
            title="Product Detail"
            taskId="T5.3"
            description="Product gallery, price, stock status, quantity stepper, and add-to-cart."
          />
        ),
      },
      {
        path: '/cart',
        element: (
          <PlaceholderPage
            title="Shopping Cart"
            taskId="T6.2"
            description="Cart items validated against server prices and available stock."
          />
        ),
      },
      {
        path: '/login',
        element: (
          <PlaceholderPage
            title="Login"
            taskId="T4.2"
            description="Sign in to your ShopLearn account to checkout and view orders."
          />
        ),
      },
      {
        path: '/register',
        element: (
          <PlaceholderPage
            title="Create Account"
            taskId="T4.2"
            description="Register a new ShopLearn account."
          />
        ),
      },
      {
        path: '/checkout',
        element: (
          <PlaceholderPage
            title="Checkout"
            taskId="T7.3"
            description="Enter shipping address and proceed to Stripe Checkout."
          />
        ),
      },
      {
        path: '/checkout/success',
        element: (
          <PlaceholderPage
            title="Payment Processing"
            taskId="T7.3"
            description="Confirming your order payment status."
          />
        ),
      },
      {
        path: '/checkout/cancel',
        element: (
          <PlaceholderPage
            title="Checkout Cancelled"
            taskId="T7.3"
            description="Your payment was cancelled. Review your cart to try again."
          />
        ),
      },
      {
        path: '/orders',
        element: (
          <PlaceholderPage
            title="Order History"
            taskId="T8.2"
            description="View your past ShopLearn orders and their payment statuses."
          />
        ),
      },
      {
        path: '/orders/:id',
        element: (
          <PlaceholderPage
            title="Order Details"
            taskId="T8.2"
            description="Line items, shipping address, and totals for this order."
          />
        ),
      },
      { path: '/styleguide', element: <StyleguidePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
