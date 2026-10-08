-- 逐光｜網站管理者
-- 整份貼到 Supabase → SQL Editor → Run。可以重複執行。
--
-- 只有被列在 site_admins 的帳號，才能看「管理頁」(/admin/) 的線上人數。
-- 注意：要先用這個 Gmail 登入過逐光一次，再執行這份 SQL，才找得到帳號。

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- 把網站負責人設為管理者
insert into public.site_admins (user_id)
  select id from auth.users where email = 'aku0419@gmail.com'
  on conflict do nothing;

alter table public.site_admins enable row level security;
-- 資料表本身完全不開放，只開放下面的函式
revoke all on public.site_admins from public, anon, authenticated;

create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.site_admins where user_id = auth.uid())
$$;
revoke all on function public.is_site_admin() from public, anon;
grant execute on function public.is_site_admin() to authenticated;
