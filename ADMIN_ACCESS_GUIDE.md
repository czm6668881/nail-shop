# Admin Panel Access Guide

## 1. How to Access the Admin Panel

### URLs
- **Local development**: `http://localhost:3000/admin`
- **Production environment**: `https://your-domain/admin`

### Login requirements
- Sign in with an account that has the `admin` role
- Login page: `http://localhost:3000/login`

---

## 2. Default Administrator Account

**Default administrator credentials:**
- Email: `admin@luxenails.com`
- Password: `Admin123!`
- Role: `admin`

---

## 3. Update the Admin Email

Two helper scripts are provided to update the administrator email address:

### Option 1: Local SQLite database (recommended for development)

**When to use:** You are developing with the local SQLite database.

**Steps:**

1. Start the dev server once to initialize the database:
   ```bash
   pnpm dev
   ```
   Press `Ctrl+C` to stop the server.

2. Run the update script:
   ```bash
   pnpm run update:admin:local your-email@example.com
   ```
   or:
   ```bash
   pnpm tsx scripts/update-admin-local.ts your-email@example.com
   ```

3. Restart the dev server:
   ```bash
   pnpm dev
   ```

4. Sign in with the new email:
   - Email: `your-email@example.com`
   - Password: `Admin123!` (unchanged)

### Option 2: Supabase database (production ready)

**When to use:** Supabase is configured for this project.

**Prerequisites:**
- A Supabase project is created
- Database migrations have been executed
- Environment variables are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Steps:**

1. Run the seed script (creates the initial admin account):
   ```bash
   pnpm run seed:supabase
   ```

2. Run the update script:
   ```bash
   pnpm run update:admin your-email@example.com
   ```
   or:
   ```bash
   pnpm tsx scripts/update-admin-email.ts your-email@example.com
   ```

3. Sign in with the new email:
   - Email: `your-email@example.com`
   - Password: `Admin123!` (unchanged)

---

## 4. Quick Start

### Option A: Fast local testing (no configuration required)

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the dev server (uses SQLite automatically):
   ```bash
   pnpm dev
   ```

3. Open your browser:
   - Login page: `http://localhost:3000/login`
   - Sign in with the default admin account:
     - Email: `admin@luxenails.com`
     - Password: `Admin123!`

4. After signing in, open the admin panel:
   - `http://localhost:3000/admin`

5. (Optional) Update the admin email:
   ```bash
   pnpm run update:admin:local your-email@example.com
   ```

### Option B: Supabase (production ready)

Follow the "Supabase Setup" section in `README.md` for the full configuration.

---

## 5. Change the Admin Password

If you need to change the password, use either of the following approaches.

### Approach 1: Forgot password flow
1. Visit `http://localhost:3000/forgot-password`
2. Enter the admin email
3. Follow the instructions in the email to reset the password

### Approach 2: Manually generate a new password hash
1. Generate a bcrypt hash for the new password:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-new-password', 10))"
   ```
2. Update the `password_hash` field in the `users` table directly

---

## 6. Troubleshooting

### Issue 1: Redirected back to the login page
**Cause:** You are not signed in or the account is not an administrator.

**Resolution:**
1. Sign in with an administrator account
2. Confirm the user's `role` field is set to `admin`

### Issue 2: Database has not been initialized
**Symptom:** The update script reports that the database file does not exist.

**Resolution:**
```bash
# Start the dev server once to initialize the database
pnpm dev
# Press Ctrl+C to stop, then run the update script again
```

### Issue 3: Email already in use
**Symptom:** The update script reports that the email is already used by another account.

**Resolution:**
- Use a different email address
- Or remove/update the conflicting user account first

---

## 7. Security Recommendations

1. **Change the default password:** Update `Admin123!` after the first login.
2. **Use strong passwords:** Passwords should include:
   - At least 8 characters
   - Uppercase and lowercase letters
   - Numbers
   - Special characters
3. **Restrict access:** In production, ensure you:
   - Use HTTPS
   - Configure an appropriate CORS policy
   - Review admin accounts regularly
4. **Protect environment variables:**
   - Never commit `.env.local` to Git
   - Use Vercel environment variables in production
   - Keep `SUPABASE_SERVICE_ROLE_KEY` secret

---

## 8. Admin Feature Overview

After signing in, you can manage:

- **Products** (`/admin/products`)
  - Create, edit, and delete products
  - Manage inventory
  - Set pricing and images

- **Orders** (`/admin/orders`)
  - View all orders
  - Update order status
  - Add fulfillment details

- **Collections** (`/admin/collections`)
  - Create and manage collections
  - Configure featured collections

- **Blog** (`/admin/blog`)
  - Create and publish blog posts
  - Manage categories and tags

- **Customers** (`/admin/customers`)
  - View the customer list
  - Manage customer information

- **Reviews** (`/admin/reviews`)
  - Moderate customer reviews
  - Control review visibility

---

## 9. Need Help?

If you run into issues, review:
- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `GOOGLE_SETUP.md` - Google sign-in configuration

You can also consult the project issue tracker.
