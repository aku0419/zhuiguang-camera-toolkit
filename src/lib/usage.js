// 使用統計：登入後每打開一頁，記「這個帳號今天來過」與「這一頁被打開一次」（分開存，不記誰看了哪一頁）。
// 資料庫還沒執行 usage_stats.sql 時，呼叫會失敗，直接略過，不影響使用。
import { sb } from "./auth.js";

export function logVisit() {
  if (!sb) return;
  try {
    sb.rpc("log_visit", { p_page: location.pathname }).then(() => {}, () => {});
  } catch (e) {}
}
