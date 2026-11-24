import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../../features/auth/api';
import { selectCartCount, useCartStore } from '../../features/cart/store';
import { Badge, Button, Input } from '../ui';
import { Container } from './Container';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm px-1 py-0.5 ${
    isActive ? 'text-primary' : 'text-muted hover:text-text'
  }`;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
}

/**
 * Global site header with brand logo, catalog navigation, product search,
 * live cart count badge, profile dropdown beside the menu toggle, and auth links.
 */
export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const cartItemCount = useCartStore(selectCartCount);
  const { data: user } = useMe();
  const logout = useLogout();

  useEffect(() => {
    if (!profileOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  function handleLogout() {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    logout.mutate(undefined, {
      onSuccess: () => navigate('/'),
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    setMobileMenuOpen(false);
    setProfileOpen(false);
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
              Re<span className="text-primary">Zone</span>
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

            {/* Profile dropdown beside the mobile Menu button (and accessible on all sizes) */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {user ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                    {getInitials(user.name)}
                  </span>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.5-1.632Z"
                    />
                  </svg>
                )}
                <span className="hidden sm:inline">{user ? 'Profile' : 'Account'}</span>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  aria-label="Profile options"
                  className="absolute right-0 z-40 mt-2 w-60 rounded-md border border-border bg-bg p-2 shadow-lg"
                >
                  {user ? (
                    <div className="space-y-1">
                      <div className="border-b border-border px-2.5 py-2">
                        <p className="truncate text-sm font-semibold text-text">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-sm px-2.5 py-1.5 text-sm text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        Order History
                      </Link>
                      <Link
                        to="/cart"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-sm px-2.5 py-1.5 text-sm text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        Shopping Cart ({cartItemCount})
                      </Link>
                      <div className="border-t border-border pt-1">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          disabled={logout.isPending}
                          className="w-full rounded-sm px-2.5 py-1.5 text-left text-sm font-medium text-danger hover:bg-danger-bg focus-visible:outline-2 focus-visible:outline-primary"
                        >
                          {logout.isPending ? 'Signing out…' : 'Sign out'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="border-b border-border px-2.5 py-2">
                        <p className="text-sm font-semibold text-text">Guest</p>
                        <p className="text-xs text-muted">Sign in to checkout &amp; track orders</p>
                      </div>
                      <Link
                        to="/login"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-sm px-2.5 py-1.5 text-sm font-medium text-primary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-sm px-2.5 py-1.5 text-sm text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        Create account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setProfileOpen(false);
              }}
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
