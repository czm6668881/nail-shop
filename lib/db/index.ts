import { migrate } from "./schema"
import { seed } from "./seed"

const provider =
  (process.env.DATABASE_PROVIDER ?? process.env.NEXT_PUBLIC_SUPABASE_URL ? "supabase" : "sqlite").toLowerCase()

if (provider !== "supabase") {
  migrate()
  seed()
}

export * from "./client"
