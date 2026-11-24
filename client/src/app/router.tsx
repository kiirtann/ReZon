import { createBrowserRouter, Link, type RouteObject } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { PageShell } from '../components/layout/PageShell';
import { Badge, Card, EmptyState } from '../components/ui';
import { GuestOnlyRoute } from '../features/auth/components/GuestOnlyRoute';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { CartPage } from '../pages/CartPage';
import { CheckoutCancelPage } from '../pages/CheckoutCancelPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductListPage } from '../pages/ProductListPage';
import { RegisterPage } from '../pages/RegisterPage';
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
      { path: '/products', element: <ProductListPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      {
        element: <GuestOnlyRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/checkout/success', element: <CheckoutSuccessPage /> },
          { path: '/checkout/cancel', element: <CheckoutCancelPage /> },
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
        ],
      },
      { path: '/styleguide', element: <StyleguidePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
