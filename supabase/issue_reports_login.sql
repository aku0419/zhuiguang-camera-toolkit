-- 逐光｜問題回報改成「要登入才能送」，並讓管理者可以回覆
-- 整份貼到 Supabase → SQL Editor → Run。可以重複執行，不會弄壞已經收到的回報。
-- 要先執行過 issue_reports.sql、site_admins.sql、admin_reports.sql。
--
-- 改了什麼：
--   1. 送出回報要登入（沒登入的訪客不能再呼叫 submit_issue_report）。
--   2. 回報會記下送出者的帳號與 Email，管理者才能回覆對方。
--   3. 新增「管理者回覆」欄位：回覆會顯示在送出者自己的「我的回報」裡。
--   4. 次數限制改成「每個帳號 10 分鐘內最多 5 則」（不再記來源 IP 的雜湊）。
--   5. 資料表仍然完全不開放。使用者只能：送出回報（submit_issue_report）、看自己的回報（my_reports）。

alter table public.issue_reports add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.issue_reports add column if not exists email text not null default '';
alter table public.issue_reports add column if not exists reply text not null default '';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'issue_reports_reply_len') then
    alter table public.issue_reports add constraint issue_reports_reply_len check (char_length(reply) <= 2000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'issue_reports_email_len') then
    alter table public.issue_reports add constraint issue_reports_email_len check (char_length(email) <= 320);
  end if;
end $$;
create index if not exists issue_reports_user_idx on public.issue_reports (user_id, created_at desc);

-- 送出回報（要登入）
create or replace function public.submit_issue_report(
  p_kind text,
  p_page text,
  p_message text,
  p_contact text default '',
  p_device text default ''
) returns text
language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  k text := coalesce(nullif(trim(p_kind), ''), '其他');
  m text := trim(coalesce(p_message, ''));
  c text := trim(coalesce(p_contact, ''));
  pg text := trim(coalesce(p_page, ''));
  d text := trim(coalesce(p_device, ''));
  mail text := '';
begin
  if uid is null then return 'login_required'; end if;
  if char_length(m) < 5 then return 'too_short'; end if;
  if char_length(m) > 2000 or char_length(c) > 200 or char_length(pg) > 300 or char_length(d) > 200 then
    return 'too_long';
  end if;
  if k not in ('資料錯誤', '計算錯誤', '網站壞掉', '建議', '其他') then k := '其他'; end if;
  select coalesce(u.email, '') into mail from auth.users u where u.id = uid;

  if (select count(*) from public.issue_reports) >= 5000 then return 'closed'; end if;
  if (select count(*) from public.issue_reports where created_at > now() - interval '1 day') >= 300 then
    return 'daily_limit';
  end if;
  if (select count(*) from public.issue_reports where user_id = uid and created_at > now() - interval '10 minutes') >= 5 then
    return 'rate_limited';
  end if;

  insert into public.issue_reports (kind, page, message, contact, device, source_hash, user_id, email)
  values (k, pg, m, c, d, '', uid, left(mail, 320));
  return 'ok';
end;
$$;

-- 看自己送出過的回報（含管理者的回覆）
create or replace function public.my_reports()
returns table (id bigint, created_at timestamptz, kind text, page text, message text, status text, reply text)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  return query
    select r.id, r.created_at, r.kind, r.page, r.message, r.status, r.reply
    from public.issue_reports r
    where r.user_id = auth.uid()
    order by r.created_at desc
    limit 50;
end;
$$;

-- 管理者：列出回報（多了送出者 Email 與回覆）
drop function if exists public.admin_list_reports(int);
create or replace function public.admin_list_reports(p_limit int default 200)
returns table (
  id bigint, created_at timestamptz, kind text, page text, message text,
  contact text, device text, status text, admin_note text, email text, reply text
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_site_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  return query
    select r.id, r.created_at, r.kind, r.page, r.message, r.contact, r.device, r.status, r.admin_note, r.email, r.reply
    from public.issue_reports r
    order by r.created_at desc
    limit least(greatest(coalesce(p_limit, 200), 1), 500);
end;
$$;

-- 管理者：修改狀態、備註（只有管理者看得到）、回覆（送出者看得到）。沒有要改的欄位就傳 null
drop function if exists public.admin_update_report(bigint, text, text);
drop function if exists public.admin_update_report(bigint, text, text, text);
create or replace function public.admin_update_report(
  p_id bigint, p_status text default null, p_note text default null, p_reply text default null
) returns text
language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_site_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if p_status is not null and p_status not in ('新回報', '處理中', '已修好', '不處理') then return 'bad_status'; end if;
  if (p_note is not null and char_length(p_note) > 2000) or (p_reply is not null and char_length(p_reply) > 2000) then
    return 'too_long';
  end if;
  update public.issue_reports
     set status = coalesce(p_status, status),
         admin_note = coalesce(p_note, admin_note),
         reply = coalesce(p_reply, reply)
   where id = p_id;
  if not found then return 'not_found'; end if;
  return 'ok';
end;
$$;

revoke all on function public.submit_issue_report(text, text, text, text, text) from public, anon;
revoke all on function public.my_reports() from public, anon;
revoke all on function public.admin_list_reports(int) from public, anon;
revoke all on function public.admin_update_report(bigint, text, text, text) from public, anon;
grant execute on function public.submit_issue_report(text, text, text, text, text) to authenticated;
grant execute on function public.my_reports() to authenticated;
grant execute on function public.admin_list_reports(int) to authenticated;
grant execute on function public.admin_update_report(bigint, text, text, text) to authenticated;
