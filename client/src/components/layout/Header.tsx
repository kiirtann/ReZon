import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../../features/auth/api';
import { selectCartCount, useCartStore } from '../../features/cart/store';
import { Badge, Button, Input } from '../ui';
import { Container } from './Container';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm px-1 py-0.5 ${
    isActive ? 'text-primary' : 'text-muted hover:text-text'
  }`;

/**
 * Global site header with brand logo, catalog navigation, product search,
 * live cart count badge, and authenticated user menu.
 */
export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = useCartStore(selectCartCount);
  const { data: user } = useMe();
  const logout = useLogout();

  function handleLogout() {
    setMobileMenuOpen(false);
    logout.mutate(undefined, {
      onSuccess: () => navigate('/'),
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    setMobileMenuOpen(false);
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/products');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 md:flex-nowrap md:gap-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xl font-bold tracking-tight text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
            >
              Shop<span className="text-primary">Learn</span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-4 md:flex">
              <NavLink to="/products" className={navLinkClass}>
                Products
              </NavLink>
              {user && (
                <NavLink to="/orders" className={navLinkClass}>
                  Orders
                </NavLink>
              )}
            </nav>
          </div>

          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="order-last flex w-full items-center gap-2 md:order-none md:max-w-md md:flex-1"
          >
            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <Input
              id="header-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="py-1.5"
            />
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/cart"
              aria-label={`Cart, ${cartItemCount} items`}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span>Cart</span>
              <Badge variant="primary" size="sm">
                {cartItemCount}
              </Badge>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {user ? (
                <>
                  <span className="px-2 text-sm font-medium text-text">{user.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    loading={logout.isPending}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="flex flex-col gap-2 border-t border-border py-3 md:hidden"
          >
            <NavLink
              to="/products"
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </NavLink>
            {user ? (
              <>
                <NavLink
                  to="/orders"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </NavLink>
                <div className="flex items-center justify-between pt-1">
                  <span className="px-1 text-sm font-medium text-text">{user.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    loading={logout.isPending}
                  >
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={navLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        )}
      </Container>
    </header>
  );
}
