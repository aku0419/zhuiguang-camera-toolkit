// 即時線上人數：把 Supabase Presence 的狀態整理成「總人數」與「各頁人數」。
// 每個分頁只送出頁面名稱，不送帳號、姓名。
const PAGES = [
  ["/cameras", "攝影機"], ["/lenses", "鏡頭"], ["/media", "記憶卡"], ["/film", "底片"],
  ["/tools", "工具"], ["/glossary", "名詞小辭典"], ["/about", "關於"], ["/login", "登入頁"],
];

export function pageLabel(pathname) {
  const p = String(pathname || "/").replace(/\/+$/, "") || "/";
  if (p === "/") return "首頁";
  const hit = PAGES.find(([prefix]) => p === prefix || p.startsWith(prefix + "/"));
  return hit ? hit[1] : "其他";
}

export function summarize(state) {
  const by = {};
  let n = 0;
  for (const key in state || {}) {
    const meta = state[key] && state[key][0];
    if (!meta) continue;
    n++;
    const label = meta.p || "其他";
    by[label] = (by[label] || 0) + 1;
  }
  return { n, by: Object.entries(by).sort((a, b) => b[1] - a[1]) };
}
