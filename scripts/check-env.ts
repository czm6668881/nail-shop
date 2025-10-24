/**
 * Verify that the environment variables required for production are configured.
 */

const requiredEnvVars = [
  'DATABASE_PROVIDER',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const optionalEnvVars = [
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]

const missingVars: string[] = []

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName)
  }
}

if (missingVars.length > 0) {
  console.error('Missing required environment variables:')
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`)
  })
  console.error('\nConfigure these variables in .env.local (local) or Vercel environment settings (production).')
  console.error('See .env.example for the full list.')
  process.exit(1)
}

console.log('All required environment variables are configured.')

// Check the optional Google OAuth configuration
const missingOptional = optionalEnvVars.filter(varName => !process.env[varName])
if (missingOptional.length > 0) {
  console.log('\nOptional feature: Google sign-in is not configured.')
  console.log('   Users can still register and sign in with email and password.')
  console.log('   To enable Google sign-in, set the following variables:')
  missingOptional.forEach((varName) => {
    console.log(`   - ${varName}`)
  })
}
