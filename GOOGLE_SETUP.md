# Google Sign-In Setup Checklist

## Completed Configuration

### 1. Local development
- `.env.local` is created and configured
- Google Client ID is set
- Dev server is running and the "Continue with Google" button is visible

### 2. Google Cloud Console tasks

Confirm the following items in the [Google Cloud Console](https://console.cloud.google.com/):

#### OAuth consent screen
- [ ] Application name (for example: Gel Manicure Nail Shop)
- [ ] User support email
- [ ] Homepage: `https://gelmanicure-nail.com`
- [ ] Authorized domains: add `gelmanicure-nail.com`
- [ ] Developer contact information
- [ ] Publish status: switch from `Testing` to `In production` after verification

#### OAuth client ID (Credentials)
Redirect URIs that must be configured:
- [ ] **Local development:** `http://localhost:3000/api/auth/google/callback`
- [ ] **Production:** `https://gelmanicure-nail.com/api/auth/google/callback`
- [ ] **WWW domain (optional):** `https://www.gelmanicure-nail.com/api/auth/google/callback`

> Important: Redirect URIs must match exactly, including protocol and path.

---

## Production Deployment Configuration

### Vercel environment variables

Sign in to the [Vercel Dashboard](https://vercel.com/dashboard), open your project settings, and add the variables below.

#### Required variables

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_PROVIDER` | `supabase` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | Production, Preview |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Client ID | Production, Preview |
| `GOOGLE_CLIENT_ID` | Google Client ID | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | Google Client Secret | Production, Preview |

#### How to add them

1. Open the Vercel project page.
2. Click **Settings -> Environment Variables**.
3. Add each variable listed above.
4. Mark sensitive values (such as `SUPABASE_SERVICE_ROLE_KEY` and `GOOGLE_CLIENT_SECRET`) with the lock icon.
5. Click **Save**.
6. Redeploy the project: **Deployments ->** latest deployment -> **Redeploy**.

---

## Testing Google Sign-In

### Local testing (already available)

1. Visit `http://localhost:3000/login`.
2. Click "Continue with Google".
3. Select a Google account and complete the flow.
4. You should be redirected to `/account` on success.

### Production testing (after deployment)

1. Visit `https://gelmanicure-nail.com/login`.
2. Click "Continue with Google".
3. Confirm the sign-in flow works end-to-end.

---

## Troubleshooting

### Issue 1: Redirect URI mismatch

**Error:** `Error 400: redirect_uri_mismatch`

**Fix:**
1. Ensure the redirect URI in Google Cloud Console matches the domain exactly.
2. Verify the protocol (`https://`) and path (`/api/auth/google/callback`).
3. Allow a few minutes for Google to propagate changes.

### Issue 2: Google button does not appear

**Fix:**
1. Confirm `.env.local` or Vercel environment variables are populated.
2. Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is defined (note the `NEXT_PUBLIC_` prefix).
3. Restart the dev server or redeploy the app.

### Issue 3: Redirected to the wrong page after login

**Fix:**
1. Check the browser console for runtime errors.
2. Review Vercel function logs in production.
3. Make sure database migrations ran successfully (`google_id` column exists).

### Issue 4: OAuth consent screen shows "App not verified"

**Fix:**
1. In Google Cloud Console, change the app status from `Testing` to `In production`.
2. Alternatively, add test users while you remain in Testing mode.

---

## Pre-Launch Checklist

- [ ] All redirect URIs are configured in Google Cloud Console.
- [ ] Vercel environment variables are complete.
- [ ] Supabase migrations have run (including `0002_google_oauth.sql`).
- [ ] Google sign-in works locally.
- [ ] Changes are pushed to the `main` branch.
- [ ] Vercel deployment succeeded.
- [ ] Google sign-in works in production.
- [ ] OAuth app is published (Testing -> Production).

---

## All Set

Your Gel Manicure Nail Shop now supports:
- Email/password authentication
- Google social login
- Automatic account linking
- A unified sign-in experience

If you run into issues, review `DEPLOYMENT.md` or consult the Vercel and Supabase logs.
