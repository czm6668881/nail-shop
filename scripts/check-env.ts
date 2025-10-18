/**
 * 检查生产环境所需的环境变量是否已配置
 */

const requiredEnvVars = [
  'DATABASE_PROVIDER',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const missingVars: string[] = []

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName)
  }
}

if (missingVars.length > 0) {
  console.error('❌ 缺少以下环境变量：')
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`)
  })
  console.error('\n请在 .env.local（本地）或 Vercel 环境变量（生产）中配置这些变量。')
  console.error('参考 .env.example 文件查看所需的环境变量。')
  process.exit(1)
}

console.log('✅ 所有必需的环境变量已配置')

