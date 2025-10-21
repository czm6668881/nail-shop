# Vercel 部署失败修复指南

## 问题诊断

您的 Vercel 部署失败，错误信息显示：
```
Error: Cannot find module 'better-sqlite3'
```

**根本原因**：
- 您的应用使用 `better-sqlite3`（SQLite 数据库）作为本地开发数据库
- Vercel 的无服务器环境**不支持** SQLite（需要文件系统访问）
- 您的代码已经支持 Supabase（云数据库），但 Vercel 环境变量未配置

## 快速修复步骤

### 步骤 1：设置关键环境变量

在 Vercel Dashboard 中添加这个关键变量：

```bash
DATABASE_PROVIDER=supabase
```

**操作步骤：**
1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 点击 **Settings** 标签
4. 在左侧菜单选择 **Environment Variables**
5. 点击 **Add New**
6. 填写：
   - **Key**: `DATABASE_PROVIDER`
   - **Value**: `supabase`
   - **Environments**: 勾选 `Production` 和 `Preview`
7. 点击 **Save**

### 步骤 2：配置 Supabase（如果还没有）

如果您还没有 Supabase 项目，需要先创建：

#### 2.1 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 登录或注册账号
4. 点击 "New Project"
5. 填写项目信息：
   - **Name**: nail-shop（或任意名称）
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择离您用户最近的区域
6. 点击 "Create new project"
7. 等待项目创建完成（约 2 分钟）

#### 2.2 运行数据库迁移

1. 在 Supabase Dashboard 中，点击左侧的 **SQL Editor**
2. 点击 **New query**
3. 依次复制并执行以下文件的内容：
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_google_oauth.sql`
   - `supabase/migrations/0003_hero_slides.sql`

#### 2.3 获取 Supabase 密钥

1. 在 Supabase Dashboard 中，点击左下角的 **Project Settings**（齿轮图标）
2. 选择 **API** 标签
3. 复制以下三个值：
   - **Project URL** → 这是 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → 这是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → 这是 `SUPABASE_SERVICE_ROLE_KEY`（点击 "Reveal" 查看）

#### 2.4 在 Vercel 中添加 Supabase 环境变量

回到 Vercel Dashboard，添加以下变量：

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 您的 Supabase Project URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 您的 anon public key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | 您的 service_role key | Production, Preview |

**重要提示**：
- 对于 `SUPABASE_SERVICE_ROLE_KEY`，请勾选 **"Sensitive"** 选项
- 这个密钥具有管理员权限，必须保密！

### 步骤 3：重新部署

1. 在 Vercel Dashboard 的 **Deployments** 标签中
2. 点击最新失败的部署
3. 点击右上角的 **Redeploy** 按钮
4. 勾选 **"Use existing Build Cache"**（可选，加快构建速度）
5. 点击 **Redeploy**

## 验证部署成功

部署完成后：

1. 访问您的网站 URL
2. 检查控制台是否有错误
3. 尝试注册/登录功能
4. 确认数据能正常保存和读取

## 可选：配置 Google OAuth

如果您想启用 Google 登录，还需要添加：

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

详细配置请参考 `GOOGLE_SETUP.md`

## 常见问题

### Q: 为什么本地开发可以，Vercel 不行？

**A**: 本地开发使用 SQLite（文件数据库），而 Vercel 是无服务器环境，每次请求可能在不同的容器中运行，无法持久化文件。因此生产环境必须使用云数据库（如 Supabase）。

### Q: 我必须使用 Supabase 吗？

**A**: 不一定。您也可以使用其他云数据库（如 PlanetScale、Neon、Railway 等），但需要修改代码中的数据库适配器。Supabase 是推荐的选择，因为：
- 免费套餐很慷慨
- 内置认证和存储功能
- 提供实时订阅功能
- 有友好的 Dashboard

### Q: 数据会丢失吗？

**A**: 如果您在本地开发时使用了 SQLite，这些数据存储在本地 `lib/db/nailshop.db` 文件中。切换到 Supabase 后，需要重新创建数据。如果需要迁移数据，可以：
1. 导出 SQLite 数据
2. 转换为 SQL 脚本
3. 在 Supabase 中执行

### Q: 环境变量设置后还是失败？

**A**: 请确保：
1. ✅ 变量名拼写正确（区分大小写）
2. ✅ 值中没有多余的空格或引号
3. ✅ 所有必需的变量都已添加
4. ✅ Supabase 数据库迁移已执行
5. ✅ 重新部署（而不只是刷新页面）

## 需要帮助？

- 📖 查看 `DEPLOYMENT.md` 了解完整部署流程
- 📖 查看 `VERCEL_ENV_SETUP.txt` 了解环境变量配置
- 📖 查看 `ADMIN_ACCESS_GUIDE.md` 了解管理员设置
- 🐛 检查 Vercel 构建日志获取详细错误信息
- 💬 查看 Supabase 日志（Dashboard → Logs）

## 总结

最关键的一步是在 Vercel 中设置：

```bash
DATABASE_PROVIDER=supabase
```

然后配置 Supabase 连接信息，重新部署即可！

