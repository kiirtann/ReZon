import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../../features/auth/api';
import { selectCartCount, useCartStore } from '../../features/cart/store';
import { Badge, Button, Input } from '../ui';
import { Container } from './Container';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
}

/**
 * Global site header with ReZone logo, product search,
 * cart icon badge, and borderless profile dropdown.
 */
export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
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
    setProfileOpen(false);
    logout.mutate(undefined, {
      onSuccess: () => navigate('/'),
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
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
          <Link
            to="/"
            className="rounded-sm text-xl font-bold tracking-tight text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Re<span className="text-primary">Zone</span>
          </Link>

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

          <div className="flex items-center gap-3">
            {/* Cart icon logo + count badge */}
            <Link
              to="/cart"
              aria-label={`Cart, ${cartItemCount} items`}
              className="relative inline-flex items-center gap-1 rounded-full p-2 text-text transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <Badge variant="primary" size="sm">
                {cartItemCount}
              </Badge>
            </Link>

            {/* Borderless circular profile icon + dropdown */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-full p-0.5 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {user ? (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                    {getInitials(user.name)}
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface text-base"
                  >
                    👤
                  </span>
                )}
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  aria-label="Profile options"
                  className="absolute right-0 z-40 mt-2 w-60 rounded-md border border-border bg-bg p-2 shadow-lg"
                >
                  {user ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 border-b border-border px-2.5 py-2">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {getInitials(user.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">{user.name}</p>
                          <p className="truncate text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-sm px-2.5 py-1.5 text-sm text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-sm px-2.5 py-1.5 text-sm text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/checkout"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-sm px-2.5 py-1.5 text-sm text-text hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        Checkout
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
                      <div className="flex items-center gap-2.5 border-b border-border px-2.5 py-2">
                        <span
                          aria-hidden="true"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-base"
                        >
                          👤
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-text">Guest</p>
                          <p className="text-xs text-muted">Sign in to view your orders</p>
                        </div>
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
          </div>
        </div>
      </Container>
    </header>
  );
}
