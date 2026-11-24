# ShopLearn: Project Rules (read on every task)

> ShopLearn is a full-stack e-commerce **learning project**. It is built phase by phase,
> from UI design to backend, database, payments and deployment. This file is loaded
> automatically for every agent and task in this workspace. It is the entry point to
> the shared project context.

## 1. What we are building
A small online store where users can browse and search products, add them to a cart,
sign up or log in, pay with Stripe (test mode), and see their order history.
Full scope: [docs/01-PROJECT_BRIEF.md](docs/01-PROJECT_BRIEF.md)

## 2. Tech stack (fixed, change only via a decision in docs/DECISIONS.md)
| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript, React Router, TanStack Query, Zustand (cart), Tailwind CSS, react-hook-form + zod |
| Backend | Node.js 20 + Express + TypeScript, zod validation, JWT in an httpOnly cookie, bcrypt |
| Database | Prisma ORM. **SQLite in development** (`server/prisma/dev.db`), PostgreSQL later (Phase 10) |
| Payments | Stripe Checkout (test mode) + webhook |
| Testing | Vitest + Supertest (server), Vitest + Testing Library (client) |
| Repo | npm workspaces monorepo: `client/`, `server/` |

## 3. Source of truth: read before you act
| Doc | Read it when |
|---|---|
| [docs/ROADMAP.md](docs/ROADMAP.md) | **Always.** Lists phases, tasks, status, dependencies and file ownership |
| [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | You touch more than one layer, or folder structure |
| [docs/03-DATA_MODEL.md](docs/03-DATA_MODEL.md) | You touch the database, Prisma or business entities |
| [docs/04-API_CONTRACT.md](docs/04-API_CONTRACT.md) | You touch any endpoint, or frontend code that calls the API |
| [docs/05-UI_DESIGN.md](docs/05-UI_DESIGN.md) | You touch any page, component or style |
| [docs/06-CONVENTIONS.md](docs/06-CONVENTIONS.md) | Always, before writing code |
| [docs/DECISIONS.md](docs/DECISIONS.md) | You are about to make or question an architectural choice |
| [docs/PROGRESS_LOG.md](docs/PROGRESS_LOG.md) | You need to know what happened recently |

## 4. Working protocol (every task, sequential or parallel)
1. **Pick a task** from `docs/ROADMAP.md`. Start it only if all of its `Depends on` tasks are `done`.
2. **Claim it**: set its status to `in_progress`.
3. **Load context**: read the docs listed in the task's `Read` field, plus this file.
4. **Stay in your lane**: edit only files in the task's `Owns` paths. If you need to change a file
   another task owns, or a **contract** (data model, API contract, design tokens), stop and report.
   Do not silently change it.
5. **Build and verify** against the task's `Done when` criteria (run it, test it, type-check it).
6. **Close it out**:
   - Set the task status to `done` in `docs/ROADMAP.md`
   - Append an entry to `docs/PROGRESS_LOG.md` (what changed, how it was verified, follow-ups)
   - Add a short "what and why" lesson to `docs/LEARNING_NOTES.md`
   - If you made an architectural choice, add an ADR to `docs/DECISIONS.md`
7. **Pause for review** at the end of each phase. The user reviews before the next phase starts.

The step-by-step procedure is in the `work-on-task` skill (`.agents/skills/work-on-task/`).

## 5. Contracts: the rule that makes parallel work safe
`docs/03-DATA_MODEL.md`, `docs/04-API_CONTRACT.md` and the design tokens in `docs/05-UI_DESIGN.md`
are **contracts**. Frontend and backend tasks build against them independently. Change a contract
only in a dedicated step: update the doc, add an ADR, and list the affected tasks.

## 6. Learning mode
The user is learning. When you finish a task, explain what you built and why, name the concept
(for example "middleware" or "N+1 query"), and point to the key lines. Prefer clear code over clever
code. Do not add libraries outside the stack table without an ADR.

## 7. Non-negotiables
- Never trust prices or totals from the client. The server recalculates from the database.
- Store money as **integers in minor units** (paise or cents). Never use floats.
- Secrets live only in `.env` files, which git ignores. Keep `.env.example` up to date.
- Validate every request body and query with zod at the route boundary.
- Hash passwords with bcrypt. Never log passwords, tokens or card data.
