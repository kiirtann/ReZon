/**
 * Validates a `?redirect=` query param to prevent open-redirect vulnerabilities.
 * Only relative paths starting with a single `/` (not `//`) are allowed.
 */
export function getSafeRedirect(redirectParam: string | null): string {
  if (!redirectParam) {
    return '/';
  }
  if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
    return redirectParam;
  }
  return '/';
}

/**
 * Builds an auth page link (`/login` or `/register`) while preserving a safe `?redirect=` param.
 */
export function buildAuthLink(path: '/login' | '/register', redirectParam: string | null): string {
  if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
    return `${path}?redirect=${encodeURIComponent(redirectParam)}`;
  }
  return path;
}
