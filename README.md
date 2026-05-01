# HarborList — boat rental marketplace

Full-stack marketplace (browse, list, book, pay) built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma**, **JWT cookies**, and **Stripe Checkout** (test mode).

## Requirements

- **Node.js 20.9+** (Next.js 16 and tooling expect Node 20)
- **PostgreSQL 14+** (or use the included Docker Compose service)
- A **Stripe** account with test API keys

## Quick start

### 1. Clone and install

```bash
npm install
```

### 2. Database

Start Postgres (example using Compose from the repo root):

```bash
docker compose up -d
```

Copy environment template and adjust if needed:

```bash
cp .env.example .env
```

Default `DATABASE_URL` in `.env.example` matches `docker-compose.yml`.

Push schema and seed demo data:

```bash
npx prisma db push
npm run db:seed
```

Seed accounts (password `password123`):

- `owner@example.com` — owner with listings  
- `customer@example.com` — customer with a sample booking  
- `both@example.com` — owner with additional listings  

### 3. Stripe (test mode)

In the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys), create **test** keys and add to `.env`:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional for future client-side Stripe.js)

For webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 4. JWT and app URL

Set a long random `JWT_SECRET` (32+ characters).

Set `NEXT_PUBLIC_APP_URL` to your dev URL (e.g. `http://localhost:3000`) so Stripe redirect URLs are correct.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Next.js dev server                   |
| `npm run build`   | `prisma generate` + production build |
| `npm run start`   | Start production server              |
| `npm run db:push` | Push Prisma schema to the database   |
| `npm run db:seed` | Run `prisma/seed.ts`                 |
| `npm run db:studio` | Open Prisma Studio                 |

## Environment variables

See [`.env.example`](./.env.example) for all variables. Important ones:

| Variable                         | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| `DATABASE_URL`                   | PostgreSQL connection string                 |
| `JWT_SECRET`                     | Symmetric key for JWT (httpOnly cookie)      |
| `NEXT_PUBLIC_APP_URL`            | Public site URL (Stripe redirects)         |
| `STRIPE_SECRET_KEY`              | Stripe secret key (test `sk_test_…`)       |
| `STRIPE_WEBHOOK_SECRET`          | Webhook signing secret (`whsec_…`)         |
| `PLATFORM_SERVICE_FEE_RATE`      | Decimal fraction, default `0.10` (10%)     |

## Architecture (high level)

- **`src/app/(main)/`** — App Router pages (home, listings, boat detail, booking, profile, dashboard, auth, terms).
- **`src/app/api/`** — Route handlers (auth, boats, bookings, Stripe, reviews, favorites, messages, uploads).
- **`src/features/`** — Feature-oriented UI (shell, listings, booking, dashboard, map, messages, profile, auth).
- **`src/data/`** — Shared server data access used by pages and aligned with API filters.
- **`src/lib/`** — Prisma client, auth (jose), Stripe, money/fee helpers, Zod schemas.
- **`prisma/`** — Schema and seed.

Uploaded listing images are stored under `public/uploads/` (local disk). For production, swap to object storage (S3, etc.) and store URLs only.

## Payments

- Creating a booking inserts `Booking` (`PENDING`) and `Payment` (`PENDING`) with **subtotal**, **service fee**, and **owner** share.
- **Stripe Checkout** charges the renter the rental total; the fee split is recorded in Postgres for reporting (this demo does not use Stripe Connect for automatic owner payouts).

## License

Private / your choice — not specified in this template.
