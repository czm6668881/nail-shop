# Vercel Deployment Failure Troubleshooting

## Diagnose the Issue

Your Vercel deployment failed with the error:
```
Error: Cannot find module 'better-sqlite3'
```

**Root cause:**
- The app uses `better-sqlite3` for the local development database.
- Vercel's serverless runtime does **not** support SQLite because the filesystem is ephemeral.
- The codebase already supports Supabase, but the required environment variables are missing in Vercel.

## Quick Fix Checklist

### Step 1: Set the critical environment variable

Add the following variable in the Vercel Dashboard:

```bash
DATABASE_PROVIDER=supabase
```

**How to add it:**
1. Open the [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your project.
3. Open the **Settings** tab.
4. Choose **Environment Variables**.
5. Click **Add New**.
6. Configure:
   - **Key:** `DATABASE_PROVIDER`
   - **Value:** `supabase`
   - **Environments:** Production and Preview
7. Click **Save**.

### Step 2: Configure Supabase (if you have not yet)

If you do not already have a Supabase project, create one first.

#### 2.1 Create a Supabase project

1. Visit https://supabase.com.
2. Click "Start your project".
3. Sign in or create an account.
4. Click "New Project".
5. Provide the project information:
   - **Name:** `nail-shop` (or any name)
   - **Database Password:** set a strong password and save it securely
   - **Region:** pick the region closest to your customers
6. Click "Create new project" and wait for provisioning (about 2 minutes).

#### 2.2 Run the database migrations

1. In the Supabase Dashboard, open **SQL Editor**.
2. Click **New query**.
3. Copy and run the contents of:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_google_oauth.sql`
   - `supabase/migrations/0003_hero_slides.sql`

#### 2.3 Retrieve Supabase keys

1. In the Supabase Dashboard, click **Project Settings** (gear icon) at the bottom left.
2. Choose the **API** tab.
3. Copy the following values:
   - **Project URL** -> use this for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** -> use this for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** -> use this for `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal")

#### 2.4 Add Supabase variables in Vercel

Back in Vercel, add:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key | Production, Preview |

**Important:** mark `SUPABASE_SERVICE_ROLE_KEY` as **Sensitive**. It carries elevated privileges and must stay private.

### Step 3: Redeploy

1. In the Vercel project dashboard, open the **Deployments** tab.
2. Select the latest failed deployment.
3. Click **Redeploy**.
4. (Optional) Check **Use existing Build Cache** to speed up the build.
5. Confirm the redeploy.

## Validate the Fix

After the redeploy finishes:

1. Visit the production URL.
2. Open the browser console and look for errors.
3. Test registration and sign-in flows.
4. Confirm data persists to Supabase.

## Optional: Enable Google OAuth

To enable Google sign-in, add:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

See `GOOGLE_SETUP.md` for step-by-step instructions.

## Frequently Asked Questions

### Q: Why does the app work locally but not on Vercel?

**A:** Local development uses SQLite (a file-based database). Vercel runs serverless functions whose filesystem resets on every request, so SQLite cannot persist data. Production must use a hosted database such as Supabase.

### Q: Do I have to use Supabase?

**A:** No. You can switch to any hosted database (PlanetScale, Neon, Railway, etc.), but you would need to update the database adapter. Supabase is recommended because it offers a generous free plan, built-in auth and storage, real-time features, and a friendly dashboard.

### Q: Will my data be lost?

**A:** Local SQLite data is stored in `lib/db/nailshop.db`. When migrating to Supabase you must recreate the data. To migrate, export from SQLite, convert to SQL, and execute the script in Supabase.

### Q: The deployment still fails after adding variables. What should I check?

**A:** Verify the following:
1. Variable names are spelled exactly (case-sensitive).
2. Values do not contain stray spaces or quotes.
3. Every required variable is present.
4. Supabase migrations have been executed successfully.
5. You triggered a new deploy (a page refresh is not enough).

## Need More Help?

- Review `DEPLOYMENT.md` for the full deployment workflow.
- See `VERCEL_ENV_SETUP.txt` for the environment variable checklist.
- Read `ADMIN_ACCESS_GUIDE.md` for admin account guidance.
- Inspect Vercel build logs for detailed errors.
- Check Supabase logs (Dashboard -> Logs) for database-side issues.

## Summary

The key fix is to set:

```bash
DATABASE_PROVIDER=supabase
```

Then provide the Supabase credentials and redeploy. Your build should succeed once Vercel uses the Supabase adapter instead of SQLite.
