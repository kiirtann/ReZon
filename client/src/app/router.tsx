import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { PageShell } from '../components/layout/PageShell';
import { GuestOnlyRoute } from '../features/auth/components/GuestOnlyRoute';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { CartPage } from '../pages/CartPage';
import { CheckoutCancelPage } from '../pages/CheckoutCancelPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductListPage } from '../pages/ProductListPage';
import { RegisterPage } from '../pages/RegisterPage';
import { StyleguidePage } from '../pages/StyleguidePage';

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
          { path: '/orders', element: <OrderHistoryPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
        ],
      },
      { path: '/styleguide', element: <StyleguidePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
