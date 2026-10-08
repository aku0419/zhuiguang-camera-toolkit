// 即時線上人數（做法跟初光一樣）：每個分頁匿名加入同一個頻道，只有管理頁會讀出人數。
import { sb } from "./auth.js";
import { pageLabel, summarize } from "./online-summary.js";

let ch = null;
const cbs = [];

function channel(track) {
  if (ch || !sb) return ch;
  let key = "";
  try { key = crypto.randomUUID(); } catch (e) { key = Math.random().toString(36).slice(2) + Date.now().toString(36); }
  const c = sb.channel("zg-online", { config: { presence: { key } } });
  let on = false, hideT = 0;
  const go = () => { if (!on) { on = true; c.track({ p: pageLabel(location.pathname), at: Date.now() }).catch(() => {}); } };
  const stop = () => { if (on) { on = false; c.untrack().catch(() => {}); } };
  c.on("presence", { event: "sync" }, () => {
    const st = summarize(c.presenceState());
    cbs.forEach((f) => { try { f(st); } catch (e) {} });
  });
  c.subscribe((status) => {
    if (status !== "SUBSCRIBED" || !track) return;
    if (document.visibilityState !== "hidden") go();
  });
  if (track) document.addEventListener("visibilitychange", () => {
    clearTimeout(hideT);
    // 分頁切到背景超過 2 分鐘就不算在線上
    if (document.visibilityState === "hidden") hideT = setTimeout(stop, 120000); else go();
  });
  ch = c;
  return c;
}

// 登入後的每一頁呼叫一次（管理頁不算）
export function startTracking() {
  try { channel(true); } catch (e) {}
}

// 管理頁用：有人數變動就呼叫 cb
export function watchOnline(cb) {
  cbs.push(cb);
  const c = channel(false);
  if (c) { try { cb(summarize(c.presenceState())); } catch (e) {} }
}
