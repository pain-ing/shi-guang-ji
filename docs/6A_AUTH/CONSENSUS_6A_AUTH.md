# CONSENSUS_6A_AUTH

本文件记录本轮 6A 注册/登录安全重构的最终共识、技术方案与验收标准。

## 1. 目标与范围
- 认证：注册改为标准邮箱验证流程；强密码策略；登录前置限流校验；全链路审计
- 授权：引入基础 RBAC（user/admin）写入 `auth.users.app_metadata.role`
- 审计：新增 `audit_logs` 表记录关键安全事件
- 管理：预留 `/admin` 入口与接口；管理员可查审计日志
- 稽核/抗抵赖：日志哈希链防篡改；禁止 UPDATE/DELETE；管理员可全量只读
- 会话：预设 Idle=30m、Absolute=24h（后续通过中间件启用）

## 2. 技术方案
- 数据库
  - 表：`audit_logs(id, user_id, event_type, success, ip, user_agent, details, created_at, prev_hash, hash)`
  - 函数/触发器：`compute_audit_hash()` + BEFORE INSERT 触发器；`is_admin()` 基于 `auth.jwt()->app_metadata.role`
  - RLS/Policy：启用 RLS；普通用户仅可读自身相关事件；管理员可读全量；无 UPDATE/DELETE 策略
- 服务端 API（Next.js App Route）
  - POST `/api/auth/signup`：强密码校验；使用 anon key 调用 `auth.signUp` 发送验证邮件；日志记录
  - POST `/api/security/login-precheck`：按 IP/邮箱 10 分钟内失败次数阈值（5）限流；日志记录
  - POST `/api/security/audit`：统一审计上报（用于登录成功/失败、登出等）
- 客户端 Store（Zustand）
  - `signUp`：保留服务端 API 调用
  - `signIn`：先调用 `/api/security/login-precheck`，再 `supabase.auth.signInWithPassword`，最后调用 `/api/security/audit`
  - `signOut`：调用 `supabase.auth.signOut` 后上报 `/api/security/audit`
- 安全库
  - `password.ts`：强密码与常见密码黑名单校验
  - `logger.ts`：服务端审计记录工具（提取 IP/UA、写入 `audit_logs`）
  - `rbac.ts`：基础工具函数（可扩展为接口守卫）

## 3. 默认参数与可配
- 密码策略：长度≥10，且包含大小写、数字、特殊字符；拒绝常见密码黑名单
- 限流策略：10 分钟失败阈值 5 次（按邮箱或 IP）
- 审计事件：`sign_up_success|sign_up_failed|login_success|login_failed|login_rate_limited|logout`
- 会话：Idle 30m、Absolute 24h（后续中间件生效）

## 4. 验收标准
- 认证
  - 弱/常见密码无法注册；注册需邮箱验证；登录在暴力尝试下被限流
- 授权
  - RBAC 生效：管理员可访问审计日志，普通用户不可
- 审计/稽核/抗抵赖
  - 关键安全事件均有记录；`audit_logs` 禁止 UPDATE/DELETE；哈希链可校验
- 会话
  -（下一阶段）中间件启用后空闲/绝对超时生效
- 错误处理
  - API 返回统一、最小化的错误信息；不泄漏内部实现细节

## 5. 里程碑
1) 迁移与安全库落地 → 2) API 与 Store 改造 → 3) 中间件/会话加固 → 4) 管理界面与报表

