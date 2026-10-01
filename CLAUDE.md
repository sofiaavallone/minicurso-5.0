# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Cápsula do tempo**: a site for writing letters ("cápsulas") to your future self, to be opened on a set date. pnpm + Turborepo monorepo, all TypeScript. `CONTEXT.md` is the detailed architecture/conventions doc (in Portuguese); read it for anything not covered here and keep it updated when adding apps, ports or conventions.

## Path gotcha

The front-end folder is **`apps/client`**, but its package name is `web`, so `--filter=web` and `pnpm dev:web` target it.

## Commands

Run from the repo root:

```bash
pnpm install            # also runs `prisma generate` via server postinstall
pnpm dev                # Next.js only (:3000), runs locally, not in Docker
pnpm docker:up          # postgres (:5433) + server (:3002) + adminer (:8080) + mailpit (SMTP :1025, UI :8025)
pnpm docker:logs        # server logs; ready when "🚀 Server ready" + "📦 Successfully connected" appear
pnpm docker:rebuild     # rebuild server image
pnpm build              # turbo build of all apps (packages build first)
pnpm lint               # eslint in every app
pnpm format             # prettier write (format:check to verify)
pnpm db:push | db:migrate | db:studio | db:generate   # Prisma, forwarded to apps/server
```

Type-check the client alone: `cd apps/client && npx tsc --noEmit`. There is **no test framework** configured.

Prisma CLI outside Docker needs `DATABASE_URL` pointing to `localhost:5433`. The host `postgres` only resolves inside the compose network. The server container runs `prisma db push` on every start.

Ports 5433/3002 can clash with other local Docker projects. If `docker:up` fails on a busy port, the half-created `monorepo_postgres` is left with no network (`P1001: Can't reach database server at postgres:5432`). Free the port, then `docker compose up -d --force-recreate postgres server`.

## Architecture

- **`apps/client`**: Next.js 15 App Router, React 19, Tailwind v3. Runs locally.
- **`apps/server`**: Express 4 + Prisma 7, runs in Docker (source is bind-mounted; on Windows `tsx watch` does not see file changes through the mount, so run `docker compose restart server` after editing server code). Layers: `routes/` → `controllers/` → `services/` (only services touch Prisma). Files are named `<entity>.<layer>.ts`. `users.*` is the reference template for new resources.
- **`packages/types`** (`@repo/types`): every entity shared between apps lives here, mirroring Prisma models, with `DateTime` typed as ISO `string`. All API responses use `ApiResponse<T>` (`{ data, message?, error? }`).
- **`packages/utils`** (`@repo/utils`), **`packages/config`**: shared helpers and base tsconfig/eslint. Consumed as TS source (no build step), resolved via tsconfig `paths`.

### Prisma 7 specifics

The DB URL is **not** in `schema.prisma`. It comes from `apps/server/prisma.config.ts` (`process.env.DATABASE_URL`). At runtime `PrismaClient` is built with the `@prisma/adapter-pg` driver adapter in `apps/server/src/lib/prisma.ts`, the single shared instance that services import. `users.service.ts` still returns mocks.

### Client ↔ server data flow

- `apps/client/src/lib/api.ts` owns the single Axios instance (`api`). Don't import `axios` elsewhere. `apiGet<T>(path, fallback)` returns `{ data, isMocked }`. On any failure it returns the required `fallback` (from `lib/mocks.ts`), and the UI must then show the yellow "Modo offline" banner. This lets the front-end run without Docker.
- `app/page.tsx` is a Server Component that fetches and passes data to client components. It is `force-dynamic` because capsule state depends on today's date.

### Page layout

`app/page.tsx` fetches `GET /capsules` and renders `HomeView`, which owns the capsule list: Hero + `CreateCapsuleModal` on top and `CapsuleBoard` ("Minhas cápsulas") below, with the "Modo offline" banner between them when the fetch falls back to `mockCapsules`. A capsule saved in the modal is appended to that list, so it shows up on the board right away.

### Capsule feature

- `Capsule` in `@repo/types` has `title`, `message`, `openDate` (local date `AAAA-MM-DD`, stored as `@db.Date`), `category` (`memoria | sonho | meta`), `color` (`rosa | laranja | lima | vinho`), `email`, `createdAt` and `sentAt`. Category/color lists are the `CAPSULE_CATEGORIES` / `CAPSULE_COLORS` constants, shared by the zod schema and the UI.
- `/capsules`: `GET /` lists every capsule ordered by `openDate`; **a capsule still locked (`openDate` after today) comes back with `message: ""`**, so the content never leaves the server early (`isCapsuleLocked` in the service, `isCapsuleReady` in the client: keep them in sync). `DELETE /:id` returns 204, or 404 if the capsule doesn't exist. `POST /` validates with zod (`schemas/capsule.schema.ts`, `openDate` must be today or later in `APP_TIMEZONE`) and returns 400 `{ error: "validation", fieldErrors }` on failure; `GET /email-preview` renders the e-mail template for design work.
- Delivery is by e-mail: `jobs/send-due-capsules.ts` runs every 10 min (and right after a capsule due today is created), claims each due capsule (`sentAt`) before sending, and releases it if sending fails. SMTP comes from `lib/mailer.ts` (`SMTP_*` env vars); without `SMTP_HOST` the job is disabled. In dev, read the e-mails in Mailpit at http://localhost:8025.
- Day math (`todayStr`, date parsing) is in `lib/dates.ts` on the server and `lib/capsules.ts` on the client; "today" is computed in `APP_TIMEZONE`, not the server's UTC.
- `notFoundHandler` (JSON 404) and then `errorHandler` (400 bad JSON, 413 body too large, 500) from `middlewares/errorHandler.ts` are mounted last in `index.ts`. Wrap new async handlers in `asyncHandler` (Express 4 doesn't catch async errors).
- Client: `components/HomeView.tsx` is the parent (Hero, `CreateCapsuleModal`, `Toast`). `createCapsule` in `lib/api.ts` posts to `/capsules` and maps 400s to field errors. Color/category options and date helpers are in `lib/capsules.ts`.
- Fonts are loaded with `next/font` in `styles/fonts.ts` and exposed as the Tailwind families `font-serif` (DM Serif Display), `font-sans` (Figtree) and `font-mono` (JetBrains Mono). Theme colors are under `capsule.*` in `tailwind.config.ts`.

### Board

- `components/CapsuleBoard.tsx` gets `capsules` + `onCapsulesChange` from `HomeView`. It has the filter state (Todas / Guardadas / Disponíveis), optimistic delete (calls `deleteCapsule` from `lib/api.ts`, restores on error, local-only when `offline`) and the `LetterModal`, which only opens once the capsule's date arrives. It composes `CapsuleFilter`, `CapsuleCard`, `CapsuleStamp` and `CategoryTag`.
- The envelope uses the capsule's chosen color (`bg`/`flap`/`pocket` in `CAPSULE_COLOR_OPTIONS`) and the tag uses `CAPSULE_CATEGORY_OPTIONS`. Filters and day counting are in `lib/capsules.ts`, all working on `AAAA-MM-DD` strings.
- The board uses `font-display`, an alias of the same DM Serif Display as `font-serif`.

## Conventions

- No `any` (use `unknown` + narrowing) and no non-null `!`.
- Local imports use the `@/` alias. Shared code comes from `@repo/types` / `@repo/utils`.
- UI copy is in Brazilian Portuguese, and so are the code comments.
