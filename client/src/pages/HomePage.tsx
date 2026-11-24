import { useEffect, useState } from 'react';

type ApiStatus = 'checking' | 'ok' | 'down';

/**
 * Placeholder home page for Phase 0. It proves the full chain works:
 * browser -> Vite dev server -> proxy -> Express API -> JSON back to React.
 * T5.4 replaces it with the real home page.
 */
export function HomePage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    // AbortController cancels the request if the component unmounts first
    // (React StrictMode mounts twice in dev, so this also prevents duplicate state updates).
    const controller = new AbortController();

    fetch('/api/v1/health', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((body: { data: { status: string } }) =>
        setApiStatus(body.data.status === 'ok' ? 'ok' : 'down'),
      )
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setApiStatus('down');
      });

    return () => controller.abort();
  }, []);

  const badge = {
    checking: { label: 'Checking API…', className: 'bg-surface text-muted' },
    ok: { label: 'API connected', className: 'bg-success/10 text-success' },
    down: { label: 'API unreachable', className: 'bg-danger/10 text-danger' },
  }[apiStatus];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Shop<span className="text-primary">Learn</span>
      </h1>
      <p className="text-muted">A full-stack e-commerce learning project. Phase 0: foundations.</p>
      <span
        role="status"
        className={`rounded-full px-4 py-1.5 text-sm font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    </main>
  );
}
