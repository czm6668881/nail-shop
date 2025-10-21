import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

type AdminClient = SupabaseClient<Database, "public">

let cachedClient: AdminClient | undefined

export const getSupabaseAdminClient = (): AdminClient => {
  if (cachedClient) {
    return cachedClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin client is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.")
  }

  cachedClient = createClient<Database, "public">(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "nail-shop/1.0",
      },
    },
  })

  return cachedClient
}
