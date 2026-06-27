# MobileArena

A full-scale, GSMArena-style smartphone platform: phone database, advanced finder,
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

The admin lives at `/admin` (e.g. http://localhost:3000/admin) and covers:

- **News** — create/edit/delete articles, set status (`DRAFT` / `REVIEW` /
  `PUBLISHED`) and the "featured" flag.
- **Reviews** — create/edit/delete reviews, pick the reviewed device, set the
  score and pros/cons.
- **Moderation** — list and remove user comments across all devices.

Sign in at `/admin/login` with a user created via `POST /auth/register`. The
token is stored client-side and forwarded as a `Bearer` token on writes. The
admin UI is excluded from indexing via `robots.txt`.

## SEO

The public site emits per-page metadata, canonical URLs, Open Graph + Twitter
cards, and JSON-LD structured data:

- Phones → `Product` (with `offers` + `aggregateRating`)
- News → `NewsArticle`
- Reviews → `Review`

`app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and `/robots.txt`
from live API data.

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
