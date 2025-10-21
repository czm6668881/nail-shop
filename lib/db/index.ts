import { migrate } from "./schema"
import { seed } from "./seed"

const providerEnv = process.env.DATABASE_PROVIDER
const provider = providerEnv && providerEnv.length > 0
  ? providerEnv.toLowerCase()
  : process.env.NEXT_PUBLIC_SUPABASE_URL
    ? "supabase"
    : "sqlite"

if (provider !== "supabase") {
  migrate()
  seed()
}

export * from "./client"
