/**
 * Update the admin email in the local SQLite database.
 * Usage: pnpm tsx scripts/update-admin-local.ts your-email@example.com
 */

import Database from "better-sqlite3"
import { join } from "path"
import { existsSync } from "fs"

const DB_PATH = join(process.cwd(), "lib", "db", "nailshop.db")
type UserRecord = { id: number | string; email: string }
type RunResult = { changes: number }

async function updateAdminEmailLocal(newEmail: string) {
  console.log("Using the local SQLite database...")

  if (!existsSync(DB_PATH)) {
    console.error(`Database file not found: ${DB_PATH}`)
    console.log("Start the dev server with 'pnpm dev' to initialize the database first.")
    process.exit(1)
  }

  const db = new Database(DB_PATH)

  try {
    // Locate the current admin account
    const adminUser = db
      .prepare("SELECT id, email FROM users WHERE role = 'admin' LIMIT 1")
      .get() as UserRecord | undefined

    if (!adminUser) {
      console.error("Admin account not found.")
      console.log("The database may not be initialized; run 'pnpm dev' first.")
      process.exit(1)
    }

    console.log(`Admin account located: ${adminUser.email}`)
    console.log(`Preparing to update to: ${newEmail}`)

    // Check whether the new email already exists
    const existingUser = db
      .prepare("SELECT id, email FROM users WHERE email = ?")
      .get(newEmail) as UserRecord | undefined

    if (existingUser && existingUser.id !== adminUser.id) {
      console.error(`The email ${newEmail} is already in use by another user.`)
      process.exit(1)
    }

    // Update the admin email
    const result = db
      .prepare(
        `UPDATE users 
         SET email = ?, 
             first_name = 'Admin', 
             last_name = 'User'
         WHERE id = ?`
      )
      .run(newEmail, adminUser.id) as unknown as RunResult

    if (result.changes > 0) {
      console.log("Admin email updated successfully!")
      console.log(`New admin account: ${newEmail}`)
      console.log(`Password remains: Admin123!`)
      console.log("\nYou can now use the new email and password to access the admin dashboard.")
      console.log("Admin dashboard: http://localhost:3000/admin")
      console.log("\nIf the dev server is running, restart it to ensure the change is picked up.")
    } else {
      console.error("Update failed; no matching admin account was found.")
    }
  } catch (error) {
    console.error("Failed to update the admin email:", error)
    throw error
  } finally {
    db.close()
  }
}

// Read the new email from the CLI arguments
const newEmail = process.argv[2]

if (!newEmail) {
  console.error("Please provide the new admin email address.")
  console.log("Usage: pnpm tsx scripts/update-admin-local.ts your-email@example.com")
  process.exit(1)
}

// Validate the email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(newEmail)) {
  console.error("Invalid email address format.")
  process.exit(1)
}

updateAdminEmailLocal(newEmail).catch((error) => {
  console.error("Update failed:", error)
  process.exitCode = 1
})
