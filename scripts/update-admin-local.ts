/**
 * 用于本地 SQLite 数据库更新管理员邮箱
 * 使用方法: pnpm tsx scripts/update-admin-local.ts your-email@example.com
 */

import Database from "better-sqlite3"
import { join } from "path"
import { existsSync } from "fs"

const DB_PATH = join(process.cwd(), "lib", "db", "nailshop.db")
type UserRecord = { id: number | string; email: string }
type RunResult = { changes: number }

async function updateAdminEmailLocal(newEmail: string) {
  console.log("正在使用本地 SQLite 数据库...")

  if (!existsSync(DB_PATH)) {
    console.error(`数据库文件不存在: ${DB_PATH}`)
    console.log("请先运行 'pnpm dev' 启动开发服务器以初始化数据库")
    process.exit(1)
  }

  const db = new Database(DB_PATH)

  try {
    // 查找当前管理员账号
    const adminUser = db
      .prepare("SELECT id, email FROM users WHERE role = 'admin' LIMIT 1")
      .get() as UserRecord | undefined

    if (!adminUser) {
      console.error("未找到管理员账号")
      console.log("数据库可能未初始化，请先运行 'pnpm dev'")
      process.exit(1)
    }

    console.log(`找到管理员账号: ${adminUser.email}`)
    console.log(`准备更新为: ${newEmail}`)

    // 检查新邮箱是否已存在
    const existingUser = db
      .prepare("SELECT id, email FROM users WHERE email = ?")
      .get(newEmail) as UserRecord | undefined

    if (existingUser && existingUser.id !== adminUser.id) {
      console.error(`邮箱 ${newEmail} 已被其他用户使用`)
      process.exit(1)
    }

    // 更新管理员邮箱
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
      console.log("✅ 管理员邮箱更新成功!")
      console.log(`新管理员账号: ${newEmail}`)
      console.log(`密码保持不变: Admin123!`)
      console.log(`\n现在你可以使用新邮箱和密码登录后台管理界面了。`)
      console.log(`访问地址: http://localhost:3000/admin`)
      console.log(`\n请注意: 如果开发服务器正在运行，可能需要重启才能看到更改生效。`)
    } else {
      console.error("更新失败，未找到对应的管理员账号")
    }
  } catch (error) {
    console.error("更新管理员邮箱失败:", error)
    throw error
  } finally {
    db.close()
  }
}

// 从命令行参数获取新邮箱
const newEmail = process.argv[2]

if (!newEmail) {
  console.error("请提供新的管理员邮箱地址")
  console.log("使用方法: pnpm tsx scripts/update-admin-local.ts your-email@example.com")
  process.exit(1)
}

// 验证邮箱格式
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(newEmail)) {
  console.error("无效的邮箱地址格式")
  process.exit(1)
}

updateAdminEmailLocal(newEmail).catch((error) => {
  console.error("更新失败:", error)
  process.exitCode = 1
})
