import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  throw new Error("缺少 Supabase 环境变量。请设置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY。")
}

const supabase = createClient<Database>(url, serviceRole, {
  auth: { persistSession: false },
  global: { headers: { "X-Client-Info": "nail-shop/update-admin-script" } },
})

async function updateAdminEmail(newEmail: string) {
  console.log("正在查找管理员账号...")
  
  // 查找当前管理员账号
  const { data: adminUser, error: findError } = await supabase
    .from("users")
    .select("*")
    .eq("role", "admin")
    .maybeSingle()

  if (findError) {
    console.error("查找管理员账号失败:", findError)
    throw findError
  }

  if (!adminUser) {
    console.error("未找到管理员账号")
    throw new Error("未找到管理员账号")
  }

  console.log(`找到管理员账号: ${adminUser.email}`)
  console.log(`准备更新为: ${newEmail}`)

  // 检查新邮箱是否已存在
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", newEmail)
    .maybeSingle()

  if (existingUser && existingUser.id !== adminUser.id) {
    console.error(`邮箱 ${newEmail} 已被其他用户使用`)
    throw new Error(`邮箱 ${newEmail} 已被其他用户使用`)
  }

  // 更新管理员邮箱
  const { error: updateError } = await supabase
    .from("users")
    .update({ 
      email: newEmail,
      first_name: "Admin",
      last_name: "User"
    } as never)
    .eq("id", adminUser.id)

  if (updateError) {
    console.error("更新管理员邮箱失败:", updateError)
    throw updateError
  }

  console.log("✅ 管理员邮箱更新成功!")
  console.log(`新管理员账号: ${newEmail}`)
  console.log(`密码保持不变: Admin123!`)
  console.log(`\n现在你可以使用新邮箱和密码登录后台管理界面了。`)
  console.log(`访问地址: http://localhost:3000/admin`)
}

// 从命令行参数获取新邮箱
const newEmail = process.argv[2]

if (!newEmail) {
  console.error("请提供新的管理员邮箱地址")
  console.log("使用方法: pnpm tsx scripts/update-admin-email.ts your-email@example.com")
  process.exit(1)
}

// 验证邮箱格式
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(newEmail)) {
  console.error("无效的邮箱地址格式")
  process.exit(1)
}

updateAdminEmail(newEmail).catch((error) => {
  console.error("更新管理员邮箱失败:", error)
  process.exitCode = 1
})




