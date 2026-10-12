// 讀取並檢查 src/data/film-stocks/*.json（底片型號資料）。格式不對時建置會失敗。
const files = import.meta.glob("../data/film-stocks/*.json", { eager: true, import: "default" });
const isStr = (v) => typeof v === "string" && v.trim() !== "";

function check(file, f) {
  const errs = [];
  const need = (ok, k) => { if (!ok) errs.push(k); };
  need(isStr(f.slug) && /^[a-z0-9-]+$/.test(f.slug), "slug");
  need(file.endsWith(`/${f.slug}.json`), "檔名要跟 slug 一樣");
  for (const k of ["brand", "name", "full_name", "kind", "light_balance", "process", "base", "reciprocity", "storage", "summary", "last_verified"]) need(isStr(f[k]), k);
  need(/^\d{4}-\d{2}-\d{2}$/.test(f.last_verified || ""), "last_verified 格式");
  need(Array.isArray(f.ei) && f.ei.length > 0 && f.ei.every((e) => isStr(e.label) && typeof e.ei === "number" && isStr(e.filter)), "ei");
  need(Array.isArray(f.filters) && f.filters.every((e) => isStr(e.source) && isStr(e.filter) && typeof e.ei === "number"), "filters");
  need(Array.isArray(f.formats) && f.formats.length > 0 && f.formats.every((e) => isStr(e.gauge) && Array.isArray(e.lengths_ft) && e.lengths_ft.every((n) => typeof n === "number")), "formats");
  need(Array.isArray(f.features) && f.features.every(isStr), "features");
  need(Array.isArray(f.notes) && f.notes.every(isStr), "notes");
  need(Array.isArray(f.sources) && f.sources.length > 0 && f.sources.every((s) => isStr(s.source_name) && /^https:\/\//.test(s.source_url || "")), "sources");
  if (errs.length) throw new Error(`底片資料格式錯誤：${file}\n  - ${errs.join("\n  - ")}`);
}

export const KIND_ORDER = ["彩色負片", "彩色正片（反轉片）", "黑白負片", "黑白正片（反轉片）"];
export const filmStocks = Object.entries(files)
  .map(([file, f]) => { check(file, f); return f; })
  .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || b.ei[0].ei - a.ei[0].ei);

// 規格編號文字：35mm 5219／16mm 與 Super 8 7219
export const specText = (f) => [f.spec_35 && `35mm、65mm：${f.spec_35}`, f.spec_16 && `16mm、Super 8：${f.spec_16}`].filter(Boolean).join("；");
