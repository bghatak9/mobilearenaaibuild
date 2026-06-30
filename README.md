# MobileArena

A full-scale smartphone discovery platform: phone database, advanced finder,
side-by-side comparison engine, news + reviews CMS, ratings/comments, admin panel,
and SEO-optimized public site.

## Tech stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | Next.js (App Router) + TailwindCSS  |
| Backend      | NestJS (REST API)                   |
| ORM          | Prisma                              |
| Database     | PostgreSQL                          |
| Auth         | JWT + refresh tokens                |

## Monorepo layout

```
mobilearena/
├── apps/
│   ├── backend/     # NestJS API (devices, brands, reviews, news, comments, auth, ...)
│   └── frontend/    # Next.js public website + /admin dashboard
├── packages/
│   ├── ui/          # Shared UI primitives
│   ├── types/       # Shared domain types
│   ├── config/      # Shared tsconfig / config base
│   └── utils/       # Shared, dependency-free helpers
└── .github/workflows/  # CI (build/lint/test) + deploy (container images)
```

> The admin dashboard ships as a `/admin` route group inside `apps/frontend`,
> so it reuses the public site's API client, styling and build pipeline.

This repo uses **npm workspaces**. Install everything from the root:

```bash
npm install
```

## Common commands

```bash
npm run dev:backend       # start NestJS in watch mode
npm run dev:frontend      # start Next.js dev server
npm run prisma:migrate    # apply database migrations
npm run prisma:generate   # regenerate the Prisma client
```

## Environment

Copy the example env files and adjust as needed:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

| Variable               | App      | Purpose                                              |
| ---------------------- | -------- | ---------------------------------------------------- |
| `DATABASE_URL`         | backend  | PostgreSQL connection string (Prisma)                |
| `JWT_SECRET`           | backend  | Signing secret for JWT access tokens                 |
| `NEXT_PUBLIC_API_URL`  | frontend | Base URL of the REST API                             |
| `NEXT_PUBLIC_SITE_URL` | frontend | Public origin for canonical URLs, sitemap, OG tags   |

## Database

The Prisma schema lives in `apps/backend/prisma/schema.prisma`. Set
`DATABASE_URL` in `apps/backend/.env` to a running PostgreSQL instance, then run
`npm run prisma:migrate`. A demo dataset (4 fully-specced phones + a sample
news/review) is available via `npm run prisma:seed --workspace apps/backend`.

## Admin dashboard

The admin lives at `/admin` (e.g. http://localhost:3000/admin).

### Role hierarchy

```
SUPER_ADMIN  →  platform owner (1–2 accounts)
  └── ADMIN    →  business/content management
        ├── EDITOR    →  publish news & reviews
        ├── AUTHOR    →  write drafts
        └── MODERATOR →  comment moderation
```

Staff sign in at `/admin/login` via `POST /admin/auth/login` (normal `USER`
accounts are rejected). Public signup (`POST /auth/register`) always creates
`USER` accounts only.

After seeding, default staff accounts are available:

| Role | Email / User ID | Password |
|------|-----------------|----------|
| SUPER_ADMIN | `superadmin@mobilearena.com` / `superadmin` | `SuperAdmin123!` |
| ADMIN | `admin@mobilearena.com` / `admin` | `Admin123!` |
| ADMIN (test) | `testadmi@mobilearena.com` / `testadmi` | `TestAdmi123!` |
| EDITOR | `editor@mobilearena.com` / `editor` | `Editor123!` |

Override with `SUPER_ADMIN_*`, `ADMIN_*`, `TEST_ADMIN_*`, or `EDITOR_*` env vars
before `npm run prisma:seed --workspace apps/backend`.

### Features by role

| Area | SUPER_ADMIN | ADMIN | EDITOR | AUTHOR | MODERATOR |
|------|:-----------:|:-----:|:------:|:------:|:---------:|
| Phones | ✓ | ✓ | | | |
| News | ✓ | ✓ | ✓ | | |
| Brands | ✓ | ✓ | | | |
| Images | ✓ | ✓ | ✓ (article) | ✓ (own article) | |
| Prices | ✓ | ✓ | | | |
| Users | ✓ | | | | |
| User management UI | ✓ | | | | |
| Devices (CRUD) | ✓ | ✓ | | | |
| Comment moderation | ✓ | ✓ | ✓ | | ✓ |
| Bulk upload | ✓ | ✓ | news + article images | article images | |
| Audit logs | ✓ | ✓ | | | |

Server-side JWT + `@Roles()` guards enforce every write endpoint; the admin
sidebar hides sections the signed-in role cannot access.

## SEO

The public site emits per-page metadata, canonical URLs, Open Graph + Twitter
cards, and JSON-LD structured data:

- Phones → `Product` (with `offers` + `aggregateRating`)
- News → `NewsArticle`
- Reviews → `Review`

`app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and `/robots.txt`
from live API data.

## Monitoring & analytics

The API exposes operational endpoints and ships structured request logging:

- `GET /health` — liveness (process up + uptime).
- `GET /health/ready` — readiness; checks Postgres and Redis. Returns `503`
  when the database is unreachable (a down/disabled cache is tolerated).
- `GET /metrics` — Prometheus exposition: default Node/process metrics plus
  `http_requests_total` and `http_request_duration_seconds` (labelled by
  method, matched route and status).
- Every request logs `METHOD url status duration` (health/metrics are silenced).
- Unhandled errors are normalised by a global exception filter; set `SENTRY_DSN`
  to forward 5xx errors to Sentry (no-op when unset).

The frontend reports Core Web Vitals and can load a privacy-friendly analytics
script — both are opt-in via `NEXT_PUBLIC_VITALS_ENDPOINT`,
`NEXT_PUBLIC_ANALYTICS_SRC` and `NEXT_PUBLIC_ANALYTICS_DOMAIN`.

## CI/CD

GitHub Actions workflows live in `.github/workflows/`:

- **`ci.yml`** — on every push/PR: installs deps, generates the Prisma client,
  applies migrations against a Postgres service, lints, builds and tests both
  apps.
- **`deploy.yml`** — on push to the default branch: builds the backend and
  frontend Docker images and pushes them to GitHub Container Registry (GHCR).
  The final `deploy` job is a placeholder — drop in your provider's action/CLI
  (Fly.io, Render, ECS, a VPS over SSH, …) and the matching secrets.

### Run the full stack with Docker

```bash
docker compose up --build
# frontend → http://localhost:3000, API → http://localhost:4000
```
