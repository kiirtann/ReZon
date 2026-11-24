# ReZon

A full-stack e-commerce web application built with React 18, TypeScript, Express, Prisma, and Stripe.

## Features
- **Product catalog**: search, category filters, price range, sorting, and pagination
- **Cart**: persisted client-side cart with server-side price & stock validation
- **Authentication**: registration, login, logout, `httpOnly` JWT cookies, and profile/password management (`/profile`)
- **Checkout & payments**: Stripe Checkout + signed webhook handling (with an offline dev simulator when Stripe keys are unset)
- **Order history**: user-scoped order list and detailed order receipts
- **Theme**: light/dark mode toggle

## Tech stack
- **Frontend**: React 18, Vite, TypeScript, React Router, TanStack Query, Zustand, Tailwind CSS v4, React Hook Form + Zod
- **Backend**: Node.js 20, Express 5, TypeScript, Zod, Prisma ORM (SQLite in dev, PostgreSQL in production), bcrypt, JWT, Stripe SDK
- **Testing**: Vitest, Supertest, React Testing Library

## Local setup
```bash
npm install
cp server/.env.example server/.env
npm run db:migrate && npm run db:seed
npm run dev
```

- Client: `http://localhost:5173`
- API: `http://localhost:4000/api/v1`
- Prisma Studio: `npm run db:studio`

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Run client and server together |
| `npm run build` | Build both workspaces |
| `npm test` | Run server and client test suites |
| `npm run typecheck` | Type-check both workspaces |
| `npm run lint` | Run ESLint |
| `npm run format:check` | Check Prettier formatting |
