# Learning Notes

> One section per finished task: **what** we built, **why** we built it that way, the **concept** behind it,
> and **where** to look in the code. Read this like a course textbook that grows with the project.

## Concepts glossary (filled in as we go)
| Concept | Short explanation | First seen in |
|---|---|---|
| Contract-first development | Agree on the data and API shapes before building, so the frontend and backend can be built in parallel | Planning |
| Minor units | Store ₹12.50 as 1250 paise to avoid float rounding errors | Planning, ADR-006 |
| npm workspaces (Monorepo) | Manage multiple packages (`client/`, `server/`) in one repo with a single `node_modules` and root scripts | P0 (T0.1) |
| Fail-fast env validation | Parse `process.env` with Zod at startup so missing secrets crash immediately with a clear error instead of failing mid-request | P0 (T0.2) |
| App vs. Server separation | Build the Express app in `app.ts` without calling `.listen()`, so Supertest can test routes without binding a real port | P0 (T0.2) |
| Dev proxy | Vite forwards `/api/*` from `:5173` to `:4000` so the browser sees one origin and cookies work without CORS headaches | P0 (T0.3) |
| WCAG AA contrast | Text contrast must be at least 4.5:1 against its background for readability; e.g. `#15803d` passes on white where `#16a34a` falls short | P1 (T1.2) |
| `forwardRef` | Exposing an internal DOM element ref on a custom `Input`/`Select` so `react-hook-form` can register and focus it directly | P1 (T1.4) |
| ORM & migrations | Defining tables in `schema.prisma` and generating reproducible SQL migrations (`prisma migrate dev`) instead of hand-editing SQL | P2 (T2.2) |
| Singleton on `globalThis` | Caching `PrismaClient` on `globalThis` in dev so `tsx watch` hot-reloads don't open duplicate database connections | P2 (T2.1) |
| Idempotent seeding (`upsert`) | Writing seed scripts so running them twice updates existing records instead of crashing on unique constraints | P2 (T2.3) |
| Centralized `errorHandler` | Express 4-argument middleware `(err, req, res, next)` registered last to turn `AppError`/`ZodError`/unexpected errors into a uniform JSON envelope without leaking stack traces | P3 (T3.1) |
| Boundary validation (`validate`) | Parsing `body`/`query`/`params` with Zod in middleware and saving onto `req.validated` (avoiding Express 5's read-only `req.query` getter) | P3 (T3.1) |
| Typed `apiClient` + smart retries | Centralizing `fetch` with `credentials: 'include'` and `ApiError`, and skipping TanStack Query retries on 4xx client errors | P5 (T5.1) |
| `httpOnly` JWT cookie + `SameSite=Lax` | Keeping auth tokens out of `localStorage` so XSS scripts cannot read them, while letting the browser send cookies automatically | P4 (T4.1) |
| Account enumeration protection | Returning the exact same `401 Invalid email or password` whether the email is unknown or the password is wrong | P4 (T4.1) |
| URL search params as filter state | Storing `search`, `category`, `minPrice`, `maxPrice`, `sort`, and `page` in `useSearchParams()` so links are shareable and Back works | P5 (T5.2) |
| Server-side price authority | Storing only `{ productId, quantity }` in Zustand/`localStorage` and computing all prices, shipping, and stock checks on the server | P6 (T6.1, T6.2) |
| Batch loading (`WHERE id IN (...)`) | Fetching all cart products in one Prisma query instead of looping `findUnique` per item (avoids the N+1 query problem) | P6 (T6.1) |
| Open-redirect prevention | Validating `?redirect=` starts with a single `/` (rejecting `//` or `https://`) before calling `navigate()` after login | P4 (T4.2) |
| Price snapshots (`OrderItem`) | Copying `productName` and `unitPriceCents` onto `OrderItem` at checkout so past orders never change when catalog prices change | P7 (T7.1) |
| Raw-body webhook verification | Mounting `POST /webhooks/stripe` with `express.raw()` before `express.json()` so Stripe's HMAC signature matches exact raw bytes | P7 (T7.2) |
| Webhook idempotency | Checking `if (order.status === 'PAID') return;` inside `prisma.$transaction` so duplicate webhook deliveries don't double-decrement stock | P7 (T7.2) |
| User-scoped queries (IDOR prevention) | Filtering `where: { userId: req.user!.id }` on the server rather than trusting a `?userId=` param from the client | P8 (T8.1) |
| Deterministic tie-breaker sort | Sorting by `[{ createdAt: 'desc' }, { id: 'desc' }]` so pagination/lists stay stable when two rows share the same timestamp | P8 (T8.1) |
| Exhaustive status mapping | Using `Record<OrderStatus, ...>` in TypeScript so every order status has a compile-time-checked badge label and color | P8 (T8.2) |
| Rate limiting (`429 RATE_LIMITED`) | Capping repeated requests per IP on `/auth/login` and `/auth/register` with a `Retry-After` header to slow brute-force attacks | P9 (T9.2) |
| Payload size limits | Capping `express.json({ limit: '100kb' })` and `express.raw({ limit: '1mb' })` to prevent memory-exhaustion DoS | P9 (T9.2) |
| Route-based code splitting | Using `React.lazy` + `Suspense` so visitors on `/` don't download checkout/order pages or Zod schemas upfront | P9 (T9.3) |
| `trust proxy` | Telling Express to trust the hosting platform's reverse proxy `X-Forwarded-*` headers so `req.ip` and `secure` cookies work in production | P10 (T10.2) |
| Cross-origin `SameSite=None` | Allowing `httpOnly` auth cookies to be sent when the React SPA (`vercel.app`) and Express API (`onrender.com`) live on different domains | P10 (T10.2) |

---
<!-- New task notes go below this line, newest first -->

## Phase 10 Summary: Production Readiness (T10.1–T10.2)

### What we built & why
1. **PostgreSQL Readiness (`server/prisma/schema.postgres.prisma`, `products.service.ts`)**:
   - Prepared the PostgreSQL Prisma schema while keeping local SQLite dev & tests intact, and added `mode: 'insensitive'` search automatically when `DATABASE_URL` points to Postgres.
2. **Deployment & Cross-Origin Config (`app.ts`, `auth.controller.ts`, `apiClient.ts`, `render.yaml`, `client/vercel.json`, `docs/DEPLOYMENT.md`)**:
   - Enabled `trust proxy` in production, `SameSite=None; Secure` cookies for separate-origin hosting, `VITE_API_URL` in `apiClient.ts`, SPA rewrites for Vercel, and a Render Blueprint + step-by-step deployment guide.

### Self-check questions
1. Why does `auth.controller.ts` switch from `sameSite: 'lax'` in dev to `sameSite: 'none'` + `secure: true` in production?
2. Why do we need `client/vercel.json` rewrites (`/(.*) -> /index.html`) for a React Router SPA?
3. Why does `app.set('trust proxy', 1)` matter for our rate limiter in production?

## Phase 9 Summary: Quality & Hardening (T9.1–T9.3)

### What we built & why
1. **Server Hardening (`server/src/middleware/rateLimit.ts`, `app.ts`, `auth.routes.ts`)**:
   - Added a zero-dependency fixed-window rate limiter on `/auth/login` and `/auth/register` (`max: 20` per 15 min, `skipInTest: true`) returning `429 RATE_LIMITED` + `Retry-After`.
   - Enforced `100kb` JSON and `1mb` webhook raw-body payload limits, and audited `helmet`, `cors`, `httpOnly`/`sameSite` cookie flags, and `pricing.ts` boundaries.
2. **Client Performance & Accessibility (`router.tsx`, `ProductCard.tsx`, `CartLineItem.tsx`, pages)**:
   - Lazy-loaded 12 secondary routes with `React.lazy` + `Suspense`, shrinking the initial JS bundle by ~36.6% (`488.56 kB` → `309.65 kB`, `98.83 kB` gzip).
   - Added `loading="lazy"` / `decoding="async"` on images and `focus-visible` outlines on interactive links/buttons.
3. **Test Coverage Pass**:
   - Added `rateLimit.test.ts`, `pricing.test.ts`, `Header.test.tsx`, and `CartPage.test.tsx` (now **115 tests** total across server and client).

### Self-check questions
1. Why do we mount `express.json({ limit: '100kb' })` *after* `express.raw({ type: 'application/json', limit: '1mb' })` on `/api/v1/webhooks`?
2. Why did we keep `HomePage` eagerly imported instead of wrapping it in `React.lazy`?
3. What trade-off does an in-memory `Map` rate limiter have when scaling to multiple server instances?

### Optional hands-on exercise
- Run `npm run build` and inspect `dist/assets/` to see how Vite split each page into its own small `.js` chunk.

## Phase 8 Summary: Order History (T8.1–T8.2)

### What we built & why
1. **Orders Read API (`server/src/modules/orders/`)**:
   - `GET /api/v1/orders` queries orders scoped strictly to `req.user!.id`, sorted newest-first (`createdAt desc, id desc`), preventing cross-user data leaks (IDOR).
2. **Order History & Detail UI (`client/src/features/orders/`, `OrderHistoryPage.tsx`, `OrderDetailPage.tsx`)**:
   - `OrderHistoryPage` renders skeleton loading, empty state, error/retry, and `OrderCard`s with `OrderStatusBadge`.
   - `OrderDetailPage` shows line items (with historical `unitPriceCents` snapshots), shipping address, and totals, and disables Retry on permanent `403`/`404` responses.

### Self-check questions
1. Why do we pass `req.user!.id` from the auth middleware instead of accepting `?userId=...` in the query string?
2. Why does `OrderDetailPage` disable the Retry button on `403` and `404` responses?
3. Why is `[{ createdAt: 'desc' }, { id: 'desc' }]` safer than `[{ createdAt: 'desc' }]` alone?

### Optional hands-on exercise
- Sign in as `demo@shoplearn.dev` (`Password123!`), visit `/orders`, and try navigating manually to `/orders/nonexistent-id` to see the 404 error state.

## Phase 7 Summary: Checkout & Payments (T7.1–T7.3)

### What we built & why
1. **Orders API (`server/src/modules/orders/`)**:
   - `POST /api/v1/orders` validates stock (`409 CONFLICT` on shortage), recalculates totals from DB prices (`computeTotals`), creates a `PENDING` `Order` + `OrderItem` snapshots inside `prisma.$transaction`, and creates a Stripe Checkout Session returning `checkoutUrl`.
   - `GET /api/v1/orders/:id` enforces ownership (`403 FORBIDDEN` for non-owners) and parses `shippingAddress`.
2. **Stripe Webhook (`server/src/lib/stripe.ts`, `server/src/modules/payments/`)**:
   - Mounted with `express.raw({ type: 'application/json' })` before `express.json()` in `app.ts` so `constructWebhookEvent` verifies `Stripe-Signature`.
   - `checkout.session.completed` atomically marks the order `PAID` and decrements `Product.stock` inside a transaction, safely ignoring duplicate deliveries.
3. **Checkout UI (`client/src/features/checkout/`, `CheckoutPage.tsx`, `CheckoutSuccessPage.tsx`, `CheckoutCancelPage.tsx`)**:
   - `CheckoutPage` validates the cart, collects shipping details, creates the order, and redirects externally with `window.location.assign(checkoutUrl)`.
   - `CheckoutSuccessPage` polls `GET /orders/:id` every 2s while `PENDING` and clears the Zustand cart only after `status === 'PAID'`.

### Self-check questions
1. Why must `/api/v1/webhooks/stripe` be mounted before `app.use(express.json())`?
2. Why shouldn't the client clear the Zustand cart as soon as `POST /orders` succeeds?
3. What would happen if a webhook handler decremented `Product.stock` without checking `order.status === 'PAID'` first?

### Optional hands-on exercise
- To test real Stripe Checkout locally, set `STRIPE_SECRET_KEY=sk_test_...` in `server/.env`, run `stripe listen --forward-to localhost:4000/api/v1/webhooks/stripe` (which gives `STRIPE_WEBHOOK_SECRET`), and complete a checkout with test card `4242 4242 4242 4242`.

## T4.2 & Phase 6 Summary: Auth UI (T4.2) & Cart (T6.1–T6.2)

### What we built & why
1. **Auth UI (`client/src/features/auth/`, `LoginPage.tsx`, `RegisterPage.tsx`)**:
   - `useMe()` treats `401` as `null` (guest) with `retry: false`, while `useLogin` / `useRegister` update the `['auth', 'me']` cache immediately.
   - `ProtectedRoute` redirects guests to `/login?redirect=...` (checked by `getSafeRedirect`), and `GuestOnlyRoute` keeps logged-in users out of `/login` and `/register`.
2. **Cart API + Store + UI (`server/src/modules/cart/`, `lib/pricing.ts`, `client/src/features/cart/`, `CartPage.tsx`)**:
   - Zustand `persist` saves only `{ productId, quantity }` in `localStorage`.
   - `POST /api/v1/cart/validate` batch-loads products from SQLite, merges duplicate IDs, applies `computeTotals` (free shipping at ₹999+, else ₹49), and returns `issues` (`NOT_FOUND`, `INACTIVE`, `INSUFFICIENT_STOCK`).
   - `Header.tsx` now displays the live cart badge and user menu (`name` + `Sign out`).

### Self-check questions
1. Why do we store only `{ productId, quantity }` in `localStorage` instead of caching `priceCents`?
2. How does `validateCart` avoid an N+1 query problem when a cart has many products?
3. Why does `useMe()` convert `401` into `null` instead of letting TanStack Query treat it as an error?

### Optional hands-on exercise
- Run `npm run dev`, add a product to your cart, open DevTools → Application → Local Storage (`shoplearn-cart`), inspect what's stored, then visit `/cart` and `/login` (`demo@shoplearn.dev` / `Password123!`).

## T4.1 & Phase 5 Summary: Auth API (T4.1) & Catalog UI (T5.2–T5.4)

### What we built & why
1. **Auth API (`server/src/modules/auth/`, `lib/password.ts`, `lib/jwt.ts`, `middleware/requireAuth.ts`)**:
   - Passwords are hashed with `bcrypt` and never selected or returned in JSON.
   - `POST /register` and `POST /login` sign a JWT and set it in an `httpOnly`, `sameSite: 'lax'` cookie (`token`). `requireAuth` verifies the cookie, loads `{ id, email, name }`, and attaches `req.user`.
2. **Catalog UI (`client/src/features/products/`, `ProductListPage.tsx`, `ProductDetailPage.tsx`, `HomePage.tsx`)**:
   - `useCategories`, `useProducts`, and `useProduct` fetch live API data via TanStack Query.
   - `ProductListPage` syncs all filters, sort, search, and pagination with URL search params (`useSearchParams`), converting rupee inputs to minor units (paise) for the API.
   - `HomePage` now renders a hero banner, category tiles linking to `/products?category=...`, and featured products.

### Self-check questions
1. Why do `POST /login` and `POST /register` set the JWT in an `httpOnly` cookie instead of returning it in JSON for `localStorage`?
2. Why do wrong email and wrong password return the exact same `401` message?
3. Why do we store product list filters in the URL (`?category=electronics&sort=price_asc`) instead of React `useState`?

### Optional hands-on exercise
- Run `npm run dev`, visit `http://localhost:5173`, click a category tile on the home page, and notice how the URL updates as you filter, sort, and paginate—then hit the browser Back button.

## Phase 3 & T5.1 Summary: Catalog API (T3.1–T3.3) & App Shell (T5.1)

### What we built & why
1. **Backend plumbing & Catalog API (`server/src/`)**:
   - `lib/errors.ts` + `middleware/{errorHandler,notFound,validate,requestLogger}.ts` standardize error responses and Zod validation across every route.
   - `modules/categories/` and `modules/products/` implement `GET /api/v1/categories`, `GET /api/v1/products` (search, category slug, price range, sort, pagination `meta`), and `GET /api/v1/products/:slug`.
   - `vitest.config.ts` + `test/globalSetup.ts` isolate Supertest integration tests to `server/prisma/test.db` so `dev.db` is never altered.
2. **Frontend shell & routing (`client/src/`)**:
   - `lib/{apiClient,queryClient,formatMoney}.ts` handle cookie-authenticated JSON requests, smart query caching/retries, and `Intl.NumberFormat` currency display.
   - `components/layout/{Header,Footer,PageShell,Container}.tsx` and `app/router.tsx` wire all 13 routes from `docs/05-UI_DESIGN.md` with placeholder views ready for `T4.2`, `T5.2`–`T5.4`, `T6.2`, `T7.3`, and `T8.2`.

### Self-check questions
1. Why must `errorHandler` be registered *after* all routes and `notFound` in `server/src/app.ts`?
2. Why does `validate.ts` write to `req.validated` instead of reassigning `req.query` in Express 5?
3. Why does `queryClient.ts` skip retries for 4xx `ApiError`s?

### Optional hands-on exercise
- Start `npm run dev` and test filtering products directly in your browser or curl:
  `curl "http://localhost:5173/api/v1/products?category=electronics&sort=price_asc&limit=3"`

## Phase 1 & 2 Summary: UI Design (T1.1–T1.4) & Database (T2.1–T2.3)

### What we built & why
1. **UI Design & Primitives (`docs/05-UI_DESIGN.md`, `docs/design/wireframes.md`, `client/src/components/ui/`)**:
   - Finalized the route map, guest checkout redirect flow (`/login?redirect=/checkout`), and low-fi mobile (`375px`) + desktop (`1024px+`) wireframes with loading, empty, and error states.
   - Verified WCAG AA contrast (`>= 4.5:1`) on all design tokens in `client/src/styles/index.css` (adjusted `--color-success` to `#15803d`, paired `--color-accent` with dark text).
   - Built 14 reusable primitives (`Button`, `Input`, `Select`, `Label`, `FormField`, `Card`, `Badge`, `Skeleton`, `Spinner`, `Alert`, `Price`, `QuantityStepper`, `Pagination`, `EmptyState`) showcased at `/styleguide`.
2. **Database, Migration & Seed (`server/prisma/`, `server/src/lib/prisma.ts`)**:
   - Modeled `User`, `Category`, `Product`, `Order`, and `OrderItem` in `schema.prisma` using `cuid()` IDs and integer `*Cents` money fields.
   - Ran the initial SQLite migration (`20261124073151_init`) and wrote an idempotent `seed.ts` using `upsert` (4 categories, 24 products, 1 bcrypt-hashed demo user `demo@shoplearn.dev`).

### Self-check questions
1. Why does `Button` default to `type="button"` instead of HTML's default `type="submit"`?
2. Why does `OrderItem` copy `productName` and `unitPriceCents` instead of only referencing `productId`?
3. What happens if you call `new PrismaClient()` at module top-level without caching it on `globalThis` while using `tsx watch`?

### Optional hands-on exercise
- Run `npm run db:studio` to inspect the 24 seeded products in your browser, and start `npm run dev` to visit `http://localhost:5173/styleguide` to see all UI primitives and tokens live.

## Phase 0 Summary: Foundations (T0.1–T0.4)

### What we built & why
1. **Monorepo root (`package.json`, `tsconfig.base.json`, `eslint.config.js`)**: Linked `client` and `server` with npm workspaces so one `npm install`, `npm run dev`, `npm run typecheck`, and `npm test` runs across both apps.
2. **Express + TypeScript server (`server/src/`)**:
   - `config/env.ts` validates environment variables with `zod` at startup (*fail-fast*).
   - `app.ts` builds and exports `createApp()` separately from `server.ts` (`app.listen()`), letting Supertest (`health.test.ts`) test the HTTP layer in memory.
3. **React + Vite + Tailwind v4 client (`client/src/`)**:
   - `vite.config.ts` proxies `/api` requests from `:5173` to `:4000`, keeping frontend and backend on the same origin in development.
   - `styles/index.css` defines our draft design tokens with `@theme` so Tailwind generates `bg-primary`, `text-muted`, etc.
   - `HomePage.tsx` fetches `/api/v1/health` with an `AbortController` cleanup to prove the full stack is wired up.

### Self-check questions
1. Why do we export `createApp()` in `server/src/app.ts` instead of calling `app.listen()` in the same file?
2. What problem does Vite's `/api` dev proxy solve for authentication cookies later?
3. Why does `server/src/config/env.ts` validate `process.env` on startup instead of reading `process.env.PORT` directly in `server.ts`?

### Optional hands-on exercise
- Add a `timestamp` field (e.g. `new Date().toISOString()`) to the `GET /api/v1/health` response in `server/src/modules/health/health.routes.ts`, update `health.test.ts` to check that `timestamp` is a string, and run `npm test`.
