/**
 * 检查生产环境所需的环境变量是否已配置
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
  console.error('❌ 缺少以下必需的环境变量：')
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`)
  })
  console.error('\n请在 .env.local（本地）或 Vercel 环境变量（生产）中配置这些变量。')
  console.error('参考 .env.example 文件查看所需的环境变量。')
  process.exit(1)
}

console.log('✅ 所有必需的环境变量已配置')

// 检查可选的 Google OAuth 配置
const missingOptional = optionalEnvVars.filter(varName => !process.env[varName])
if (missingOptional.length > 0) {
  console.log('\n⚠️  可选功能：Google 第三方登录未配置')
  console.log('   用户可以通过邮箱密码注册登录')
  console.log('   如需启用 Google 登录，请配置以下环境变量：')
  missingOptional.forEach((varName) => {
    console.log(`   - ${varName}`)
  })
}
