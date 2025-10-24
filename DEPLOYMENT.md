# Nail Shop Deployment Guide

This document explains how to deploy the Nail Shop storefront to production.

## Deployment Architecture

- Frontend hosting: Vercel
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage (optional for customer uploads)

---

## Deployment Steps

### Step 1: Create the Supabase database

1. Visit https://supabase.com and click "Start your project" to sign in or create an account.
2. Create a new project:
   - Click "New Project"
   - Choose or create an organization
   - Set **Project Name** (e.g., `nail-shop`)
   - Choose a strong **Database Password** and store it safely
   - Select a region close to your customers (for example Northeast Asia - Seoul or Asia Pacific - Singapore)
   - Click "Create new project" and wait for provisioning to finish
3. Run the migrations:
   - When the project is ready, open **SQL Editor**
   - Click "New Query"
   - Open `supabase/migrations/0001_init.sql` and `supabase/migrations/0002_google_oauth.sql` locally
   - Paste each script into the SQL Editor and run it
   - Both scripts should return "Success. No rows returned."
4. Retrieve API keys:
   - Navigate to **Settings -> API**
   - Copy the following values:
     * `Project URL`
     * `anon public` key
     * `service_role` key (reveal with the eye icon)
5. Seed initial data (optional but recommended):
   - Create `.env.local` in the project root with:
     ```bash
     DATABASE_PROVIDER=supabase
     NEXT_PUBLIC_SUPABASE_URL=<your project URL>
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
     SUPABASE_SERVICE_ROLE_KEY=<your service role key>
     ```
   - Run:
     ```bash
     pnpm run seed:supabase
     ```
   - This seeds baseline products, categories, and supporting records.

---

### Step 2: Deploy the project on Vercel

1. Visit https://vercel.com and sign in (GitHub login is recommended so you can import the repository directly).
2. Import the GitHub repository:
   - Click "Add New..." -> "Project"
   - If the repository is missing, adjust the GitHub App permissions to allow access
   - Select the `nail-shop` repository and click "Import"
3. Configure the project:
   - **Project Name:** `nail-shop` (or any name you prefer)
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `pnpm build`
   - **Output Directory:** `.next`
4. Configure environment variables for both Preview and Production environments:

   | Name | Value |
   |------|-------|
   | `DATABASE_PROVIDER` | `supabase` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (mark as sensitive) |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
   | `GOOGLE_CLIENT_ID` | Same Google OAuth Client ID (server usage) |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
   | `NODE_ENV` | `production` |

   Scope sensitive values to Production only.

5. Deploy:
   - Click "Deploy"
   - Vercel clones the repo, installs dependencies (`pnpm install`), builds (`pnpm build`), and publishes the app
   - The initial deployment usually completes in 2-3 minutes
6. Verify the deployment:
   - After deployment, Vercel displays the production URL (for example `https://nail-shop.vercel.app`)
   - Click "Visit" to confirm the site is live

---

### Step 3: Configure Google Sign-In

1. In Google Cloud Console open `APIs & Services -> OAuth consent screen`, fill in the app details, and add your production domain to **Authorized domains**.
2. Go to `APIs & Services -> Credentials` and create an **OAuth Client ID** (type `Web application`).
3. Add redirect URIs:
   - Production: `https://<your-domain>/api/auth/google/callback`
   - Local development (optional): `http://localhost:3000/api/auth/google/callback`
4. Copy the generated Client ID and Client Secret, then add them to Vercel (and `.env.local` if needed):
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client id>
   GOOGLE_CLIENT_ID=<client id>
   GOOGLE_CLIENT_SECRET=<client secret>
   ```
5. Redeploy the site. After deployment, the login page should display "Continue with Google." Complete a test login and publish the OAuth app (switch from Testing to Production) in Google Cloud Console.

---

### Step 4: Configure a custom domain (optional)

1. In the Vercel project dashboard, open "Settings" -> "Domains".
2. Enter your domain (for example `www.your-domain.com`) and click "Add".
3. Follow the DNS instructions:
   - **Type:** `CNAME`
   - **Name:** `www` (or `@`)
   - **Value:** `cname.vercel-dns.com`
4. Wait for DNS propagation (typically 5-30 minutes).
5. Vercel automatically provisions an HTTPS certificate.

---

## Security Checklist

Ensure the following before going live:

- Row level security (RLS) is enabled in Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` is used only on the server and never exposed to clients.
- Strong passwords are enforced for all accounts.
- Dependencies are kept up to date.
- Error monitoring is configured (optional: Sentry).
- Security headers are enabled in Vercel.

---

## Continuous Deployment

Every push to the `main` branch triggers:

1. A fresh build in Vercel.
2. Automatic deployment when the build succeeds.

Review deployment history and logs in the Vercel dashboard.

---

## Monitoring and Analytics

### Vercel Analytics

The project includes `@vercel/analytics`, which captures:

- Page views
- Visitor metrics
- Performance indicators

Access the data under Vercel Dashboard -> Analytics.

### Recommended additions

- Error monitoring: Sentry (https://sentry.io)
- Performance monitoring: Vercel Speed Insights
- User analytics: Google Analytics

---

## Common Issues

### 1. Deployment failed during build

**Fix:** Review the build logs in Vercel, confirm all environment variables are set, and verify that `pnpm install && pnpm build` succeeds locally.

### 2. Google sign-in shows a redirect URI error

**Fix:** Ensure the exact redirect URL is registered in Google Cloud Console, including protocol and path, and matches the deployed domain.

### 3. Supabase returns unauthorized errors

**Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and confirm your RLS policies allow the intended access patterns.

---

For additional questions, open an issue in the project tracker or contact the infrastructure maintainer.
