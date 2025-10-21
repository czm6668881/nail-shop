# 首页轮播功能说明

## 功能概述

成功为首页添加了轮播功能，支持：
- 自动播放，每5秒自动切换
- 左右箭头按钮手动切换
- 底部指示器，点击可跳转到指定图片
- 鼠标悬停暂停自动播放
- 后台管理界面，可以添加、编辑、删除轮播图

## 技术实现

### 1. 数据库表
- 新增 `hero_slides` 表存储轮播图数据
- 字段包括：标题、副标题、图片URL、按钮文本、按钮链接、排序、状态等

### 2. 后台管理
- 访问路径：`/admin/hero-slides`
- 功能：
  - 添加新轮播图
  - 编辑现有轮播图
  - 启用/禁用轮播图
  - 删除轮播图
  - 上传图片

### 3. 前台展示
- 位置：首页顶部 Hero Section
- 特性：
  - 图片淡入淡出过渡效果
  - 响应式设计，移动端友好
  - 无障碍支持（ARIA 标签）
  - 如果没有轮播图，显示默认内容

## 使用方法

### 添加首张轮播图
1. 访问后台管理：`http://localhost:3000/admin/hero-slides`
2. 点击"添加轮播图"按钮
3. 填写：
   - 标题（必填）：例如"凝胶美甲"
   - 副标题（可选）：例如"探索我们一系列优质按压式美甲"
   - 图片（必填）：可以上传新图片或输入URL，例如 `/luxury-press-on-nails-hero-image-elegant-hands.jpg`
   - 按钮文本（可选）：例如"立即购买"
   - 按钮链接（可选）：例如"/products"
   - 启用状态：勾选
4. 点击"创建"保存

### 添加更多轮播图
重复上述步骤，添加多张轮播图。建议添加2-5张图片以获得最佳效果。

## 文件清单

### 新增文件
- `lib/api/hero-slides.ts` - 轮播图数据API
- `app/api/hero-slides/route.ts` - 前台API路由（获取激活的轮播图）
- `app/api/admin/hero-slides/route.ts` - 后台API路由（列表、创建、排序）
- `app/api/admin/hero-slides/[id]/route.ts` - 后台API路由（详情、更新、删除）
- `app/admin/hero-slides/page.tsx` - 后台管理界面
- `components/hero-carousel.tsx` - 前台轮播组件
- `HERO_CAROUSEL_SETUP.md` - 本说明文件

### 修改文件
- `lib/db/schema.ts` - 添加 hero_slides 表定义
- `types/database.ts` - 添加数据库类型
- `types/index.ts` - 添加 HeroSlide 接口
- `app/page.tsx` - 使用新的轮播组件
- `components/admin/admin-shell.tsx` - 添加"Hero Slides"导航菜单项

## 注意事项

1. **数据库迁移**：首次启动时会自动创建 `hero_slides` 表
2. **图片路径**：建议使用 `/public` 目录下的图片或上传新图片
3. **原有功能**：保持完整，页面风格不变
4. **国际化**：界面采用中文，符合项目国际化要求

## 测试

访问首页 `http://localhost:3000`，查看轮播效果。如果没有数据，会显示原来的默认内容。

访问 `http://localhost:3000/admin/hero-slides` 添加轮播图后，刷新首页即可看到轮播效果。

