import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  throw new Error("Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
}

type UserRecord = { id: string; email: string }

const supabase = createClient<Database>(url, serviceRole, {
  auth: { persistSession: false },
  global: { headers: { "X-Client-Info": "nail-shop/update-admin-script" } },
})

async function updateAdminEmail(newEmail: string) {
  console.log("Searching for the admin account...")

  // Locate the current admin account
  const { data: adminUser, error: findError } = await supabase
    .from("users")
    .select("id, email")
    .eq("role", "admin")
    .maybeSingle<UserRecord>()

  if (findError) {
    console.error("Failed to locate the admin account:", findError)
    throw findError
  }

  if (!adminUser) {
    console.error("Admin account not found")
    throw new Error("Admin account not found")
  }

  console.log(`Admin account located: ${adminUser.email}`)
  console.log(`Preparing to update to: ${newEmail}`)

  // Check whether the new email already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", newEmail)
    .maybeSingle<UserRecord>()

  if (existingUser && existingUser.id !== adminUser.id) {
    console.error(`The email ${newEmail} is already in use by another user`)
    throw new Error(`The email ${newEmail} is already in use by another user`)
  }

  // Update the admin email
  const { error: updateError } = await supabase
    .from("users")
    .update({
      email: newEmail,
      first_name: "Admin",
      last_name: "User"
    } as never)
    .eq("id", adminUser.id)

  if (updateError) {
    console.error("Failed to update the admin email:", updateError)
    throw updateError
  }

  console.log("Admin email updated successfully!")
  console.log(`New admin account: ${newEmail}`)
  console.log(`Password remains: Admin123!`)
  console.log("\nYou can now use the new email and password to access the admin dashboard.")
  console.log("Admin dashboard: http://localhost:3000/admin")
}

// Read the new email from the CLI arguments
const newEmail = process.argv[2]

if (!newEmail) {
  console.error("Please provide the new admin email address")
  console.log("Usage: pnpm tsx scripts/update-admin-email.ts your-email@example.com")
  process.exit(1)
}

// Validate the email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(newEmail)) {
  console.error("Invalid email address format")
  process.exit(1)
}

updateAdminEmail(newEmail).catch((error) => {
  console.error("Failed to update admin email:", error)
  process.exitCode = 1
})






