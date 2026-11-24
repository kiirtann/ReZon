# Low-Fidelity Wireframes

> Mobile (`375px`) and Desktop (`1024px+`) wireframes for every route in [05-UI_DESIGN.md](../05-UI_DESIGN.md).
> Every async route documents its **Loading**, **Empty**, and **Error** states.

---

## 1. `/` — HomePage

### Mobile (`375px`)
```text
┌─────────────────────────┐
│ ShopLearn    [🔍] [🛒3] │  <- Header (sticky)
├─────────────────────────┤
│  HERO BANNER            │
│  Quality essentials     │
│  [Shop All Products]    │
├─────────────────────────┤
│ Categories (h-scroll)   │
│ [All][Tech][Home][Wear] │
├─────────────────────────┤
│ Featured Products       │
│ ┌──────────┐┌─────────┐ │
│ │  img     ││  img    │ │
│ │  Name    ││  Name   │ │
│ │  ₹999    ││  ₹499   │ │
│ └──────────┘└─────────┘ │
│ (2-col grid, 8 items)   │
├─────────────────────────┤
│ Footer                  │
└─────────────────────────┘
```

### Desktop (`1024px+`)
```text
┌───────────────────────────────────────────────────────────┐
│ ShopLearn   [ Search products...        ]    🛒 3   👤    │
├───────────────────────────────────────────────────────────┤
│  HERO: Headline + short subtitle + [Browse Catalog]       │
├───────────────────────────────────────────────────────────┤
│  Categories: [ Electronics ] [ Home ] [ Apparel ] [ Books ]│
├───────────────────────────────────────────────────────────┤
│  Featured Products                        [View all ->]   │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │ img       │ │ img       │ │ img       │ │ img       │  │
│  │ Name      │ │ Name      │ │ Name      │ │ Name      │  │
│  │ ₹999      │ │ ₹499      │ │ ₹1,299    │ │ ₹249      │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
└───────────────────────────────────────────────────────────┘
```
- **Loading:** 4 category `Skeleton` pills + 8 product card `Skeleton`s.
- **Empty:** `EmptyState` ("No featured products yet").
- **Error:** `Alert` (`danger`) with **Retry** button.

---

## 2. `/products` — ProductListPage

### Mobile (`375px`)
```text
┌─────────────────────────┐
│ ShopLearn    [🔍] [🛒3] │
├─────────────────────────┤
│ 57 results              │
│ [Filters ▾] [Newest ▾]  │  <- Filter drawer/accordion
├─────────────────────────┤
│ ┌──────────┐┌─────────┐ │
│ │ img      ││ img     │ │
│ │ Name     ││ Name    │ │
│ │ ₹999     ││ ₹499    │ │
│ └──────────┘└─────────┘ │
│      ‹ 1 2 3 4 5 ›      │
└─────────────────────────┘
```

### Desktop (`1024px+`)
```text
┌───────────────────────────────────────────────────────────┐
│ ShopLearn   [ Search products...        ]    🛒 3   👤    │
├──────────────┬────────────────────────────────────────────┤
│ Category     │ 57 results             Sort: [Newest ▾]    │
│ ○ All        │ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ ○ Electronics│ │ img      │ │ img      │ │ img      │     │
│ ○ Home       │ │ Name     │ │ Name     │ │ Name     │     │
│ Price        │ │ ₹999     │ │ ₹499     │ │ ₹1,299   │     │
│ [Min] - [Max]│ └──────────┘ └──────────┘ └──────────┘     │
│ [Apply]      │              ‹ 1 2 3 4 5 ›                 │
│ [Clear]      │                                            │
└──────────────┴────────────────────────────────────────────┘
```
- **Loading:** Grid of 12 `Skeleton` cards.
- **Empty:** `EmptyState` ("No products match your filters") + **Clear filters** button.
- **Error:** `Alert` (`danger`) with **Retry** button.

---

## 3. `/products/:slug` — ProductDetailPage

### Mobile (`375px`) & Desktop (`1024px+`)
```text
Mobile (stacked):               Desktop (2-column):
┌─────────────────────────┐     ┌───────────────────────────────────────────┐
│ [     Product Image   ] │     │ ┌───────────────────┐  Category Badge     │
│ Category Badge          │     │ │                   │  Product Name       │
│ Product Name            │     │ │   Product Image   │  ₹1,299.00          │
│ ₹1,299.00   [In Stock]  │     │ │                   │  [In Stock]         │
│ Description...          │     │ └───────────────────┘  Description...     │
│ Qty: [- 1 +]            │     │                        Qty: [- 1 +]       │
│ [     Add to Cart     ] │     │                        [  Add to Cart   ] │
└─────────────────────────┘     └───────────────────────────────────────────┘
```
- **Loading:** Image `Skeleton` + text/button `Skeleton`s.
- **Empty / 404:** `EmptyState` ("Product not found") + link to `/products`.
- **Error:** `Alert` (`danger`) with **Retry** (or out-of-stock disabled button with `Badge`).

---

## 4. `/cart` — CartPage

### Mobile (`375px`) & Desktop (`1024px+`)
```text
Mobile (stacked):               Desktop (2/3 + 1/3):
┌─────────────────────────┐     ┌───────────────────────────────────────────┐
│ Your Cart (2 items)     │     │ Cart Items              │ Order Summary   │
│ ┌─────────────────────┐ │     │ ┌─────────────────────┐ │ Subtotal  ₹1,498│
│ │ [img] Name          │ │     │ │ [img] Name  [- 1 +] │ │ Shipping    ₹99 │
│ │ ₹999  [- 1 +] [Rm]  │ │     │ │ ₹999        [Remove]│ │ Total     ₹1,597│
│ └─────────────────────┘ │     │ └─────────────────────┘ │ [Checkout]      │
│ Summary: Total ₹1,597   │     │ (Validation Alert if    │                 │
│ [ Proceed to Checkout ] │     │  stock/price changed)   │                 │
└─────────────────────────┘     └───────────────────────────────────────────┘
```
- **Loading:** `Skeleton` rows + summary skeleton while `POST /cart/validate` runs.
- **Empty:** `EmptyState` ("Your cart is empty") + **Browse products** button.
- **Error / Validation Issues:** `Alert` (`warning` for `INSUFFICIENT_STOCK`, `danger` for `NOT_FOUND` / `INACTIVE` / network error with retry). Checkout button disabled while blocking issues exist.

---

## 5. `/login` & `/register` — Auth Pages

### Mobile (`375px`) & Desktop (`1024px+`, centered card `max-w-md`)
```text
┌─────────────────────────┐
│      Sign in            │
│ ┌─────────────────────┐ │
│ │ [Alert if 401/err]  │ │
│ │ Email               │ │
│ │ [you@example.com  ] │ │
│ │ Password            │ │
│ │ [••••••••         ] │ │
│ │ [     Sign in     ] │ │
│ │ No account? Register│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```
- **Loading:** Submit `Button` shows `loading` spinner and disables inputs.
- **Error:** `Alert` (`danger`) at top of form for `401` / `409`, plus inline field errors under `FormField` for `400 VALIDATION_ERROR`.
- **Guest-only behavior:** Authenticated users visiting `/login` or `/register` redirect to `?redirect` or `/`.

---

## 6. `/checkout` — CheckoutPage (Protected)

### Mobile (`375px`) & Desktop (`1024px+`)
```text
Mobile (stacked):               Desktop (2/3 + 1/3):
┌─────────────────────────┐     ┌───────────────────────────────────────────┐
│ Shipping Address        │     │ Shipping Address       │ Order Summary    │
│ Full Name  [          ] │     │ Full Name  [         ] │ 2 items          │
│ Line 1     [          ] │     │ Line 1     [         ] │ Subtotal   ₹1,498│
│ City/State [   ] [    ] │     │ Line 2     [         ] │ Shipping     ₹99 │
│ Postal/Ph  [   ] [    ] │     │ City [  ] State [    ] │ Total      ₹1,597│
│ Summary: Total ₹1,597   │     │ Postal [ ] Phone [   ] │ [ Pay with Stripe]│
│ [   Pay with Stripe   ] │     └───────────────────────────────────────────┘
└─────────────────────────┘
```
- **Guest redirect:** Unauthenticated users are redirected to `/login?redirect=/checkout`.
- **Loading:** `Skeleton` during initial `POST /cart/validate`; submit button `loading` during `POST /orders`.
- **Empty cart:** Redirects to `/cart` or shows `EmptyState` ("Your cart is empty").
- **Error:** `400` field errors under `FormField`; `409 CONFLICT` or `500` shows `Alert` (`danger`) with link back to `/cart` or retry.

---

## 7. `/checkout/success` & `/checkout/cancel`

```text
Success (?orderId=...):          Cancel (?orderId=...):
┌─────────────────────────┐     ┌─────────────────────────┐
│ [Spinner] Confirming... │     │ [Alert: Warning]        │
│ (or)                    │     │ Payment cancelled       │
│ [✓] Order Confirmed!    │     │ Your cart is still      │
│ Order #abc123 · PAID    │     │ saved.                  │
│ [View Order] [Shop More]│     │ [Return to Cart]        │
└─────────────────────────┘     └─────────────────────────┘
```
- **Success Loading:** `Spinner` + "Confirming payment..." while polling `GET /orders/:id` until `status === 'PAID'`.
- **Success Error / Timeout:** `Alert` (`warning` if still `PENDING` after timeout, `danger` if `403`/`404`/network error).

---

## 8. `/orders` & `/orders/:id` (Protected)

### `/orders` — OrderHistoryPage
- **Mobile & Desktop:** Vertical list of `Card`s (`Order #...`, date, `OrderStatusBadge`, item count, `Price`, "View details" link).
- **Loading:** 3 `Skeleton` order cards.
- **Empty:** `EmptyState` ("You haven't placed any orders yet") + **Start shopping** button.
- **Error:** `Alert` (`danger`) with **Retry**.

### `/orders/:id` — OrderDetailPage
- **Mobile & Desktop:** Back link to `/orders`, Order ID + `OrderStatusBadge` + timestamps, line items table/list, shipping address card, totals breakdown (`Subtotal`, `Shipping`, `Total`).
- **Loading:** `Skeleton` header + line items.
- **Error:** `403` / `404` shows `Alert` (`danger`) + link to `/orders`.

---

## 9. `*` — NotFoundPage
- Centered `EmptyState` ("404 — Page not found") with **Go Home** and **Browse Products** buttons.
