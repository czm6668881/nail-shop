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
   The migrations live in `supabase/migrations` (make sure both `0001_init.sql` 和 `0002_google_oauth.sql` 被执行)。
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
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

## Google Sign-In 配置

1. 前往 [Google Cloud Console](https://console.cloud.google.com/) 创建或选择项目。
2. 在 `APIs & Services → OAuth consent screen` 配置应用信息并将生产域名加入授权域。
3. 在 `APIs & Services → Credentials` 新建 **OAuth Client ID** (`Web application` 类型)：
   - 在 `Authorized redirect URIs` 中添加 `https://<你的域名>/api/auth/google/callback`（本地开发可使用 `http://localhost:3000/api/auth/google/callback`）。
4. 复制生成的 `Client ID` 和 `Client secret`，分别写入：
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<同上 client id>
   GOOGLE_CLIENT_ID=<同上 client id>
   GOOGLE_CLIENT_SECRET=<client secret>
   ```
5. 重新部署或重启本地开发服务，登录页将自动显示 “Continue with Google” 按钮。

## Vercel Deployment

1. Connect the GitHub repository to Vercel and choose the `main` branch for production.
2. Set environment variables for *Preview* and *Production* environments:
   - `DATABASE_PROVIDER=supabase`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (mark as encrypted/secret)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
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
