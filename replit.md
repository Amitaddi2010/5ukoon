# Sukoon

A curated mehfil-style evening experience in Chandigarh blending live music, shayari, and guided storytelling — with a full event management system.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/sukoon run dev` — run the frontend (port 18810)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + Framer Motion + wouter
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — DB schema (events, attendance_requests, guests, admins)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/sukoon/src/` — React frontend (landing page, invitation form, admin dashboard)

## Product

- **Public landing page** (`/`) — Full scroll site: hero, why Sukoon, the arc (5 phases), safety norms, upcoming event, team bios, FAQ, footer
- **Request an Invitation** (`/request`) — Multi-step form, one question per screen, submits to pending queue
- **Admin login** (`/admin`) — Session-based auth
- **Admin dashboard** (`/admin/requests`) — Review all requests, Approve / Decline / Waitlist actions, live seat counter
- **Day-of check-in** (`/admin/checkin`) — Mobile-friendly, search by name, mark arrived

## Admin credentials (dev)

- Username: `amit`
- Password: `sukoon2026`

## Architecture decisions

- Session-based auth (express-session + SESSION_SECRET) — simple and appropriate for a small team admin panel
- SHA-256 password hashing with server-side salt (`sukoon-salt-2026`) — change salt in production
- Approval creates a guest record + ticket code (SKN-XXXXXXXX format) atomically
- OpenAPI spec is the contract between frontend and backend — always edit spec first, then run codegen
- Admin routes check `req.session.admin` — all admin endpoints return 401 if not logged in

## Gotchas

- After any OpenAPI spec change, always run `pnpm --filter @workspace/api-spec run codegen` before touching frontend code
- The `format: email` OpenAPI field is removed — it generates Zod v4-incompatible code
- Change the admin password hash in production (re-seed with the new password using the hashPassword function in `src/routes/admin.ts`)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
