import { HomePage } from '../pages/HomePage';
import { StyleguidePage } from '../pages/StyleguidePage';

// The root component. T5.1 replaces this with providers (TanStack Query) and React Router.
export function App() {
  if (typeof window !== 'undefined' && window.location.pathname === '/styleguide') {
    return <StyleguidePage />;
  }

  return <HomePage />;
}
