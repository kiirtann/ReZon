# ShopLearn

A full-stack e-commerce learning project: React + Vite, Express + TypeScript, Prisma (SQLite → PostgreSQL), and Stripe.

## Start here
1. [AGENTS.md](AGENTS.md): project rules and how work is done
2. [docs/ROADMAP.md](docs/ROADMAP.md): phases, tasks and current status
3. [docs/01-PROJECT_BRIEF.md](docs/01-PROJECT_BRIEF.md) → [02-ARCHITECTURE](docs/02-ARCHITECTURE.md) →
   [03-DATA_MODEL](docs/03-DATA_MODEL.md) → [04-API_CONTRACT](docs/04-API_CONTRACT.md) →
   [05-UI_DESIGN](docs/05-UI_DESIGN.md) → [06-CONVENTIONS](docs/06-CONVENTIONS.md)
4. [docs/LEARNING_NOTES.md](docs/LEARNING_NOTES.md): what we built and why, phase by phase

## Running (available after Phase 0)
```bash
npm install
cp server/.env.example server/.env
npm run db:migrate && npm run db:seed
npm run dev        # client http://localhost:5173 · api http://localhost:4000/api/v1
```
