# Nail Shop 部署指南

本文档详细说明如何将 Nail Shop 电商网站部署到生产环境。

## 📋 部署架构

- **前端托管**: Vercel
- **数据库**: Supabase (PostgreSQL)
- **存储**: Supabase Storage (可选，用于用户上传的图片)

---

## 🚀 部署步骤

### 第一步：创建 Supabase 数据库

1. **访问 Supabase 官网**
   - 打开浏览器访问：https://supabase.com
   - 点击 "Start your project" 注册/登录

2. **创建新项目**
   - 点击 "New Project"
   - 填写项目信息：
     * Organization: 选择或创建组织
     * Project Name: `nail-shop` (或你喜欢的名字)
     * Database Password: 设置一个强密码（务必保存好）
     * Region: 选择 `Northeast Asia (Seoul)` 或 `Asia Pacific (Singapore)`（离中国最近）
   - 点击 "Create new project"
   - 等待 1-2 分钟，项目创建完成

3. **运行数据库迁移**
   - 项目创建后，点击左侧菜单的 "SQL Editor"
   - 点击 "New Query"
   - 依次打开本地项目中的 `supabase/migrations/0001_init.sql` 和 `supabase/migrations/0002_google_oauth.sql`
   - 复制 SQL 内容，分别粘贴到 Supabase SQL Editor 中运行
   - 两个迁移都应提示 "Success. No rows returned"

4. **获取 API 密钥**
   - 点击左侧菜单的 "Settings" (设置)
   - 点击 "API"
   - 复制以下三个值（后面会用到）：
     * `Project URL` (项目URL)
     * `anon public` key（匿名公钥）
     * `service_role` key（服务角色密钥，点击右侧眼睛图标显示）

5. **填充初始数据（可选）**
   - 在本地项目中，创建 `.env.local` 文件
   - 填入刚才获取的密钥：
     ```bash
     DATABASE_PROVIDER=supabase
     NEXT_PUBLIC_SUPABASE_URL=你的项目URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
     SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
     ```
   - 在终端运行：
     ```bash
     pnpm run seed:supabase
     ```
   - 这将填充产品、分类等初始数据

---

### 第二步：在 Vercel 部署项目

1. **访问 Vercel 官网**
   - 打开浏览器访问：https://vercel.com
   - 点击 "Sign Up" 或 "Log In"
   - **推荐**：使用 GitHub 账号登录（可以直接关联仓库）

2. **导入 GitHub 项目**
   - 登录后，点击 "Add New..."
   - 选择 "Project"
   - 在 "Import Git Repository" 部分：
     * 如果没有看到你的仓库，点击 "Adjust GitHub App Permissions"
     * 授权 Vercel 访问你的 GitHub 仓库
   - 找到 `nail-shop` 仓库，点击 "Import"

3. **配置项目**
   - **Project Name**: `nail-shop` (可以自定义)
   - **Framework Preset**: 自动检测为 `Next.js`
   - **Root Directory**: 保持 `./` (默认)
   - **Build Command**: `next build` (默认)
   - **Output Directory**: `.next` (默认)

4. **配置环境变量**
   点击 "Environment Variables"，添加以下变量：
   
   | Name | Value |
   |------|-------|
| `DATABASE_PROVIDER` | `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 Supabase service_role key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID（同上，供服务端使用） |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `NODE_ENV` | `production` |

   **重要**：对于敏感信息（如 `SUPABASE_SERVICE_ROLE_KEY`），确保只添加到生产环境。

5. **开始部署**
   - 点击 "Deploy" 按钮
   - Vercel 会自动：
     * 克隆代码
     * 安装依赖 (`pnpm install`)
     * 构建项目 (`pnpm build`)
     * 部署到全球 CDN
   - 首次部署大约需要 2-3 分钟

6. **查看部署结果**
   - 部署成功后，会显示：
     * 🎉 Congratulations!
     * 项目 URL（例如：`https://nail-shop.vercel.app`）
   - 点击 "Visit" 访问你的网站

### 第三步：配置 Google 登录

完成基础部署后，继续在 Google Cloud Console 中配置 OAuth：

1. 进入 `APIs & Services → OAuth consent screen`，完善应用名称、支持邮箱，并将生产域名添加到 `Authorized domains`。
2. 在 `APIs & Services → Credentials` 创建 **OAuth client ID**（类型选择 `Web application`）。
3. 在 `Authorized redirect URIs` 中添加：
   - 生产环境：`https://<你的域名>/api/auth/google/callback`
   - （可选）本地开发：`http://localhost:3000/api/auth/google/callback`
4. 生成 `Client ID` 与 `Client Secret` 后，将它们填入 Vercel 环境变量（同时更新 `.env.local`）：
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client id>
   GOOGLE_CLIENT_ID=<client id>
   GOOGLE_CLIENT_SECRET=<client secret>
   ```
5. 重新部署网站；部署完成后，登录页会显示 “Continue with Google”。完成一次实际登录测试确认流程成功，并在 Google 控制台中发布 OAuth 应用（从 Testing 切换到 Production）。

---

### 第四步：配置自定义域名（可选）

如果你有自己的域名：

1. 在 Vercel 项目页面，点击 "Settings"
2. 点击 "Domains"
3. 输入你的域名（例如：`www.your-domain.com`）
4. 点击 "Add"
5. 按照提示在你的域名提供商处添加 DNS 记录：
   - **类型**: `CNAME`
   - **名称**: `www` (或 `@`)
   - **值**: `cname.vercel-dns.com`
6. 等待 DNS 传播（通常 5-30 分钟）
7. Vercel 会自动配置 HTTPS 证书

---

## 🔒 安全检查清单

在部署到生产环境前，确保：

- ✅ 已在 Supabase 中启用行级安全策略 (RLS)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` 只在服务器端使用，从未暴露到客户端
- ✅ 生产环境使用强密码
- ✅ 定期更新依赖包
- ✅ 配置了错误监控（可选：Sentry）
- ✅ 启用了 Vercel 的安全头部

---

## 🔄 持续部署

现在，每次你向 `main` 分支推送代码时，Vercel 会自动：

1. 检测到 GitHub 仓库的更新
2. 自动构建
3. 自动部署

你可以在 Vercel Dashboard 查看部署历史和日志。

---

## 📊 监控和分析

### Vercel Analytics（已集成）

项目已集成 `@vercel/analytics`，无需额外配置即可查看：
- 页面浏览量
- 访客统计
- 性能指标

在 Vercel Dashboard → Analytics 查看数据。

### 推荐的额外工具

- **错误监控**: Sentry（https://sentry.io）
- **性能监控**: Vercel Speed Insights
- **用户分析**: Google Analytics

---

## 🐛 常见问题

### 1. 部署失败：构建错误

**解决方法**：
- 检查 Vercel 的构建日志
- 确保本地 `pnpm build` 能成功运行
- 检查环境变量是否正确配置

### 2. 数据库连接错误

**解决方法**：
- 确认 Supabase 环境变量拼写正确
- 检查 Supabase 项目是否处于活跃状态
- 确认已运行数据库迁移脚本

### 3. 图片无法显示

**解决方法**：
- 检查 `next.config.mjs` 中的图片域名配置
- 确认图片路径正确
- 如果使用外部图片，需要在 `next.config.mjs` 中添加域名：
  ```js
  images: {
    domains: ['your-image-cdn.com'],
  }
  ```

### 4. 环境变量不生效

**解决方法**：
- 在 Vercel 中修改环境变量后，需要**重新部署**
- 点击 Deployments → 最新部署 → 三个点 → Redeploy

---

## 📞 技术支持

如果遇到问题：

1. **查看日志**：
   - Vercel: Dashboard → Deployments → 点击部署 → 查看 Function Logs
   - Supabase: Dashboard → Logs

2. **官方文档**：
   - Vercel: https://vercel.com/docs
   - Supabase: https://supabase.com/docs
   - Next.js: https://nextjs.org/docs

3. **社区支持**：
   - Vercel Discord: https://vercel.com/discord
   - Supabase Discord: https://discord.supabase.com

---

## 🎉 部署完成！

恭喜！你的 Nail Shop 电商网站现已成功部署到生产环境。

**下一步**：
- 测试所有功能（注册、登录、购物车、结账等）
- 配置支付网关（如需要）
- 设置邮件服务（用于订单通知等）
- 添加 Google Analytics
- SEO 优化（sitemap、robots.txt）
