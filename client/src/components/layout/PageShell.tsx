import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export interface PageShellProps {
  children?: ReactNode;
}

/**
 * Shared application shell: skip-to-content link, Header, main content landmark, and Footer.
 * Supports both React Router layout routes (`<Outlet />`) and direct `children`.
 */
export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      >
        Skip to content
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        {children ?? <Outlet />}
      </main>

      <Footer />
    </div>
  );
}
