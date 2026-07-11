# Deploying The Review Dash (Render)

This app has two parts: the **Next.js web service** and a **PostgreSQL database**.
Render can host both. There are two ways to do it — a one-click Blueprint (recommended)
or manual setup.

> Never put secrets in the repo. Set `DATABASE_URL` and friends in the Render
> dashboard / Blueprint, not in a committed `.env`.

---

## Option A — Blueprint (one click)

The repo ships a [`render.yaml`](./render.yaml) that provisions the web service and a
free Postgres and wires them together.

1. Push this repo to GitHub (public).
2. In Render: **New → Blueprint** → select the repo.
3. Render reads `render.yaml`, creates:
   - `reviewdash-db` (Postgres, free plan)
   - `review-dash` (Node web service, free plan)
   and injects `DATABASE_URL` automatically.
4. Click **Apply**. The build runs:
   `install → prisma generate → migrate deploy → seed → next build`.
5. When it goes live, open the service URL (e.g. `https://review-dash.onrender.com`).

That's it — the DB is migrated and seeded with ~3000 reviews on first deploy.

---

## Option B — Manual (two services)

**1. Create the database**
- Render → **New → PostgreSQL** → name `reviewdash-db`, free plan → **Create**.
- Copy its **Internal Database URL**.

**2. Create the web service**
- Render → **New → Web Service** → connect this repo.
- **Runtime:** Node · **Build command:**
  ```
  npm install --include=dev && npm run db:generate && npm run db:deploy && npm run seed && npm run build
  ```
- **Start command:** `npm run start`
- **Health check path:** `/api/stats`

**3. Environment variables** (Service → Environment):

| Key                   | Value                                            |
| --------------------- | ------------------------------------------------ |
| `DATABASE_URL`        | the Internal Database URL from step 1            |
| `REVIEW_SOURCE`       | `mock`                                           |
| `REVIEWS_PER_PRODUCT` | `1000`                                           |
| `NODE_VERSION`        | `20`                                             |

`RENDER_EXTERNAL_URL` is provided by Render automatically and the app uses it to
call its own REST API, so you don't need to set `NEXT_PUBLIC_APP_URL`.

**4. Deploy.** First build migrates + seeds the DB. Subsequent deploys re-run seed
idempotently (inserts 0). Remove `npm run seed` from the build command if you'd
rather seed once via the Render **Shell** (`npm run seed`).

---

## Notes & gotchas

- **Dev dependencies:** Render sets `NODE_ENV=production`, which makes `npm install`
  skip devDeps. We pass `--include=dev` so the Prisma CLI, `tsx`, and TypeScript are
  available at build time.
- **Free Postgres expires** 90 days after creation on Render's free tier. For anything
  long-lived, use a paid plan or a provider like Neon/Supabase and just set `DATABASE_URL`.
- **Cold starts:** free web services sleep after inactivity; the first request after a
  sleep takes a few seconds to wake.
- **Re-seeding / changing volume:** change `REVIEWS_PER_PRODUCT` and redeploy, or run
  `npm run seed` from the Render Shell.
- **Other hosts:** the same setup works on Railway (all-in-one) or Vercel + Neon — only
  the dashboard steps differ. The `RENDER_EXTERNAL_URL`/`VERCEL_URL` fallbacks in
  `src/lib/api-client.ts` mean the app finds its own URL on either platform.
