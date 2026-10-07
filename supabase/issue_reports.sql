-- 逐光｜問題回報
-- 整份貼到 Supabase → SQL Editor → Run。可以重複執行，不會弄壞已經收到的回報。
--
-- 設計重點：
--   1. 資料表完全不開放：訪客（anon）和登入者都不能直接讀、寫、改、刪。
--   2. 訪客只能呼叫 submit_issue_report() 這一個函式送出回報。
--   3. 函式會檢查長度，並限制次數，避免被灌爆：
--        - 內容 5～2000 字、聯絡方式最多 200 字、頁面網址最多 300 字
--        - 同一個來源 10 分鐘內最多 5 則（以來源 IP 的雜湊值判斷，不存 IP 本身）
--        - 全站一天最多 300 則
--        - 資料表總共最多 5000 則，滿了就暫停收件
--   4. 只有你（專案擁有者）能在 Supabase 後台的 Table Editor 看到回報。

create table if not exists public.issue_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('資料錯誤', '計算錯誤', '網站壞掉', '建議', '其他')),
  page text not null default '',
  message text not null check (char_length(message) between 5 and 2000),
  contact text not null default '' check (char_length(contact) <= 200),
  device text not null default '' check (char_length(device) <= 200),
  source_hash text not null default '',
  status text not null default '新回報' check (status in ('新回報', '處理中', '已修好', '不處理'))
);
create index if not exists issue_reports_created_idx on public.issue_reports (created_at desc);
create index if not exists issue_reports_source_idx on public.issue_reports (source_hash, created_at desc);

alter table public.issue_reports enable row level security;
-- 不建立任何 policy，並收回所有權限：訪客與登入者都碰不到資料表
revoke all on public.issue_reports from public, anon, authenticated;

create or replace function public.submit_issue_report(
  p_kind text,
  p_page text,
  p_message text,
  p_contact text default '',
  p_device text default ''
) returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  k text := coalesce(nullif(trim(p_kind), ''), '其他');
  m text := trim(coalesce(p_message, ''));
  c text := trim(coalesce(p_contact, ''));
  pg text := trim(coalesce(p_page, ''));
  d text := trim(coalesce(p_device, ''));
  ip text;
  h text := '';
begin
  -- 長度檢查（超過就拒絕，不偷偷截短，讓使用者知道）
  if char_length(m) < 5 then return 'too_short'; end if;
  if char_length(m) > 2000 or char_length(c) > 200 or char_length(pg) > 300 or char_length(d) > 200 then
    return 'too_long';
  end if;
  if k not in ('資料錯誤', '計算錯誤', '網站壞掉', '建議', '其他') then k := '其他'; end if;

  -- 來源：只存 IP 的雜湊值，不存 IP 本身
  begin
    ip := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  exception when others then
    ip := '';
  end;
  if trim(ip) <> '' then h := md5('zhuiguang|' || trim(ip)); end if;

  -- 總量上限
  if (select count(*) from public.issue_reports) >= 5000 then return 'closed'; end if;
  -- 全站一天上限
  if (select count(*) from public.issue_reports where created_at > now() - interval '1 day') >= 300 then
    return 'daily_limit';
  end if;
  -- 同一來源 10 分鐘內最多 5 則
  if h <> '' and (select count(*) from public.issue_reports where source_hash = h and created_at > now() - interval '10 minutes') >= 5 then
    return 'rate_limited';
  end if;

  insert into public.issue_reports (kind, page, message, contact, device, source_hash)
  values (k, pg, m, c, d, h);
  return 'ok';
end;
$$;

-- 只有這個函式開放給訪客呼叫
revoke all on function public.submit_issue_report(text, text, text, text, text) from public;
grant execute on function public.submit_issue_report(text, text, text, text, text) to anon, authenticated;
