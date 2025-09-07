# ALIGNMENT_6A_AUTH

本文件用于对齐本项目注册/登录机制在 6A 安全框架（认证、授权、审计、管理、稽核、抗抵赖）下的现状、边界与问题清单，为后续重构提供依据。

## 1. 项目上下文与技术栈
- 前端/SSR：Next.js 14（App Router）
- 状态管理：Zustand
- 后端服务：Supabase（认证、数据库、RLS、存储）
- UI/验证：shadcn、Zod、React Hook Form
- 代码位置：主要应用位于 `shi-guang-ji/`

## 2. 现状综述（与6A对照）
- Authentication（认证）：
  - 登录：客户端 `supabase.auth.signInWithPassword` 直连
  - 注册：服务端 API 使用 Service Role 直接 `admin.createUser` 且 `email_confirm: true`（跳过邮箱验证）
  - 中间件：仓库根存在 `src/middleware.ts`，`shi-guang-ji/` 下未配置；路由保护较基础
- Authorization（授权）：
  - 以 RLS 为主（按 `auth.uid()` 自主可见/可改自己的数据）
  - 未见角色/权限（RBAC）设计
- Accounting（审计）：
  - 无统一审计日志表、无登录失败/成功/权限变更等安全事件记录
- Administration（管理）：
  - 无管理员 UI（用户管理、角色配置、日志浏览）
- Audit（稽核）：
  - 无日志查询与分析通道，无异常模式识别
- Anti-repudiation（抗抵赖）：
  - 无不可抵赖的日志链设计，缺乏篡改检测能力

## 3. 风险与差距
- 跳过邮箱验证：使用 Service Role 直接创建并确认用户，存在被滥用风险
- 无强密码策略与黑名单校验，弱密码可注册
- 登录与注册缺少速率限制/锁定/Captcha，易受暴力破解与撞库
- 无审计日志与事件追踪，事后取证与稽核困难
- 无 RBAC，难以扩展管理员能力与细粒度授权
- 中间件会话加固不足，缺少空闲/绝对超时、异常活动检测
- 错误信息可能过于具体，存在信息泄漏

## 4. 边界与约束
- 保持 Supabase 为唯一身份源与数据层；不自建密码加密流程（由 Supabase 负责）
- 无需引入新后端框架；以 Next.js 路由/API 与 SQL 迁移实现
- 不新增外部付费基础设施（Redis 等）作为前期前提；后续可选

## 5. 目标与范围（本轮重构）
- 认证：
  - 注册改为标准邮箱验证流程；服务端执行强密码策略校验
  - 登录前置速率限制校验与审计记录
- 授权：
  - 引入基础 RBAC（user/admin），角色存于 `app_metadata.role`
- 审计：
  - 新建 `audit_logs` 表记录关键事件（注册、登录成功/失败、登出、权限变更）
- 管理：
  - 预留 `/admin` 管理入口的接口与权限基础（UI 可后续迭代）
- 稽核与抗抵赖：
  - 审计日志表启用不可抵赖哈希链、禁止 UPDATE/DELETE，管理员可查阅
- 会话：
  - 预备中间件加固（空闲/绝对时长），该轮以审计与限流为先

## 6. 待确认的关键决策（已获同意）
- 角色存储：`auth.users.app_metadata.role`（user/admin）
- 限流：前期基于数据库统计（后续可替换 Redis）
- Captcha：保留接口，初期默认关闭
- 会话超时：Idle 30m、Absolute 24h（后续中间件加固时启用）
- 以 `shi-guang-ji/` 目录为主要应用路径

## 7. 里程碑与交付
- 文档：ALIGNMENT 与 CONSENSUS
- 数据库迁移：`audit_logs`、`is_admin()`、RLS/Policy
- 服务端 API：注册改造、登录前置校验、审计上报
- 客户端 Store：登录流程接入前置校验与审计
- 后续：中间件会话加固、管理员 UI、报告导出

