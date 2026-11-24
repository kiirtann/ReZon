# Architecture Decision Records (ADRs)

> Add a new entry for any choice that affects more than one task or would surprise a newcomer.
> Format: context → decision → consequences. Never delete an entry; mark it `Superseded by ADR-xxx` instead.

## ADR-001: Monorepo with npm workspaces · Accepted · 2026-11-24
**Context:** We have one client and one server, a single developer, and a learning goal.
**Decision:** One repo with `client/` and `server/` as npm workspaces. No Turborepo or Nx.
**Consequences:** One `npm install`, one git history. Types are mirrored by hand from the API contract,
not shared in a package (simpler, and a good lesson in keeping contracts in sync).

## ADR-002: SQLite in dev, PostgreSQL in production · Accepted · 2026-11-24
**Context:** No Docker or local Postgres. We want zero setup.
**Decision:** Prisma with SQLite until Phase 10, then switch the provider to PostgreSQL.
**Consequences:** Avoid features that only one database has. Enums are stored as strings, and search
is case-insensitive only for ASCII in dev. Migrations start over at the switch.

## ADR-003: Client-side cart, server-side pricing · Accepted · 2026-11-24
**Context:** Guests should be able to use the cart. A database cart adds tables and merge logic.
**Decision:** The cart lives in Zustand + localStorage as `{productId, quantity}` only. The server
recalculates prices and totals through `/cart/validate` and `/orders`.
**Consequences:** The cart does not follow the user across devices (acceptable for v1). The client can never change prices.

## ADR-004: JWT in an httpOnly cookie · Accepted · 2026-11-24
**Context:** Storing tokens in localStorage exposes them to XSS attacks.
**Decision:** Sign a JWT with `JWT_SECRET` and send it as an `httpOnly`, `sameSite=lax` cookie
(`secure` in production). The Vite proxy keeps the API on the same origin in dev.
**Consequences:** CORS needs `credentials: true`. Logging out means clearing the cookie (no server-side revoke in v1).

## ADR-005: Stripe Checkout (hosted) + webhook as the source of truth · Accepted · 2026-11-24
**Context:** We must not handle card data. The redirect back from Stripe alone can be faked.
**Decision:** Use the hosted Stripe Checkout page. Only the signed webhook marks an order PAID and decrements stock.
**Consequences:** We need the Stripe CLI locally to forward webhooks. Stock is not reserved while the
user pays, so overselling is possible in rare cases (a known v1 limit).

## ADR-006: Money as integer minor units · Accepted · 2026-11-24
**Decision:** Every amount is an `Int` (paise or cents). It is formatted only at display time with `Intl.NumberFormat`.
