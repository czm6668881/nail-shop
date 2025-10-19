# 后台管理界面访问指南

## 一、如何访问后台管理界面

### 访问地址
- **本地开发环境**: `http://localhost:3000/admin`
- **生产环境**: `https://你的域名/admin`

### 登录要求
- 必须使用具有 `admin` 角色的账号登录
- 登录地址: `http://localhost:3000/login`

---

## 二、默认管理员账号

**默认管理员账号信息：**
- 邮箱: `admin@luxenails.com`
- 密码: `Admin123!`
- 角色: admin

---

## 三、修改管理员邮箱

我已经为你创建了两个脚本来更新管理员邮箱地址：

### 方法 1: 本地 SQLite 数据库（推荐用于开发环境）

**适用场景**: 使用本地 SQLite 数据库进行开发

**步骤**:

1. 确保开发服务器已运行过一次（初始化数据库）:
   ```bash
   pnpm dev
   ```
   按 `Ctrl+C` 停止服务器

2. 运行更新脚本:
   ```bash
   pnpm run update:admin:local your-email@example.com
   ```
   或者:
   ```bash
   pnpm tsx scripts/update-admin-local.ts your-email@example.com
   ```

3. 重启开发服务器:
   ```bash
   pnpm dev
   ```

4. 使用新邮箱登录:
   - 邮箱: `your-email@example.com`
   - 密码: `Admin123!`（保持不变）

### 方法 2: Supabase 数据库（用于生产环境）

**适用场景**: 已经配置了 Supabase 数据库

**前提条件**:
- 已创建 Supabase 项目
- 已运行数据库迁移
- 已配置环境变量:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**步骤**:

1. 确保已运行种子脚本（创建初始管理员账号）:
   ```bash
   pnpm run seed:supabase
   ```

2. 运行更新脚本:
   ```bash
   pnpm run update:admin your-email@example.com
   ```
   或者:
   ```bash
   pnpm tsx scripts/update-admin-email.ts your-email@example.com
   ```

3. 使用新邮箱登录:
   - 邮箱: `your-email@example.com`
   - 密码: `Admin123!`（保持不变）

---

## 四、快速开始指南

### 选项 A: 快速本地测试（无需配置）

1. 安装依赖:
   ```bash
   pnpm install
   ```

2. 启动开发服务器（自动使用 SQLite）:
   ```bash
   pnpm dev
   ```

3. 打开浏览器访问:
   - 登录页面: `http://localhost:3000/login`
   - 使用默认管理员账号登录:
     - 邮箱: `admin@luxenails.com`
     - 密码: `Admin123!`

4. 登录后访问后台:
   - `http://localhost:3000/admin`

5. （可选）修改管理员邮箱:
   ```bash
   pnpm run update:admin:local your-email@example.com
   ```

### 选项 B: 使用 Supabase（生产就绪）

请参考 `README.md` 中的 "Supabase Setup" 部分进行完整配置。

---

## 五、修改管理员密码

如果需要修改密码，有两种方式：

### 方式 1: 使用忘记密码功能
1. 访问 `http://localhost:3000/forgot-password`
2. 输入管理员邮箱
3. 按照邮件说明重置密码

### 方式 2: 手动生成新密码哈希
1. 使用 bcrypt 生成新密码哈希:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('你的新密码', 10))"
   ```

2. 直接在数据库中更新 `users` 表的 `password_hash` 字段

---

## 六、故障排查

### 问题 1: 无法访问后台（被重定向到登录页）
**原因**: 未登录或不是管理员角色

**解决方案**:
1. 确保使用管理员账号登录
2. 检查用户的 `role` 字段是否为 `admin`

### 问题 2: 数据库未初始化
**症状**: 运行更新脚本时提示"数据库文件不存在"

**解决方案**:
```bash
# 先运行一次开发服务器初始化数据库
pnpm dev
# 按 Ctrl+C 停止，然后运行更新脚本
```

### 问题 3: 邮箱已被使用
**症状**: 更新时提示"邮箱已被其他用户使用"

**解决方案**:
- 使用其他邮箱地址
- 或先删除/修改冲突的用户账号

---

## 七、安全建议

1. **修改默认密码**: 首次登录后立即修改默认密码 `Admin123!`

2. **使用强密码**: 密码应包含：
   - 至少 8 个字符
   - 大小写字母
   - 数字
   - 特殊字符

3. **限制访问**: 生产环境中确保:
   - 使用 HTTPS
   - 配置合适的 CORS 策略
   - 定期审查管理员账号

4. **环境变量安全**:
   - 不要将 `.env.local` 提交到 Git
   - 生产环境使用 Vercel 环境变量
   - `SUPABASE_SERVICE_ROLE_KEY` 必须保密

---

## 八、后台功能概览

登录后台后，你可以管理：

- **产品管理** (`/admin/products`)
  - 添加、编辑、删除产品
  - 管理产品库存
  - 设置产品价格和图片

- **订单管理** (`/admin/orders`)
  - 查看所有订单
  - 更新订单状态
  - 添加物流信息

- **系列管理** (`/admin/collections`)
  - 创建和管理产品系列
  - 设置精选系列

- **博客管理** (`/admin/blog`)
  - 创建和发布博客文章
  - 管理文章分类和标签

- **客户管理** (`/admin/customers`)
  - 查看客户列表
  - 管理客户信息

- **评论管理** (`/admin/reviews`)
  - 审核客户评论
  - 管理评论显示

---

## 九、需要帮助？

如果遇到问题，请查看：
- `README.md` - 项目整体说明
- `DEPLOYMENT.md` - 部署指南
- `GOOGLE_SETUP.md` - Google 登录配置

或者查看项目问题跟踪器。


