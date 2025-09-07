# 6A 安全框架 - 待办事项与配置指南

## 🚨 必须完成的配置

### 1. 数据库迁移执行
**状态**: ⚠️ 待执行  
**优先级**: 🔴 高

**操作步骤**:
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 SQL Editor
4. 复制并执行以下完整脚本：

```sql
-- 1) 依赖扩展
create extension if not exists pgcrypto;

-- 2) is_admin()：从 JWT app_metadata.role 判断
create or replace function public.is_admin()
returns boolean as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$ language sql stable security definer;

-- 3) 审计日志表
create table if not exists public.audit_logs (
  id bigserial primary key,
  user_id uuid null,
  event_type text not null,
  success boolean not null default false,
  ip text null,
  user_agent text null,
  details jsonb null,
  created_at timestamptz not null default now(),
  prev_hash text null,
  hash text null
);

-- 4) 索引
create index if not exists idx_audit_logs_event_type on public.audit_logs(event_type);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);
create index if not exists idx_audit_logs_ip on public.audit_logs(ip);

-- 5) 计算哈希链函数
create or replace function public.compute_audit_hash()
returns trigger as $$
declare
  v_prev_hash text;
  v_payload text;
begin
  select hash into v_prev_hash
  from public.audit_logs
  where id = (select max(id) from public.audit_logs);

  new.prev_hash := coalesce(v_prev_hash, '');

  v_payload := coalesce(new.prev_hash,'') || '|' || coalesce(new.user_id::text,'') || '|' ||
               coalesce(new.event_type,'') || '|' || new.success::text || '|' ||
               coalesce(new.ip,'') || '|' || coalesce(new.user_agent,'') || '|' ||
               coalesce(new.details::text,'') || '|' || new.created_at::text;

  new.hash := encode(digest(v_payload, 'sha256'), 'hex');
  return new;
end;
$$ language plpgsql security definer;

-- 6) 触发器：插入前计算哈希
drop trigger if exists trg_audit_logs_hash on public.audit_logs;
create trigger trg_audit_logs_hash
before insert on public.audit_logs
for each row execute function public.compute_audit_hash();

-- 7) 禁止 UPDATE/DELETE
create or replace function public.prevent_audit_change()
returns trigger as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$ language plpgsql;

drop trigger if exists trg_audit_logs_no_update on public.audit_logs;
create trigger trg_audit_logs_no_update
before update on public.audit_logs
for each row execute function public.prevent_audit_change();

drop trigger if exists trg_audit_logs_no_delete on public.audit_logs;
create trigger trg_audit_logs_no_delete
before delete on public.audit_logs
for each row execute function public.prevent_audit_change();

-- 8) 启用 RLS
alter table public.audit_logs enable row level security;

-- 9) RLS 策略：用户仅可查看自己的；管理员可查看全部
drop policy if exists audit_logs_select_self on public.audit_logs;
create policy audit_logs_select_self
on public.audit_logs
for select
using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin
on public.audit_logs
for select to authenticated
using (public.is_admin());
```

### 2. 环境变量配置
**状态**: ⚠️ 待配置  
**优先级**: 🔴 高

**本地开发** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**生产部署** (Vercel/其他平台):
- 在部署平台的环境变量设置中添加上述三个变量
- 确保 `SUPABASE_SERVICE_ROLE_KEY` 仅在服务端使用，不要暴露到客户端

### 3. 管理员账号设置
**状态**: ⚠️ 待设置  
**优先级**: 🔴 高

**操作步骤**:
1. 在应用中注册一个账号（或使用现有账号）
2. 登录 Supabase Dashboard → Authentication → Users
3. 找到你的账号，点击编辑
4. 在 "Raw app_metadata" 中设置：
   ```json
   {"role":"admin"}
   ```
5. 保存后重新登录应用以刷新 JWT

## 🔧 推荐配置

### 4. 邮件模板自定义
**状态**: 📝 可选  
**优先级**: 🟡 中

**操作位置**: Supabase Dashboard → Authentication → Email Templates
- 自定义注册确认邮件模板
- 设置品牌 Logo 和样式
- 配置邮件发送域名

### 5. 安全策略调整
**状态**: 📝 可选  
**优先级**: 🟡 中

**可调整参数**:
```typescript
// shi-guang-ji/src/middleware.ts
const IDLE_MINUTES = 30        // 空闲超时（分钟）
const ABSOLUTE_HOURS = 24      // 绝对超时（小时）

// shi-guang-ji/src/app/api/security/login-precheck/route.ts
const WINDOW_MINUTES = 10      // 限流时间窗口（分钟）
const MAX_FAILURES = 5        // 最大失败次数
```

## 🧪 功能验证清单

### 认证功能测试
- [ ] 使用弱密码注册 → 应该被拒绝
- [ ] 使用强密码注册 → 应该收到验证邮件
- [ ] 连续登录失败5次 → 应该被限流
- [ ] 空闲30分钟后访问受保护页面 → 应该跳转登录

### 授权功能测试
- [ ] 普通用户访问 `/admin` → 应该显示 403
- [ ] 管理员访问 `/admin` → 应该显示管理界面
- [ ] 管理员切换用户角色 → 应该成功并记录审计

### 审计功能测试
- [ ] 登录成功/失败 → 检查 `audit_logs` 表有记录
- [ ] 角色变更 → 检查审计日志包含 `role_changed` 事件
- [ ] 哈希链完整性 → 验证每条记录的 `hash` 字段

## 🚀 部署指南

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 设置环境变量（见上文）
3. 部署完成后测试功能

### 其他平台部署
- 确保 Node.js 18+ 环境
- 设置正确的环境变量
- 运行 `npm run build` 构建项目

## 🔍 故障排查

### 常见问题

**Q: 管理员界面显示 403**
A: 检查用户的 `app_metadata` 是否正确设置为 `{"role":"admin"}`，并重新登录

**Q: 审计日志没有记录**
A: 检查 `SUPABASE_SERVICE_ROLE_KEY` 环境变量是否正确配置

**Q: 登录限流不生效**
A: 确认数据库迁移已执行，`audit_logs` 表已创建

**Q: 会话超时不工作**
A: 检查浏览器开发者工具，确认 Cookie 设置正确

### 调试工具

**查看审计日志**:
```sql
-- 在 Supabase SQL Editor 中执行
select * from audit_logs order by created_at desc limit 10;
```

**检查用户角色**:
```sql
-- 查看用户的 app_metadata
select id, email, raw_app_meta_data from auth.users;
```

## 📞 技术支持

如遇到问题，请检查：
1. 环境变量配置是否正确
2. 数据库迁移是否执行成功
3. 管理员角色是否设置正确
4. 浏览器控制台是否有错误信息

**日志位置**:
- 客户端错误：浏览器开发者工具 Console
- 服务端错误：Vercel Functions 日志或服务器日志
- 数据库错误：Supabase Dashboard → Logs

## ✅ 完成确认

完成上述配置后，你的应用将具备：
- ✅ 企业级安全认证
- ✅ 完整的审计追踪
- ✅ 基于角色的权限控制
- ✅ 会话安全管理
- ✅ 管理员控制台

**最终测试**: 访问 `/admin` 页面，应该能看到审计日志和用户管理功能。
