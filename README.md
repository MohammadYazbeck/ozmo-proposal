# Proposal Builder

Internal proposal dashboard for Ozmo with bilingual EN/AR public proposals.

## Setup

1. Copy environment variables:
   - `cp .env.example .env` (or `copy .env.example .env` on Windows)
2. Install dependencies:
   - `npm install`
3. Run database migrations:
   - `npx prisma migrate dev --name init`
4. Seed sample proposals:
   - `npm run seed`
5. Start the dev server:
   - `npm run dev`

Optional:
- `npm run studio` to open Prisma Studio.

## Admin Login

Set `ADMIN_USER` and `ADMIN_PASS` in `.env` to access `/login`.

Required environment variables:
- `DATABASE_URL` (SQLite, e.g. `file:./dev.db`)
- `ADMIN_USER`
- `ADMIN_PASS`
- `SESSION_SECRET`

## Notes

- Public proposals are available at `/p/[slug]`.
- Draft proposals return 404 on the public route.
