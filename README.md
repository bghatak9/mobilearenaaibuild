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
│   ├── backend/     # NestJS API (devices, brands, reviews, news, auth, ...)
│   ├── frontend/    # Next.js public website
│   └── admin/       # Admin panel (planned)
├── packages/
│   ├── ui/          # Shared UI primitives
│   ├── types/       # Shared domain types
│   ├── config/      # Shared tsconfig / config base
│   └── utils/       # Shared, dependency-free helpers
├── docker/          # Production container assets
└── docs/            # Architecture & design docs
```

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

## Database

The Prisma schema lives in `apps/backend/prisma/schema.prisma`. Set
`DATABASE_URL` in `apps/backend/.env` to a running PostgreSQL instance, then run
`npm run prisma:migrate`.
