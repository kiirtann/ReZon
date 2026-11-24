# Progress Log

> Append newest entries at the **top**. One entry per finished task (or per session). Keep it short.
> Template:
> ```
> ## YYYY-MM-DD · T<id> <title> · <agent or person>
> - Changed: <files and areas>
> - Verified: <commands run and results>
> - Notes / follow-ups: <anything the next task should know>
> ```

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
