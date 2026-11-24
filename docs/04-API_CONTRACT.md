# 04. API Contract (CONTRACT)

> This is a contract. Frontend and backend tasks are built against this file in parallel.
> Change it only with an ADR in `DECISIONS.md`.

**Base URL:** `/api/v1` · **Format:** JSON · **Auth:** an httpOnly cookie named `token` (JWT).
The client must send `credentials: 'include'`.

## Conventions
**Success:** `{ "data": <payload> }`. List endpoints also return `"meta"`.
```json
{ "data": [ ... ], "meta": { "page": 1, "limit": 12, "total": 57, "totalPages": 5 } }
```
**Error:** `{ "error": { "code": string, "message": string, "details"?: any } }`

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | zod validation failed (`details` = field errors) |
| 401 | `UNAUTHENTICATED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Logged in but not allowed (for example, someone else's order) |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Email already registered, or not enough stock |
| 500 | `INTERNAL_ERROR` | Unexpected error (no stack trace sent to the client) |

**Money:** always integers in minor units, plus a `currency` field where it matters.
**Dates:** ISO 8601 strings.

## Shared types (TypeScript, mirrored in `client/src/features/*/types.ts`)
```ts
type Category = { id: string; name: string; slug: string };

type ProductSummary = {
  id: string; name: string; slug: string;
  priceCents: number; imageUrl: string; stock: number;
  category: Category;
};
type Product = ProductSummary & { description: string };

type User = { id: string; email: string; name: string };

type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';
type ShippingAddress = {
  fullName: string; line1: string; line2?: string; city: string;
  state: string; postalCode: string; country: string; phone: string;
};
type OrderItem = { productId: string; productName: string; unitPriceCents: number; quantity: number };
type Order = {
  id: string; status: OrderStatus; currency: string;
  subtotalCents: number; shippingCents: number; totalCents: number;
  shippingAddress: ShippingAddress; items: OrderItem[];
  createdAt: string; paidAt: string | null;
};
```

## Endpoints

### Health
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/health` | – | `{ data: { status: "ok" } }` |

### Auth
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | – | `{ name, email, password }` (password at least 8 chars) | `201 { data: User }` + sets cookie |
| POST | `/auth/login` | – | `{ email, password }` | `200 { data: User }` + sets cookie |
| POST | `/auth/logout` | – | – | `204`, clears cookie |
| GET | `/auth/me` | ✅ | – | `200 { data: User }` or `401` |

A wrong email and a wrong password both return the same `401 UNAUTHENTICATED` message
("Invalid email or password"), so attackers cannot tell which emails are registered.

### Categories
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/categories` | – | `{ data: Category[] }` |

### Products
| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/products` | – | `{ data: ProductSummary[], meta }` |
| GET | `/products/:slug` | – | `{ data: Product }` or `404` |

`GET /products` query params (all optional):
| Param | Type | Default | Notes |
|---|---|---|---|
| `search` | string | – | Matches name or description |
| `category` | string | – | Category **slug** |
| `minPrice`, `maxPrice` | int (minor units) | – | Inclusive |
| `sort` | `newest` \| `price_asc` \| `price_desc` \| `name_asc` | `newest` | |
| `page` | int ≥ 1 | 1 | |
| `limit` | int 1–48 | 12 | |
Only `isActive = true` products are returned.

### Cart
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/cart/validate` | – | `{ items: [{ productId, quantity }] }` | `{ data: { items: CartLine[], subtotalCents, shippingCents, totalCents, currency, issues: CartIssue[] } }` |
```ts
type CartLine = { product: ProductSummary; quantity: number; lineTotalCents: number };
type CartIssue = { productId: string; type: 'NOT_FOUND' | 'INACTIVE' | 'INSUFFICIENT_STOCK'; available?: number };
```

### Orders
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/orders` | ✅ | `{ items: [{ productId, quantity }], shippingAddress: ShippingAddress }` | `201 { data: { order: Order, checkoutUrl: string } }` · `409` if any stock or availability problem |
| GET | `/orders` | ✅ | – | `{ data: Order[] }`, newest first, only the current user's orders |
| GET | `/orders/:id` | ✅ | – | `{ data: Order }` · `404` if missing, `403` if not the owner |

### Webhooks
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/webhooks/stripe` | Stripe signature | **Raw body** (mounted before `express.json()`). On `checkout.session.completed`, in one transaction: mark the order `PAID`, set `paidAt`, decrement stock. Must be **idempotent**: if the order is already PAID, do nothing. On `checkout.session.expired`, mark the order `CANCELLED`. |

### Stripe redirect URLs (client routes)
- success: `${CLIENT_URL}/checkout/success?orderId={id}`
- cancel: `${CLIENT_URL}/checkout/cancel?orderId={id}`
