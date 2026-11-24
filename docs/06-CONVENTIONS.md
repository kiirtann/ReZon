# 06. Conventions

## General
- **TypeScript strict mode** everywhere. No `any` unless there is a comment explaining why.
- Formatting with Prettier (2 spaces, single quotes, semicolons, trailing commas, width 100). Linting with ESLint.
- Use small, focused files. Name things after what they do, not how they do it.
- Comment the **why**, not the what. Because this is a learning project, a short note on a
  non-obvious concept is welcome.

## Naming
| Thing | Convention | Example |
|---|---|---|
| React components and pages | PascalCase file and export | `ProductCard.tsx`, `ProductListPage.tsx` |
| Hooks | `useX` camelCase | `useProducts.ts` |
| Server module files | `<module>.<layer>.ts` | `products.service.ts` |
| Variables and functions | camelCase | `computeTotals` |
| Types | PascalCase, no `I` prefix | `ProductSummary` |
| Constants and env | UPPER_SNAKE | `JWT_SECRET` |
| DB models | PascalCase singular | `OrderItem` |
| URLs | kebab-case, plural nouns | `/api/v1/products` |
| Money fields | suffix `Cents` | `totalCents` |

## Backend
- Each route: `validate(schema)` middleware → controller → service.
- Throw `AppError(status, code, message)` from services. One central `errorHandler` turns errors
  into the error format in the API contract.
- Wrap async controllers so rejected promises reach the error handler. Express 5 does this natively;
  with Express 4, use a small `asyncHandler`.
- Use `prisma.$transaction` when more than one write must succeed or fail together.
- Select only the fields you need. Never return `passwordHash`.
- `app.ts` exports the app without calling `listen`, so Supertest can import it.

## Frontend
- **Server state** goes through TanStack Query (`features/<x>/api.ts` exports hooks such as `useProducts(filters)`).
  **Client state** (the cart) uses Zustand with the `persist` middleware. Do not copy server data into Zustand.
- All HTTP goes through `lib/apiClient.ts`, which adds the base URL, `credentials: 'include'`, JSON
  parsing, and turns API errors into a typed `ApiError`.
- Product list filters live in the **URL search params**, so links can be shared and the back button works.
- Forms use react-hook-form + zod. Show errors under each field.
- Style with Tailwind classes that use the design tokens. Do not hard-code hex colors in components.
- Show money only through `<Price cents={...} />` or `formatMoney()`, which uses `Intl.NumberFormat`.

## Testing
- Server: each module has a `*.test.ts` with Supertest against `app`. Use a separate test SQLite DB.
- Client: test logic-heavy parts (cart store, formatMoney, key components).
- Every task's `Done when` includes how to verify it. Paste the command output into the progress log.

## Git
- Branch per task: `task/<id>-<short-name>`, for example `task/3.2-products-api`.
- Commit messages follow Conventional Commits: `feat(products): add list endpoint with filters`.
  Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`.
- Before merging: type-check passes, tests pass, docs updated.

## Scripts (root `package.json`, created in Phase 0)
| Command | Does |
|---|---|
| `npm run dev` | Runs the client and server together |
| `npm run build` | Builds both |
| `npm run test` | Tests both |
| `npm run typecheck` | `tsc --noEmit` in both |
| `npm run db:migrate` / `db:seed` / `db:studio` | Prisma helpers (server workspace) |
