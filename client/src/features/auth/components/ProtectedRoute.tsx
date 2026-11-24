import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '../../../components/ui';
import { useMe } from '../api';

export interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Guards routes that require an authenticated user.
 * Preserves the requested path + query string in `?redirect=...` so the user
 * returns to their intended destination after signing in.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading } = useMe();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" label="Checking authentication" />
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
