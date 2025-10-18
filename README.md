# Luxenails Storefront

Monorepo for the Luxenails e-commerce experience built with Next.js 15, TypeScript, Tailwind CSS, and Supabase for production data.

## Getting Started (SQLite)

1. Install dependencies
   ```bash
   pnpm install
   ```
2. Copy the environment template and keep the default `DATABASE_PROVIDER=sqlite`
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server
   ```bash
   pnpm dev
   ```
SQLite is used only for local development and comes pre-seeded via `lib/db/seed.ts`.

## Supabase Setup (Production/Staging)

1. Create a Supabase project and grab the URL + generated keys.
2. Migrate the schema:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   The migrations live in `supabase/migrations`.
3. Seed baseline data:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<url> \
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
   pnpm seed:supabase
   ```
4. Update `.env.local` (and Vercel envs) with:
   ```
   DATABASE_PROVIDER=supabase
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

## Vercel Deployment

1. Connect the GitHub repository to Vercel and choose the `main` branch for production.
2. Set environment variables for *Preview* and *Production* environments:
   - `DATABASE_PROVIDER=supabase`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (mark as encrypted/secret)
3. Trigger a deployment. Vercel will run `pnpm install`, `pnpm build`, and publish the Next.js application.
4. Optional: enable Vercel Analytics & Log Drains for runtime visibility.

## Continuous Integration

GitHub Actions (`.github/workflows/ci.yml`) run on every PR/push:
- `pnpm lint`
- `pnpm test:smoke`

Ensure long-running branches rebase regularly so the CI pipeline stays green.

## Git Workflow Recommendations

* `main`: deployable production branch (protected).
* `develop`: optional integration branch for staging.
* `feature/<name>` branches for day-to-day work. Open PRs against `develop` or `main`.
* Require CI + review before merging.

## Useful Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Run Next.js locally (SQLite by default) |
| `pnpm lint` | ESLint (CI + local) |
| `pnpm test:smoke` | Vitest smoke coverage (CI + local) |
| `pnpm test:e2e` | Playwright E2E suite |
| `pnpm seed:supabase` | Seed Supabase with baseline data |
| `supabase db push` | Apply migrations to linked project |

