-- is_admin() 
create or replace function public.is_admin()
returns boolean as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$ language sql stable security definer;

