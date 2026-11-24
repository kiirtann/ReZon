# Production Deployment Guide (Phase 10)

This guide takes ShopLearn from local SQLite development to production on **PostgreSQL (Neon / Supabase)**, **Render** (Express API), **Vercel** (React SPA), and **Stripe** webhooks.

---

## 1. Create a PostgreSQL Database (Neon or Supabase)
1. Create a free project on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the PostgreSQL connection string (`postgresql://USER:PASSWORD@HOST/DB?sslmode=require`).

> **Why `schema.postgres.prisma`?**
> Local development and `npm test` use SQLite (`server/prisma/schema.prisma`) so nothing extra needs to be installed locally. `server/prisma/schema.postgres.prisma` is the exact same schema with `provider = "postgresql"`.

To test the PostgreSQL migration and seed locally against your cloud DB:
```bash
cp server/prisma/schema.postgres.prisma server/prisma/schema.prisma
DATABASE_URL="postgresql://..." npx --workspace=server prisma migrate deploy
DATABASE_URL="postgresql://..." npm run db:seed
```
*(Remember to restore `git checkout server/prisma/schema.prisma` if you want to continue developing locally on SQLite.)*

---

## 2. Deploy the API (Render)
1. Push your repository to GitHub.
2. On [Render](https://render.com), choose **New → Blueprint** and select your repo (it reads [render.yaml](../render.yaml)).
3. Fill in the prompted environment variables:
   - `DATABASE_URL`: your Neon/Supabase PostgreSQL URL
   - `CLIENT_URL`: your Vercel frontend URL (e.g. `https://shoplearn.vercel.app`, no trailing slash)
   - `STRIPE_SECRET_KEY`: `sk_test_...` (or `sk_live_...`)
   - `STRIPE_WEBHOOK_SECRET`: from step 4 below
4. After the first deploy, run the seed script once from Render's Shell tab:
   ```bash
   npm run db:seed
   ```
5. Verify `https://<your-api>.onrender.com/api/v1/health` returns `{"data":{"status":"ok"}}`.

---

## 3. Deploy the Client (Vercel)
1. On [Vercel](https://vercel.com), import the same GitHub repository.
2. Set **Root Directory** to `client`.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - [client/vercel.json](../client/vercel.json) handles SPA rewrites so refreshing `/products` or `/orders` never 404s.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://<your-api>.onrender.com` (no trailing slash)
4. Deploy, then copy your live Vercel URL back into Render's `CLIENT_URL` variable.

---

## 4. Configure the Production Stripe Webhook
1. In the Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
   - **Endpoint URL**: `https://<your-api>.onrender.com/api/v1/webhooks/stripe`
   - **Events to listen to**:
     - `checkout.session.completed`
     - `checkout.session.expired`
2. Copy the **Signing secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` on Render.

---

## 5. Production Smoke Test
1. Open `https://shoplearn.vercel.app`, register a new account (or log in with `demo@shoplearn.dev` / `Password123!`).
2. Add a product to your cart, go to `/checkout`, submit your address, and pay with Stripe test card `4242 4242 4242 4242`.
3. Confirm `/checkout/success` transitions to `Paid`, clears your cart, and the order appears in `/orders`.
