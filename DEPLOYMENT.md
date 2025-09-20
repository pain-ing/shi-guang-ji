# 拾光集部署指南

## 🚀 部署步骤

### 1. 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 仓库名称：`shi-guang-ji`
4. 描述：`拾光集 - 个人时光记录应用，支持每日打卡、日记编写和媒体管理`
5. 选择 "Public" 或 "Private"
6. 不要勾选 "Initialize this repository with a README"
7. 点击 "Create repository"

### 2. 推送代码到 GitHub

在项目目录中执行以下命令：

```bash
# 如果还没有添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/shi-guang-ji.git

# 推送代码
git branch -M main
git push -u origin main
```

### 3. 配置 Supabase

#### 3.1 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com) 并登录
2. 点击 "New project"
3. 选择组织和项目名称
4. 设置数据库密码
5. 选择地区（建议选择离用户最近的地区）
6. 点击 "Create new project"

#### 3.2 运行数据库迁移
1. 在 Supabase 项目中，进入 "SQL Editor"
2. 复制 `supabase/migrations/` 目录下的所有 SQL 文件内容
3. 按照文件名顺序执行这些 SQL 语句

#### 3.3 配置存储桶
1. 进入 "Storage" 页面
2. 创建两个存储桶：
   - `avatars` (公共访问)
   - `media` (私有访问)
3. 配置存储策略（已在迁移文件中定义）

#### 3.4 获取项目配置
1. 进入 "Settings" > "API"
2. 复制以下信息：
   - Project URL
   - anon public key

### 4. 部署到 Vercel

#### 4.1 连接 GitHub 仓库
1. 访问 [Vercel](https://vercel.com) 并登录
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择您的 `shi-guang-ji` 仓库
5. 点击 "Import"

#### 4.2 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 4.3 部署设置
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

#### 4.4 开始部署
1. 点击 "Deploy"
2. 等待部署完成（通常需要 2-5 分钟）
3. 部署成功后会获得一个 `.vercel.app` 域名

### 5. 配置自定义域名（可选）

1. 在 Vercel 项目设置中进入 "Domains"
2. 添加您的自定义域名
3. 按照提示配置 DNS 记录

### 6. 测试部署

1. 访问部署后的网站
2. 测试以下功能：
   - 用户注册和登录
   - 每日打卡功能
   - 日记编写和保存
   - 文件上传功能
   - 个人资料管理

## 🔧 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 🛠️ 故障排除

### 常见问题

#### 1. 构建失败
- 检查 TypeScript 类型错误：`npm run type-check`
- 检查 ESLint 错误：`npm run lint`
- 确保所有依赖已安装：`npm install`

#### 2. 数据库连接失败
- 检查 Supabase URL 和密钥是否正确
- 确保 Supabase 项目状态正常
- 检查网络连接

#### 3. 文件上传失败
- 检查 Supabase Storage 配置
- 确保存储桶已创建
- 检查 RLS 策略是否正确

#### 4. 认证问题
- 检查 Supabase Auth 配置
- 确保邮箱确认设置正确
- 检查重定向 URL 配置

### 日志查看

#### Vercel 日志
1. 进入 Vercel 项目仪表板
2. 点击 "Functions" 查看服务器端日志
3. 点击 "Deployments" 查看构建日志

#### 浏览器日志
1. 打开浏览器开发者工具
2. 查看 Console 面板的错误信息
3. 查看 Network 面板的网络请求

## 📊 性能优化

### 1. 图片优化
- 使用 Next.js Image 组件
- 配置图片压缩
- 启用 WebP 格式

### 2. 缓存策略
- 配置 CDN 缓存
- 使用 SWR 进行数据缓存
- 启用浏览器缓存

### 3. 代码分割
- 使用动态导入
- 懒加载组件
- 优化包大小

## 🔒 安全配置

### 1. 环境变量安全
- 不要在客户端暴露敏感信息
- 使用 Vercel 环境变量管理
- 定期轮换密钥

### 2. 数据库安全
- 启用 RLS 策略
- 限制 API 访问
- 定期备份数据

### 3. 文件上传安全
- 限制文件类型和大小
- 扫描恶意文件
- 配置访问权限

## 📈 监控和分析

### 1. Vercel Analytics
- 启用 Vercel Analytics
- 监控页面性能
- 分析用户行为

### 2. 错误监控
- 集成 Sentry 或类似服务
- 监控运行时错误
- 设置告警通知

### 3. 性能监控
- 使用 Lighthouse 分析
- 监控 Core Web Vitals
- 优化加载速度

## 🔄 持续部署

### 自动部署
- 推送到 main 分支自动部署
- 配置预览部署
- 设置部署钩子

### 版本管理
- 使用语义化版本
- 创建发布标签
- 维护更新日志

---

## 📞 支持

如果在部署过程中遇到问题，请：

1. 检查本文档的故障排除部分
2. 查看项目的 GitHub Issues
3. 联系技术支持

祝您部署顺利！🎉
