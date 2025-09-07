-- 审计日志与不可抵赖哈希链

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

-- 索引
create index if not exists idx_audit_logs_event_type on public.audit_logs(event_type);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);
create index if not exists idx_audit_logs_ip on public.audit_logs(ip);

-- 计算哈希的函数（简单链式，不带并发锁；满足当前需求）
create or replace function public.compute_audit_hash()
returns trigger as $$
declare
  v_prev_hash text;
  v_payload text;
begin
  -- 取上一条记录的 hash（全局链）
  select hash into v_prev_hash from public.audit_logs
  where id = (select max(id) from public.audit_logs);

  new.prev_hash := coalesce(v_prev_hash, '');

  -- 拼接关键信息构建 payload
  v_payload := coalesce(new.prev_hash,'') || '|' || coalesce(new.user_id::text,'') || '|' ||
               coalesce(new.event_type,'') || '|' || new.success::text || '|' ||
               coalesce(new.ip,'') || '|' || coalesce(new.user_agent,'') || '|' ||
               coalesce(new.details::text,'') || '|' || new.created_at::text;

  -- 计算 sha256
  new.hash := encode(digest(v_payload, 'sha256'), 'hex');
  return new;
end;
$$ language plpgsql security definer;

-- 触发器：插入前计算哈希
create trigger trg_audit_logs_hash
before insert on public.audit_logs
for each row execute function public.compute_audit_hash();

-- 禁止 UPDATE/DELETE（额外保险，RLS也不放行）
create or replace function public.prevent_audit_change()
returns trigger as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$ language plpgsql;

create trigger trg_audit_logs_no_update
before update on public.audit_logs
for each row execute function public.prevent_audit_change();

create trigger trg_audit_logs_no_delete
before delete on public.audit_logs
for each row execute function public.prevent_audit_change();

-- 启用 RLS
alter table public.audit_logs enable row level security;

-- RLS 策略：普通用户仅可读取与自己相关的日志（或 user_id 为空但与其 IP/UA 不关联；为简化，这里仅限 user_id）
create policy if not exists audit_logs_select_self
on public.audit_logs
for select
using (auth.uid() is not null and user_id = auth.uid());

-- 管理员可读取全部（依赖 is_admin()，在后续迁移创建）
create policy if not exists audit_logs_select_admin
on public.audit_logs
for select to authenticated
using (public.is_admin());

-- 不创建 INSERT/UPDATE/DELETE 策略：仅 service role 可插入，其他角色不可更改。

