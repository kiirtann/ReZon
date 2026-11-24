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

---
<!-- New task notes go below this line, newest first -->

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
