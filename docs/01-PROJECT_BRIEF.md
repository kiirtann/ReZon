# 01. Project Brief

## Vision
**ShopLearn** (working name, rename anytime) is a small, realistic online store. We build it to learn
how a production web app works end to end: UI design, frontend, REST API, database, authentication,
payments, testing and deployment.

## Users
| Role | Can do |
|---|---|
| Guest | Browse, search and filter products, view details, add to cart |
| Customer (logged in) | Everything a guest can, plus check out, pay, and view order history |
| Admin | *Out of scope for v1.* Products are managed with the seed script and Prisma Studio |

## v1 features (in scope)
1. **Product catalog**: list with pagination, category filter, price range, sort, and text search
2. **Product detail** page
3. **Cart**: add, remove, change quantity, persisted in localStorage, works for guests
4. **Auth**: sign up, log in, log out, "who am I", protected routes
5. **Checkout**: the server validates the cart, creates a pending order, and redirects to Stripe Checkout
6. **Payments**: Stripe test mode. A webhook marks the order paid and reduces stock
7. **Orders**: order history list and order detail for the logged-in user

## Out of scope for v1 (maybe later)
Admin panel, reviews and ratings, wishlists, coupons, multiple addresses, emails, inventory
reservations, multiple currencies, i18n.

## Success criteria
- A new user can go from the home page to a paid order (Stripe test card `4242 4242 4242 4242`)
  and see that order in their history.
- A user cannot change a price or total from the browser.
- Everything runs locally with `npm install && npm run dev`.
- Each phase has learning notes that explain what was built and why.

## Constraints
- Local machine: Node 20, no Docker, no local PostgreSQL. So we develop on SQLite.
- Currency: INR by default, stored in paise. Set by `CURRENCY` in the env.
  Note: Stripe accounts based in India are invite-only. Test mode with any Stripe account works,
  and USD is an acceptable fallback.
