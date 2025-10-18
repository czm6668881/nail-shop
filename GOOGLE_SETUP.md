# Google 登录配置完成指南

## ✅ 已完成配置

### 1. 本地开发环境
- ✅ `.env.local` 已创建并配置
- ✅ Google Client ID 已配置
- ✅ 开发服务器已启动，Google 登录按钮已显示

### 2. Google Cloud Console 配置清单

请确认以下配置已在 [Google Cloud Console](https://console.cloud.google.com/) 完成：

#### OAuth 同意屏幕 (OAuth consent screen)
- [ ] 应用名称：填写您的应用名称（例如：Gel Manicure Nail Shop）
- [ ] 用户支持电子邮件：填写您的邮箱
- [ ] 应用首页：`https://gelmanicure-nail.com`
- [ ] 已授权的域：添加 `gelmanicure-nail.com`
- [ ] 开发者联系信息：填写您的邮箱
- [ ] 发布状态：从 `Testing` 切换到 `In production`（测试完成后）

#### OAuth 客户端 ID (Credentials)
已配置的 Redirect URIs：
- [ ] **本地开发**：`http://localhost:3000/api/auth/google/callback`
- [ ] **生产环境**：`https://gelmanicure-nail.com/api/auth/google/callback`
- [ ] **WWW 域名**（可选）：`https://www.gelmanicure-nail.com/api/auth/google/callback`

> ⚠️ **重要**：Redirect URIs 必须完全匹配，包括协议（http/https）和路径

---

## 🚀 生产环境部署配置

### Vercel 环境变量配置

登录 [Vercel Dashboard](https://vercel.com/dashboard)，进入项目设置，添加以下环境变量：

#### 必需变量（Required）

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `DATABASE_PROVIDER` | `supabase` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase 项目 URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 Supabase service key | Production, Preview |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | 你的 Google Client ID | Production, Preview |
| `GOOGLE_CLIENT_ID` | 你的 Google Client ID | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | 你的 Google Client Secret | Production, Preview |

#### 配置步骤

1. 进入 Vercel 项目页面
2. 点击 **Settings** → **Environment Variables**
3. 逐个添加上述变量
4. 对于敏感信息（如 `SUPABASE_SERVICE_ROLE_KEY` 和 `GOOGLE_CLIENT_SECRET`），点击锁图标标记为敏感
5. 点击 **Save**
6. 重新部署项目：**Deployments** → 最新部署 → **Redeploy**

---

## 🧪 测试 Google 登录功能

### 本地测试（已可用）

1. 打开浏览器访问：`http://localhost:3000/login`
2. 点击 "Continue with Google" 按钮
3. 选择 Google 账号登录
4. 成功后应跳转到 `/account` 页面

### 生产环境测试（部署后）

1. 访问：`https://gelmanicure-nail.com/login`
2. 点击 "Continue with Google" 按钮
3. 验证登录流程是否正常

---

## 🔧 故障排查

### 问题 1：Redirect URI 不匹配错误

**错误信息**：`Error 400: redirect_uri_mismatch`

**解决方法**：
1. 检查 Google Cloud Console 中的 Redirect URIs 是否包含当前域名
2. 确保 URI 完全匹配，包括 `https://` 和 `/api/auth/google/callback`
3. 修改后等待 1-2 分钟让 Google 更新配置

### 问题 2：Google 登录按钮不显示

**解决方法**：
1. 检查 `.env.local` 或 Vercel 环境变量是否正确配置
2. 确认 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 存在（注意 `NEXT_PUBLIC_` 前缀）
3. 重启开发服务器或重新部署

### 问题 3：登录后跳转到错误页面

**解决方法**：
1. 检查浏览器控制台错误信息
2. 查看 Vercel Function Logs（生产环境）
3. 确认数据库迁移已执行（`google_id` 字段存在）

### 问题 4：OAuth 同意屏幕显示 "应用未验证"

**解决方法**：
1. 在 Google Cloud Console 将应用状态从 `Testing` 改为 `In production`
2. 或在 OAuth 同意屏幕添加测试用户（Testing 模式下）

---

## 📋 部署前检查清单

- [ ] Google Cloud Console 已配置所有 Redirect URIs
- [ ] Vercel 环境变量已全部配置
- [ ] Supabase 数据库迁移已执行（包括 `0002_google_oauth.sql`）
- [ ] 本地测试 Google 登录成功
- [ ] 代码已推送到 GitHub main 分支
- [ ] Vercel 自动部署已完成
- [ ] 生产环境测试 Google 登录成功
- [ ] OAuth 应用已发布（从 Testing 切换到 Production）

---

## 🎉 配置完成

您的 Gel Manicure Nail Shop 现已支持：
- ✅ 邮箱密码登录
- ✅ Google 第三方登录
- ✅ 账号自动关联
- ✅ 统一的用户体验

如有问题，请参考 `DEPLOYMENT.md` 或查看 Vercel/Supabase 日志。

