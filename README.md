# 拾光集 - 基于 6A 安全框架的个人日记应用

一个现代化的个人日记应用，采用 Next.js 14 + Supabase 构建，实现了完整的 6A 安全框架。

## 🔒 6A 安全框架实现

### 1. Authentication (认证)
- **强密码策略**：10位以上，包含大小写字母、数字、特殊字符
- **邮箱验证**：注册必须通过邮箱验证激活
- **常见弱密码黑名单**：防止使用常见弱密码
- **审计日志**：所有认证事件完整记录

### 2. Authorization (授权)
- **基于角色的访问控制 (RBAC)**：admin/user 角色体系
- **行级安全 (RLS)**：用户仅能访问自己的数据
- **管理员权限**：管理员可访问全量审计日志和用户管理

### 3. Accounting (审计)
- **完整审计链**：SHA-256 哈希链确保日志不可篡改
- **事件覆盖**：注册、登录、登出、角色变更等关键事件
- **IP/UA 追踪**：记录用户行为的网络环境信息

### 4. Administration (管理)
- **用户管理界面**：/admin 管理员控制台
- **角色切换**：一键切换用户 admin/user 角色
- **审计日志浏览**：实时查看系统安全事件

### 5. Audit (稽核)
- **不可抵赖日志**：audit_logs 表禁止更新/删除
- **哈希链校验**：每条记录包含前序哈希，确保完整性
- **时间戳保护**：使用数据库时间戳防止时间篡改

### 6. Anti-repudiation (抗抵赖)
- **数字签名机制**：基于 SHA-256 的哈希链
- **操作不可否认**：所有关键操作均有审计记录
- **完整性验证**：支持审计链完整性自检

## 🚀 技术栈

- **前端**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Supabase
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth + 自定义安全增强
- **状态管理**: Zustand
- **表单验证**: Zod

## 🛡️ 安全特性

### 会话管理
- **空闲超时**: 30分钟无操作自动登出
- **绝对超时**: 24小时强制重新认证
- **安全 Cookie**: HttpOnly + SameSite + Secure 属性

### 防护机制
- **登录限流**: 10分钟内失败5次触发限流
- **密码策略**: 服务端强制验证 + 客户端友好提示
- **错误处理**: 统一错误响应，避免信息泄漏

### 审计与监控
- **实时审计**: 所有安全事件实时记录
- **管理员监控**: 专用管理界面查看系统状态
- **哈希链保护**: 确保审计日志完整性

## 📦 安装与运行

### 环境要求
- Node.js 18+
- npm/yarn/pnpm

### 环境变量配置
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 安装依赖
```bash
cd shi-guang-ji
npm install
```

### 数据库迁移
在 Supabase SQL Editor 中执行以下脚本：

```sql
-- 启用扩展
create extension if not exists pgcrypto;

-- 创建 is_admin() 函数
create or replace function public.is_admin()
returns boolean as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$ language sql stable security definer;

-- 创建审计日志表（完整脚本见项目文档）
-- ... (详细 SQL 见上文提供的一键脚本)
```

### 启动开发服务器
```bash
npm run dev
```

### 设置管理员
1. 在 Supabase Dashboard → Authentication → Users
2. 编辑用户的 app_metadata: `{"role":"admin"}`
3. 重新登录生效

## 📁 项目结构

```
shi-guang-ji/
├── src/
│   ├── app/
│   │   ├── (admin)/admin/          # 管理员界面
│   │   ├── (auth)/                 # 认证页面
│   │   ├── api/
│   │   │   ├── admin/              # 管理员 API
│   │   │   ├── auth/               # 认证 API
│   │   │   └── security/           # 安全 API
│   │   └── ...
│   ├── lib/
│   │   └── security/               # 安全工具库
│   ├── stores/                     # 状态管理
│   └── middleware.ts               # 会话中间件
├── docs/6A_AUTH/                   # 安全框架文档
└── supabase/migrations/            # 数据库迁移
```

## 🔧 核心功能

### 用户功能
- ✅ 安全注册/登录
- ✅ 个人日记管理
- ✅ 媒体文件上传
- ✅ 标签系统
- ✅ 打卡功能

### 管理功能
- ✅ 用户管理
- ✅ 角色切换
- ✅ 审计日志查看
- ✅ 安全监控

### 安全功能
- ✅ 强密码策略
- ✅ 登录限流
- ✅ 会话超时
- ✅ 审计日志
- ✅ 权限控制

## 📝 开发说明

### 安全开发原则
1. **最小权限原则**: 用户仅能访问必要资源
2. **深度防御**: 多层安全控制
3. **审计优先**: 所有关键操作必须审计
4. **错误安全**: 失败时默认拒绝访问

### API 安全规范
- 所有管理员 API 需验证 `is_admin()`
- 敏感操作使用 Service Role Key
- 统一错误响应格式
- 完整的审计日志记录

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Supabase](https://supabase.com/) - 后端即服务
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
