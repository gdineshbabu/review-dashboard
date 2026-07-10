# The Review Dash

A small internal tool that pulls recent reviews for AliveCor products (KardiaMobile)
into PostgreSQL and displays the latest 20 on a clean dashboard.

Reviews are **fetched and stored** separately from **display**: an ingestion pipeline
writes to Postgres, and the dashboard reads from the database through our own REST
API — it never hits the upstream source on page load.

![architecture](https://img.shields.io/badge/Next.js-15-black) ![db](https://img.shields.io/badge/PostgreSQL-16-blue) ![orm](https://img.shields.io/badge/Prisma-6-2D3748)

---

## Stack

- **Next.js 15** (App Router, React 19, TypeScript)
- **PostgreSQL 16** via **Prisma** (schema + migrations)
- **REST API** built with Next.js Route Handlers
- **Tailwind CSS v4** + **shadcn/ui** components
- **Docker Compose** for the database

---

## Prerequisites

- **Node.js 18.18+** (tested on Node 24)
- **Docker** (for the Postgres database) — or your own local Postgres

---

## Quick start (from a clean clone)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # defaults work out of the box

# 3. Start PostgreSQL
docker compose up -d db

# 4. Create the schema
npx prisma migrate deploy

# 5. Load reviews into the database
npm run seed

# 6. Run the app
npm run dev
```

Open **http://localhost:3000** — you'll see the latest 20 reviews, newest first,
with summary stats and a rating breakdown. Use **Refresh reviews** to run ingestion
again (deduplicated), or the filters to narrow by rating/source.

> **Port 5432 already in use?** Start the DB on another port and point your `.env` at it:
> ```bash
> DB_PORT=5544 docker compose up -d db
> # then set DATABASE_URL=...localhost:5544/... in .env
> ```

---

## Environment variables

See `.env.example`. Nothing is required beyond `DATABASE_URL` for the default setup.

| Variable            | Default                        | Purpose                                                        |
| ------------------- | ------------------------------ | -------------------------------------------------------------- |
| `DATABASE_URL`      | `postgresql://…5432/reviewdash`| Postgres connection string (matches `docker-compose.yml`).     |
| `REVIEW_SOURCE`     | `mock`                         | Which upstream to ingest from: `mock` or `amazon`.             |
| `AMAZON_API_KEY`    | _(empty)_                      | Key for a real Amazon scraping provider. Empty ⇒ falls back to mock. |
| `NEXT_PUBLIC_APP_URL`| `http://localhost:3000`       | Base URL the dashboard uses to call our own API.               |

**On the review source:** Amazon has no public reviews API, and scraping product
pages reliably needs rotating proxies / a paid provider and violates Amazon's ToS.
Per the assignment ("if a source needs a key, mock it and document it"), the default
`mock` source ships realistic fixture data and **simulates the messy realities** —
latency, transient failures, rate limiting, and inconsistent fields — so the app runs
from a clean clone with zero credentials. A documented `AmazonReviewSource`
(`src/lib/sources/amazon-source.ts`) shows the real integration seam; it activates
only when `AMAZON_API_KEY` is set and otherwise falls back to mock.

---

## REST API

| Method & path                | Description                                                        |
| ---------------------------- | ----------------------------------------------------------------- |
| `GET /api/reviews`           | Latest reviews, newest first. Query: `limit` (1–100, default 20), `rating` (1–5), `source`. |
| `GET /api/stats`             | Aggregate metrics: total, average rating, rating distribution, positive share. |
| `POST /api/reviews/refresh`  | Runs the ingestion pipeline (fetch → normalize → dedupe → store) and returns a summary. |

```bash
# Examples
curl http://localhost:3000/api/reviews
curl "http://localhost:3000/api/reviews?rating=5"
curl http://localhost:3000/api/stats
curl -X POST http://localhost:3000/api/reviews/refresh
```

---

## How ingestion works

```
source (mock | amazon)  ──►  fetchWithRetry (timeouts, exp. backoff)
        │
        ▼
   normalize  ──► coerces messy raw fields (stringy ratings, varied date
        │         formats, body under different keys) into a strict shape;
        │         drops unusable rows instead of failing the whole batch
        ▼
   dedupe + store  ──► upsert keyed on a unique (source, externalId); when a
                       source gives no id, a deterministic content hash is used,
                       so re-ingesting the same review is a no-op
```

Dedup is enforced at the database level (`@@unique([source, externalId])`), so
"don't re-fetch what you already have" holds even across concurrent refreshes.

---

## Project structure

```
src/
  app/
    page.tsx                 # dashboard (server component, reads via REST API)
    api/
      reviews/route.ts       # GET latest reviews (+ filters)
      reviews/refresh/route.ts # POST trigger ingestion
      stats/route.ts         # GET aggregate stats
  components/
    ui/                      # shadcn/ui components (button, card, badge, select)
    review-card.tsx, review-filters.tsx, refresh-button.tsx,
    stat-card.tsx, rating-distribution.tsx, star-rating.tsx
  lib/
    db.ts                    # Prisma client singleton
    ingest.ts                # fetch → normalize → dedupe → store (retry/backoff)
    normalize.ts             # taming inconsistent upstream data
    reviews.ts               # read/query + aggregate stats
    api-client.ts            # server-side fetch of our own API
    sources/                 # ReviewSource abstraction: mock, amazon, registry
prisma/schema.prisma         # Review model + unique constraint
scripts/seed.ts              # deterministic DB seed
docker-compose.yml           # Postgres 16
```

---

## Useful scripts

```bash
npm run dev         # start the dev server
npm run build       # production build (runs prisma generate)
npm run start       # start the production server
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run seed        # load fixtures into the DB (idempotent)
npm run db:migrate  # create/apply a migration in dev
npm run db:studio   # open Prisma Studio
```
