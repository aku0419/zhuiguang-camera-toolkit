-- 逐光｜問題回報管理（只有網站管理者能用）
-- 整份貼到 Supabase → SQL Editor → Run。可以重複執行，不會弄壞已經收到的回報。
-- 要先執行過 issue_reports.sql 和 site_admins.sql。
--
-- 設計：問題回報的資料表仍然完全不開放。管理者只能透過下面兩個函式讀取、修改狀態與備註，
-- 函式一開始就檢查是不是管理者（site_admins），不是就直接拒絕。

alter table public.issue_reports add column if not exists admin_note text not null default '';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'issue_reports_admin_note_len') then
    alter table public.issue_reports add constraint issue_reports_admin_note_len check (char_length(admin_note) <= 2000);
  end if;
end $$;

-- 列出回報（最新的在前面，最多 500 筆）
create or replace function public.admin_list_reports(p_limit int default 200)
returns table (
  id bigint, created_at timestamptz, kind text, page text, message text,
  contact text, device text, status text, admin_note text
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_site_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  return query
    select r.id, r.created_at, r.kind, r.page, r.message, r.contact, r.device, r.status, r.admin_note
    from public.issue_reports r
    order by r.created_at desc
    limit least(greatest(coalesce(p_limit, 200), 1), 500);
end;
$$;

-- 修改狀態和備註（沒有要改的欄位就傳 null）
create or replace function public.admin_update_report(p_id bigint, p_status text default null, p_note text default null)
returns text
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_site_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if p_status is not null and p_status not in ('新回報', '處理中', '已修好', '不處理') then return 'bad_status'; end if;
  if p_note is not null and char_length(p_note) > 2000 then return 'too_long'; end if;
  update public.issue_reports
     set status = coalesce(p_status, status),
         admin_note = coalesce(p_note, admin_note)
   where id = p_id;
  if not found then return 'not_found'; end if;
  return 'ok';
end;
$$;

revoke all on function public.admin_list_reports(int) from public, anon;
revoke all on function public.admin_update_report(bigint, text, text) from public, anon;
grant execute on function public.admin_list_reports(int) to authenticated;
grant execute on function public.admin_update_report(bigint, text, text) to authenticated;
