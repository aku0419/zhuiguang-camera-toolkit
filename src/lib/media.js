// 讀取並檢查 src/data/media/*.json（記憶卡格式）。格式不對時建置會失敗。
import { cameras } from "./cameras.js";

const files = import.meta.glob("../data/media/*.json", { eager: true, import: "default" });
const isStr = (v) => typeof v === "string" && v.trim() !== "";

function check(file, m) {
  const errs = [];
  const need = (ok, f) => { if (!ok) errs.push(f); };
  need(isStr(m.slug) && /^[a-z0-9-]+$/.test(m.slug), "slug");
  need(file.endsWith(`/${m.slug}.json`), "檔名要跟 slug 一樣");
  for (const f of ["name", "group", "summary", "source_name"]) need(isStr(m[f]), f);
  need(/^https:\/\//.test(m.source_url || ""), "source_url");
  need(/^\d{4}-\d{2}-\d{2}$/.test(m.last_verified || ""), "last_verified");
  need(Array.isArray(m.rows) && m.rows.every((r) => Array.isArray(r) && r.length === 2 && r.every(isStr)), "rows（每列 [名稱, 內容]）");
  need(m.tips == null || (Array.isArray(m.tips) && m.tips.every(isStr)), "tips");
  need(Array.isArray(m.camera_match), "camera_match");
  if (errs.length) throw new Error(`記憶卡資料格式錯誤：${file}\n  - ${errs.join("\n  - ")}`);
}

// 這種卡有哪些相機會用到：用相機「記憶卡」欄的文字比對
export function camerasUsing(m) {
  const res = m.camera_match.map((p) => new RegExp(p));
  return cameras.filter((c) => Array.isArray(c.media) && c.media.some((x) => res.some((r) => r.test(x))));
}

const GROUPS = ["SD", "CFexpress", "CFast／XQD", "廠商專用媒體"];
export const media = Object.entries(files)
  .map(([f, m]) => { check(f, m); return m; })
  .sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || 0);

// 還在整理的格式（資料查證完才開頁）
export const mediaSoon = ["RED Media"];
