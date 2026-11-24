import { Suspense, lazy, type ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { Spinner } from '../components/ui';
import { GuestOnlyRoute } from '../features/auth/components/GuestOnlyRoute';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { HomePage } from '../pages/HomePage';

const ProductListPage = lazy(() =>
  import('../pages/ProductListPage').then((m) => ({ default: m.ProductListPage })),
);
const ProductDetailPage = lazy(() =>
  import('../pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
);
const CartPage = lazy(() => import('../pages/CartPage').then((m) => ({ default: m.CartPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() =>
  import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const CheckoutPage = lazy(() =>
  import('../pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
);
const CheckoutSuccessPage = lazy(() =>
  import('../pages/CheckoutSuccessPage').then((m) => ({ default: m.CheckoutSuccessPage })),
);
const CheckoutCancelPage = lazy(() =>
  import('../pages/CheckoutCancelPage').then((m) => ({ default: m.CheckoutCancelPage })),
);
const OrderHistoryPage = lazy(() =>
  import('../pages/OrderHistoryPage').then((m) => ({ default: m.OrderHistoryPage })),
);
const OrderDetailPage = lazy(() =>
  import('../pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })),
);
const ProfilePage = lazy(() =>
  import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const StyleguidePage = lazy(() =>
  import('../pages/StyleguidePage').then((m) => ({ default: m.StyleguidePage })),
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center py-12">
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

/**
 * Route table matching the sitemap contract in `docs/05-UI_DESIGN.md`.
 * `HomePage` stays eager for fast initial paint; secondary routes are code-split.
 */
export const routes: RouteObject[] = [
  {
    element: <PageShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: withSuspense(<ProductListPage />) },
      { path: '/products/:slug', element: withSuspense(<ProductDetailPage />) },
      { path: '/cart', element: withSuspense(<CartPage />) },
      {
        element: <GuestOnlyRoute />,
        children: [
          { path: '/login', element: withSuspense(<LoginPage />) },
          { path: '/register', element: withSuspense(<RegisterPage />) },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/checkout', element: withSuspense(<CheckoutPage />) },
          { path: '/checkout/success', element: withSuspense(<CheckoutSuccessPage />) },
          { path: '/checkout/cancel', element: withSuspense(<CheckoutCancelPage />) },
          { path: '/orders', element: withSuspense(<OrderHistoryPage />) },
          { path: '/orders/:id', element: withSuspense(<OrderDetailPage />) },
          { path: '/profile', element: withSuspense(<ProfilePage />) },
        ],
      },
      { path: '/styleguide', element: withSuspense(<StyleguidePage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
];

export const router = createBrowserRouter(routes);
