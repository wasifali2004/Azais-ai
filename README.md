# AzaisAi

AzaisAi is an AI image and video generation studio: sign up, pick a model, describe
a shot, and generate cinematic video or gallery-ready images from a single
prompt-driven workspace. This repo is a monorepo rebuild covering the marketing
site, the generation studio, auth, billing, and the API behind all of it.

## Tech stack

| Layer    | Stack |
|----------|-------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, GSAP |
| Backend  | NestJS 12, TypeScript, Prisma 7 (`@prisma/adapter-pg`) |
| Database | Postgres (Supabase) |
| Storage  | Supabase Storage (generated images/videos) |
| Auth     | JWT (Passport) + Google OAuth, Resend for transactional email |
| AI       | Google Gemini (`@google/genai`) with Runware fallback for generation |
| Billing  | Polar.sh (checkout, subscriptions, credits) |

## Features

- **Studio** — text-to-image, text-to-video, and image-to-video generation with
  model/style/aspect-ratio pickers, prompt enhancement, and generation history.
- **Auth** — email + password with a 6-digit email verification code, and
  Google OAuth sign-in.
- **Billing** — Polar-backed subscription plans (Starter / Pro / Business) with
  monthly credit grants; checkout can be confirmed either via Polar webhook or
  by verifying the checkout directly against Polar's API (no webhook required).
- **i18n** — UI translated into English, Arabic, German, Spanish, French, and
  Hindi (`apps/web/lib/i18n`).
- **Light/dark theme**, marketing pages (pricing, FAQ, testimonials), and a
  credits/history dashboard.

## Monorepo structure

```
apps/
  web/   Next.js frontend — marketing site + studio UI
  api/   NestJS backend — auth, generation, billing, storage
```

`apps/web` never talks to the database directly — it only calls `apps/api` over
HTTP. Shared workspace tooling lives at the repo root (npm workspaces).

## Getting started

### Prerequisites

- Node.js ≥ 22.12
- A Supabase project (Postgres connection strings + Storage bucket)
- A Google Cloud OAuth client (for Google sign-in)
- A Resend account (for verification emails)
- A Google Gemini API key (for generation)
- A Polar.sh account (for real billing — optional for local dev, see
  [Known limitations](#known-limitations--dev-shortcuts))

### 1. Install dependencies

From the repo root — npm workspaces hoists everything into a single
`node_modules/`:

```bash
npm install
```

### 2. Configure environment variables

Copy each app's env template and fill in real values:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

See [Environment variables](#environment-variables) below for what each one
does. `apps/api/.env` needs a real `DATABASE_URL` before Prisma or the API will
work.

### 3. Set up the database

```bash
cd apps/api
npm run prisma:generate
npx prisma migrate deploy   # applies existing migrations
npx ts-node prisma/seed.ts  # seeds the Starter/Pro/Business plans
```

### 4. Run both apps

In two terminals, from the repo root:

```bash
npm run dev:api    # NestJS on http://localhost:4000
npm run dev:web    # Next.js on http://localhost:3000
```

Open `http://localhost:3000`.

## Environment variables

### `apps/api/.env`

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled (pgbouncer) Postgres connection string — used at runtime |
| `DIRECT_URL` | Direct (session-mode) Postgres connection string — required for migrations |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client credentials |
| `GOOGLE_CALLBACK_URL` | Must be `https://<your-api-domain>/auth/google/callback` and match an Authorized Redirect URI in the Google Cloud Console exactly — Google redirects here directly, not through the frontend |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Transactional email for verification codes |
| `GEMINI_API_KEY` | Google Gemini API key used as the primary generation provider |
| `RUNWARE_API_KEY` | Runware API key used only when Gemini is rate-limited, unconfigured, or temporarily unavailable |
| `RUNWARE_IMAGE_MODEL` / `RUNWARE_VIDEO_MODEL` | Optional Runware model overrides; defaults are `runware:101@1` and `pixverse:1@2` |
| `JWT_ACCESS_SECRET` | Signing secret for session JWTs — use a long random value, never reuse the dev default |
| `JWT_ACCESS_TTL` | Session lifetime (e.g. `30d`) — there's no refresh-token flow, so this is the whole session |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET` | Supabase Storage for generated media — service role key, never the anon key |
| `POLAR_ACCESS_TOKEN` / `POLAR_WEBHOOK_SECRET` | Polar production Organization Access Token and webhook signing secret — OAuth client ID/secret are not substitutes |
| `POLAR_SERVER` | `"sandbox"` or `"production"`; deployments default to and enforce production |
| `POLAR_STARTER_PRODUCT_ID` / `POLAR_PRO_PRODUCT_ID` / `POLAR_BUSINESS_PRODUCT_ID` | Polar product IDs — sandbox and production have different IDs for the same product |
| `DEV_SKIP_PAYMENT` | Dev-only bypass, see below — must be `false`/unset in production |
| `ALLOW_POLAR_SANDBOX_ON_DEPLOYMENT` | Optional staging-only escape hatch; set `true` to permit Polar Sandbox on a deployed instance |
| `PORT` | API port (defaults to `4000`) |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins, no trailing slashes |
| `FRONTEND_URL` | The deployed **frontend's** URL — used to build OAuth/billing redirect targets. This is a backend-only variable; don't confuse it with `NEXT_PUBLIC_API_URL` below, which is the opposite direction and lives on the frontend |

### `apps/web/.env`

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of `apps/api`. Inlined into the client bundle at **build time** — changing it requires a fresh `next build`, not just a restart |

## Available scripts

From the repo root:

```bash
npm run dev:web   # Next.js dev server
npm run dev:api   # NestJS dev server (watch mode)
npm run build     # builds apps/web then apps/api
```

Inside `apps/api`:

```bash
npm run prisma:generate        # regenerate the Prisma client
npm run prisma:migrate:deploy  # apply migrations (production-safe, no prompts)
```

## Deployment notes

Both apps deploy as separate services (this project runs them on Railway, but
the same points apply to any two-service host):

- `NEXT_PUBLIC_API_URL` (frontend) is baked into the JS bundle at build time —
  a value change needs a real rebuild, not just an env var edit + restart.
- `FRONTEND_URL` and `GOOGLE_CALLBACK_URL` (backend) must point at your real
  deployed URLs, not `localhost`. `GOOGLE_CALLBACK_URL` also has to be
  registered in the Google Cloud Console's Authorized Redirect URIs, or
  sign-in fails before your code ever runs.
- Env var edits on most hosts don't restart an already-running process by
  themselves — confirm a fresh deploy actually happened after changing one.
- `apps/api` refuses to boot if `FRONTEND_URL` is missing on a detected
  deployment (see `apps/api/src/main.ts`) — check your service logs if it
  won't start.

## Known limitations / dev shortcuts

- **Polar billing is fully wired** (dynamic checkout session creation,
  webhook signature verification, and a webhook-free checkout-verification
  path). Live checkout requires a production `POLAR_ACCESS_TOKEN`;
  `POLAR_WEBHOOK_SECRET` is additionally required only when using webhooks.
- Until those are set, `DEV_SKIP_PAYMENT=true` bypasses the real Polar API
  call in `POST /billing/checkout`: it grants the chosen plan's credits and
  updates the user's `planTier` immediately, as if checkout had already
  succeeded, with **no real payment involved**. This is a dev/demo-only
  shortcut — the pricing page shows a visible "test mode" banner whenever
  it's active (`GET /billing/config` exposes the flag so the frontend never
  has to guess). Set `DEV_SKIP_PAYMENT=false` (or remove it) once real Polar
  credentials are configured; never enable it in production.
- Polar OAuth application credentials (`POLAR_CLIENT_ID` /
  `POLAR_CLIENT_SECRET`) are for an authorization-code flow on behalf of Polar
  users. This app creates checkout sessions for its own organization, so it
  uses a production Organization Access Token in `POLAR_ACCESS_TOKEN` instead.
  The token needs the `checkouts:write` scope (which also permits reading a
  completed checkout for the success-page verification used here).
- The API sends `Polar-Version: 2026-04` on checkout create/get requests so the
  response contract does not change when Polar rotates its default API version.
- There's no refresh-token flow — `JWT_ACCESS_TTL` is the entire session
  lifetime.
