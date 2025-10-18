import { createBrowserClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

let browserClient: SupabaseClient<Database> | undefined

export const getSupabaseBrowserClient = (): SupabaseClient<Database> => {
  if (browserClient) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase browser client is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.")
  }

  browserClient = createBrowserClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      storageKey: "nail-shop-supabase",
    },
    global: {
      headers: {
        "X-Client-Info": "nail-shop/1.0",
      },
    },
  })

  return browserClient
}

