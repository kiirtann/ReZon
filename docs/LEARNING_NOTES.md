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

---
<!-- New task notes go below this line, newest first -->

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
