import type { ReactNode } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { Spinner } from '../../../components/ui';
import { useMe } from '../api';
import { getSafeRedirect } from '../redirect';

export interface GuestOnlyRouteProps {
  children?: ReactNode;
}

/**
 * Redirects already-authenticated users away from guest-only pages (`/login`, `/register`)
 * to `?redirect=...` (validated as a safe relative path) or `/`.
 */
export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { data: user, isLoading } = useMe();
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" label="Checking authentication" />
      </div>
    );
  }

  if (user) {
    const destination = getSafeRedirect(searchParams.get('redirect'));
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
