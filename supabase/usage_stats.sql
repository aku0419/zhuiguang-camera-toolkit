-- 逐光｜使用統計
-- 整份貼到 Supabase → SQL Editor → Run。可以重複執行，不會弄壞已經記下的資料。
-- 要先執行過 site_admins.sql。
--
-- 記錄兩種東西，而且兩者分開存，無法對應「誰看了哪一頁」：
--   1. usage_daily：某一天有哪些帳號來過（只記「來過」，用來算每天活躍人數）
--   2. usage_pages：某一天某個頁面被打開幾次（只記次數，不記是誰）
-- 兩個資料表都完全不開放；登入者只能呼叫 log_visit() 記一筆，只有管理者能呼叫 admin_stats() 看結果。
-- 日期以台灣時間（UTC+8）計算。

create table if not exists public.usage_daily (
  day date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (day, user_id)
);
create table if not exists public.usage_pages (
  day date not null,
  page text not null check (char_length(page) <= 80),
  views int not null default 0,
  primary key (day, page)
);
alter table public.usage_daily enable row level security;
alter table public.usage_pages enable row level security;
revoke all on public.usage_daily from public, anon, authenticated;
revoke all on public.usage_pages from public, anon, authenticated;

-- 登入後每打開一頁就呼叫一次
create or replace function public.log_visit(p_page text)
returns void
language plpgsql volatile security definer set search_path = public as $$
declare
  d date := (now() at time zone 'Asia/Taipei')::date;
  pg text := lower(trim(coalesce(p_page, '')));
begin
  if auth.uid() is null then return; end if;
  insert into public.usage_daily (day, user_id) values (d, auth.uid()) on conflict do nothing;
  -- 頁面路徑只收「/」開頭、英數與 - _ / 的簡單路徑，其他一律不記
  if pg !~ '^/[a-z0-9/_-]{0,78}$' then return; end if;
  -- 一天最多記 500 種頁面，避免被亂填灌爆
  if not exists (select 1 from public.usage_pages where day = d and page = pg)
     and (select count(*) from public.usage_pages where day = d) >= 500 then
    return;
  end if;
  insert into public.usage_pages (day, page, views) values (d, pg, 1)
    on conflict (day, page) do update set views = public.usage_pages.views + 1;
end;
$$;

-- 管理頁的統計數字（只有管理者能呼叫）
create or replace function public.admin_stats()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  d date := (now() at time zone 'Asia/Taipei')::date;
  res jsonb;
begin
  if not public.is_site_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'users_total', (select count(*) from auth.users),
    'users_today', (select count(*) from auth.users where (created_at at time zone 'Asia/Taipei')::date = d),
    'users_7d', (select count(*) from auth.users where (created_at at time zone 'Asia/Taipei')::date > d - 7),
    'active_today', (select count(*) from public.usage_daily where day = d),
    'active_7d', (select count(distinct user_id) from public.usage_daily where day > d - 7),
    'views_today', (select coalesce(sum(views), 0) from public.usage_pages where day = d),
    'views_7d', (select coalesce(sum(views), 0) from public.usage_pages where day > d - 7),
    'daily', (
      select jsonb_agg(jsonb_build_object('d', to_char(g, 'YYYY-MM-DD'), 'n',
               (select count(*) from public.usage_daily u where u.day = g)) order by g)
      from generate_series(d - 13, d, interval '1 day') as t(g0), lateral (select g0::date as g) x
    ),
    'top_pages', (
      select coalesce(jsonb_agg(jsonb_build_object('page', page, 'views', v) order by v desc, page), '[]'::jsonb)
      from (select page, sum(views)::int as v from public.usage_pages where day > d - 7
            group by page order by sum(views) desc, page limit 12) t
    )
  ) into res;
  return res;
end;
$$;

revoke all on function public.log_visit(text) from public, anon;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.log_visit(text) to authenticated;
grant execute on function public.admin_stats() to authenticated;
