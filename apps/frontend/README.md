# MobileArena Frontend

Next.js App Router site for the MobileArena public website and `/admin` dashboard.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `apps/frontend/.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL`.

## Stack

- Next.js (App Router)
- Tailwind CSS
- Shared API client in `lib/api.ts`

The admin dashboard is a route group under `app/admin/` and uses the same build as the public site.
