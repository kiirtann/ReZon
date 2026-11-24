# Progress Log

> Append newest entries at the **top**. One entry per finished task (or per session). Keep it short.
> Template:
> ```
> ## YYYY-MM-DD · T<id> <title> · <agent or person>
> - Changed: <files and areas>
> - Verified: <commands run and results>
> - Notes / follow-ups: <anything the next task should know>
> ```

## 2026-11-24 · P3 Backend core & catalog API (T3.1–T3.3) + T5.1 App shell · Antigravity (parallel)
- Changed:
  - **P3 (Backend)**: added `server/src/lib/errors.ts` (`AppError` + factories), `server/src/middleware/{errorHandler,notFound,validate,requestLogger}.ts`, updated `server/src/app.ts` (`helmet`, `cors`, `cookieParser`, `express.json`, `/api/v1` router, `notFound`, `errorHandler`), built `categories` (`GET /api/v1/categories`) and `products` (`GET /api/v1/products`, `GET /api/v1/products/:slug`), plus `server/vitest.config.ts` and `server/src/test/{globalSetup,db}.ts` isolating tests to `server/prisma/test.db`.
  - **T5.1 (Frontend shell)**: added `client/src/lib/{apiClient,queryClient,formatMoney}.ts` + tests, `client/src/components/layout/{Container,Header,Footer,PageShell,index}.tsx`, `client/src/pages/NotFoundPage.tsx`, and `client/src/app/{providers,router,App}.tsx` with all 13 routes from `docs/05-UI_DESIGN.md`.
- Verified:
  - `npm run typecheck` (0 errors across client and server)
  - `npm test` (server: 4 files, 16 tests passed; client: 7 files, 20 tests passed)
  - `npm run lint` (0 errors) & `npm run format:check` (passed)
  - `npm run build` (passed)
  - Live `npm run dev` smoke test via Vite proxy (`/api/v1/categories` and `/api/v1/products?limit=2`)
- Notes / follow-ups: P3 is ready for user review. Next up: **P4 (Authentication: T4.1 + T4.2)** and/or **T5.2–T5.4 (Frontend catalog pages)**.

## 2026-11-24 · P1 UI Design (T1.1–T1.4) + P2 Database (T2.1–T2.3) · Antigravity (parallel)
- Changed:
  - **P1 (UI Design)**: finalized `docs/05-UI_DESIGN.md` (sitemap, flows, WCAG AA-checked tokens, component inventory), created `docs/design/wireframes.md`, updated `client/src/styles/index.css`, built 14 accessible UI primitives in `client/src/components/ui/*` + unit tests, and added `client/src/pages/StyleguidePage.tsx` at `/styleguide`.
  - **P2 (Database)**: installed `prisma@^6`, `@prisma/client@^6`, `bcrypt` in `server/`; added `DATABASE_URL` to `server/.env*` and `server/src/config/env.ts`; created `server/src/lib/prisma.ts` singleton, `server/prisma/schema.prisma`, initial migration (`20261124073151_init`), and idempotent `server/prisma/seed.ts` (4 categories, 24 products, 1 demo user).
- Verified:
  - `npm run typecheck` (0 errors across client and server)
  - `npm test` (server: 1 passed; client: 5 files, 12 tests passed)
  - `npm run lint` & `npm run format:check` (passed)
  - `npm run build` (passed)
  - `npm run db:seed` run multiple times (idempotent: 4 categories, 24 products, 1 user)
- Notes / follow-ups: P1 and P2 are ready for user review. Next up after approval: **P3 (Backend core and catalog API)**, which can also run alongside **T5.1 (App shell and routing)** if desired.

## 2026-11-24 · P0 Foundations (T0.1–T0.4) · Antigravity
- Changed:
  - Root monorepo (`package.json`, `tsconfig.base.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.editorconfig`)
  - Express + TS server (`server/package.json`, `server/tsconfig*.json`, `server/.env.example`, `server/src/config/env.ts`, `server/src/app.ts`, `server/src/server.ts`, `server/src/modules/health/*`)
  - React + Vite + Tailwind v4 client (`client/package.json`, `client/tsconfig.json`, `client/vite.config.ts`, `client/index.html`, `client/src/styles/index.css`, `client/src/pages/HomePage.tsx`, `client/src/pages/HomePage.test.tsx`, folder skeleton)
- Verified:
  - `npm run typecheck` (passed for server and client)
  - `npm test` (server: 1 passed, client: 2 passed)
  - `npm run lint` and `npm run format:check` (passed)
  - `npm run build` (built client and server)
  - `npm run dev`: `http://localhost:4000/api/v1/health` and `http://localhost:5173/api/v1/health` (via Vite proxy) both returned `{"data":{"status":"ok"}}`
- Notes / follow-ups: P0 is ready for user review. Next up after approval: **P1 (UI Design)** and **P2 (Database)** can run in parallel.

## 2026-11-24 · Project planning · Antigravity
- Changed: created `AGENTS.md`, `docs/*` (brief, architecture, data model, API contract, UI design,
  conventions, roadmap, decisions), `.agents/skills/*` (work-on-task, review-phase).
- Verified: docs reviewed for consistency. Tooling on this machine: Node 20.19, Python 3.13, git 2.47. No Docker or psql.
- Notes / follow-ups: next is **P0 Foundations** (T0.1, then T0.2 and T0.3 in parallel, then T0.4).
