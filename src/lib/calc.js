// 逐光的計算式。網頁和自動測試共用這一份。

// 相機上常見的快門速度（1/3 級距），用來提示「最接近的設定」
export const STANDARD_SHUTTERS = [
  8, 10, 13, 15, 20, 25, 30, 40, 50, 60, 80, 100, 125, 160, 200, 250, 320, 400,
  500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000,
];

// 快門角度 → 快門速度（回傳分母，例如 48 代表 1/48 秒）
export function shutterFromAngle(fps, angle) {
  if (!(fps > 0) || !(angle > 0) || angle > 360) return null;
  const denominator = (fps * 360) / angle;
  const nearest = STANDARD_SHUTTERS.reduce((best, s) =>
    Math.abs(Math.log(s / denominator)) < Math.abs(Math.log(best / denominator)) ? s : best
  );
  return { seconds: 1 / denominator, denominator, nearest };
}

// 升降格：拍攝格率、時間軸格率
export function frameRate(shootFps, timelineFps) {
  if (!(shootFps > 0) || !(timelineFps > 0)) return null;
  return {
    speedPercent: (timelineFps / shootFps) * 100,
    factor: shootFps / timelineFps, // > 1 慢動作，< 1 快動作
  };
}

// 等效焦段的片幅選項。倍率以全片幅 36 × 24 mm 為準。
export const FORMATS = [
  { id: "ff", label: "Full Frame 全片幅", factor: 1 },
  { id: "s35", label: "Super35（通用約略值）", factor: 1.5, approx: true },
  { id: "apsc-sony", label: "APS-C（Sony、Nikon、Fujifilm）", factor: 1.5 },
  { id: "apsc-canon", label: "APS-C（Canon）", factor: 1.6 },
  { id: "m43", label: "M43（Micro Four Thirds）", factor: 2 },
  { id: "1in", label: "1 吋", factor: 2.7 },
];

export const FULL_FRAME_DIAGONAL = Math.hypot(36, 24); // 約 43.27 mm

// 用感光元件實際尺寸算換算倍率（從相機頁進來時使用）
export function cropFactorFromSize(widthMm, heightMm) {
  if (!(widthMm > 0) || !(heightMm > 0)) return null;
  return FULL_FRAME_DIAGONAL / Math.hypot(widthMm, heightMm);
}

export function equivalentFocal(focalMm, factor) {
  if (!(focalMm > 0) || !(factor > 0)) return null;
  return focalMm * factor;
}

// 錄影容量：1 GB = 1,000,000,000 位元組（跟記憶卡包裝標示相同）
// MB/s 是「每秒百萬位元組」，1 MB/s = 8 Mbps
export function toMbps(value, unit) {
  return unit === "MBps" ? value * 8 : value;
}

export function capacityGB(bitrateMbps, seconds) {
  if (!(bitrateMbps > 0) || !(seconds > 0)) return null;
  return (bitrateMbps * seconds) / 8 / 1000;
}

export function recordSeconds(cardGB, bitrateMbps) {
  if (!(cardGB > 0) || !(bitrateMbps > 0)) return null;
  return (cardGB * 1000 * 8) / bitrateMbps;
}

// 顯示用的小工具
export function fmt(n, digits = 1) {
  if (n == null || !isFinite(n)) return "—";
  const r = Number(n.toFixed(digits));
  return r.toLocaleString("zh-TW", { maximumFractionDigits: digits });
}

export function fmtDuration(seconds) {
  if (seconds == null || !isFinite(seconds)) return "—";
  const total = Math.floor(seconds / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} 分鐘`;
  return m === 0 ? `${h} 小時` : `${h} 小時 ${m} 分鐘`;
}

export function fmtSize(gb) {
  if (gb == null || !isFinite(gb)) return "—";
  if (gb >= 1000) return `${fmt(gb / 1000, 2)} TB`;
  return `${fmt(gb, gb < 10 ? 2 : 1)} GB`;
}

// 記憶卡速度：位元率（Mbps）換成需要的持續寫入速度（MB/s）。1 MB/s = 8 Mbps。
export function neededMBps(bitrateMbps) {
  return bitrateMbps > 0 ? bitrateMbps / 8 : null;
}

// SD 協會的影片速度等級（最低持續寫入速度，MB/s）
export const SD_VIDEO_CLASSES = [
  { name: "V6", mbps: 6 }, { name: "V10", mbps: 10 }, { name: "V30", mbps: 30 },
  { name: "V60", mbps: 60 }, { name: "V90", mbps: 90 },
];

// 這個位元率至少要哪一級的 SD 卡；超過 V90 回傳 null（SD 卡不夠）
export function sdVideoClass(bitrateMbps) {
  const need = neededMBps(bitrateMbps);
  if (need == null) return undefined;
  const hit = SD_VIDEO_CLASSES.find((c) => c.mbps >= need);
  return hit ? hit.name : null;
}

// ---- ND 減光 ----
// 每 1 級（stop）光量減半；ND 濃度每級約 0.3
export function ndInfo(stops) {
  if (!isFinite(stops) || stops < 0) return null;
  return { stops, factor: 2 ** stops, density: stops * 0.3 };
}

// 快門字串轉秒數：接受 "1/48"、"0.5"、"2"
export function parseShutter(text) {
  const t = String(text).trim().replace(/秒$/, "").replace(/"$/, "");
  const m = t.match(/^1\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (m) return 1 / Number(m[1]);
  const v = Number(t);
  return v > 0 && isFinite(v) ? v : null;
}

export function fmtShutter(seconds) {
  if (!(seconds > 0) || !isFinite(seconds)) return "—";
  if (seconds < 0.5) return `1/${Math.round(1 / seconds)} 秒`;
  return `${Number(seconds.toFixed(seconds < 10 ? 1 : 0))} 秒`;
}

// ---- 畫面比例 ----
export function gcd(a, b) { return b ? gcd(b, a % b) : a; }

// 寬高 → 比例。回傳小數比（寬 ÷ 高）與簡化後的比例文字
export function aspectOf(w, h) {
  if (!(w > 0) || !(h > 0)) return null;
  const ratio = w / h;
  const wi = Math.round(w), hi = Math.round(h);
  const g = gcd(wi, hi);
  return { ratio, simple: Number.isInteger(w) && Number.isInteger(h) && g > 0 ? `${wi / g}:${hi / g}` : null };
}

// 把來源畫面裁成目標比例（寬 ÷ 高），盡量保留最多畫面
export function cropToRatio(w, h, target) {
  if (!(w > 0) || !(h > 0) || !(target > 0)) return null;
  const src = w / h;
  if (target >= src) return { w, h: h * (src / target), bars: "上下黑邊" };
  return { w: w * (target / src), h, bars: "左右黑邊" };
}

// ---- 景深 ----
// 容許彌散圓：全片幅對角線 ÷ 1500，約 0.029 mm；其他片幅依換算倍率縮小
export function cocMm(cropFactor) {
  return FULL_FRAME_DIAGONAL / 1500 / cropFactor;
}

// focalMm 鏡頭實際焦段、n 光圈值、distM 對焦距離（公尺）。回傳公尺
export function depthOfField(focalMm, n, distM, cropFactor) {
  if (!(focalMm > 0) || !(n > 0) || !(distM > 0) || !(cropFactor > 0)) return null;
  const f = focalMm, s = distM * 1000, c = cocMm(cropFactor);
  const H = (f * f) / (n * c) + f;
  const near = (s * (H - f)) / (H + s - 2 * f);
  const far = s < H ? (s * (H - f)) / (H - s) : Infinity;
  return { hyperfocal: H / 1000, near: near / 1000, far: far / 1000, total: (far - near) / 1000, coc: c };
}

// ---- 曝光級數 ----
// 兩組曝光（光圈、快門秒數、ISO）相差幾級。正值＝B 比 A 亮
export function exposureValue(n, seconds, iso) {
  if (!(n > 0) || !(seconds > 0) || !(iso > 0)) return null;
  return Math.log2((n * n) / seconds) - Math.log2(iso / 100);
}
export function stopsBetween(a, b) {
  const ea = exposureValue(a.n, a.t, a.iso), eb = exposureValue(b.n, b.t, b.iso);
  if (ea == null || eb == null) return null;
  return ea - eb; // EV 越低＝進光越多＝越亮
}

// ---- 視角（FOV）----
// 感光元件寬高（mm）與焦段 → 水平、垂直、對角視角（度）
export function fieldOfView(focalMm, widthMm, heightMm) {
  if (!(focalMm > 0) || !(widthMm > 0) || !(heightMm > 0)) return null;
  const deg = (d) => (2 * Math.atan(d / (2 * focalMm)) * 180) / Math.PI;
  return { h: deg(widthMm), v: deg(heightMm), d: deg(Math.hypot(widthMm, heightMm)) };
}

// ---- 戶外曝光（Sunny 16 經驗法則）----
// 以 ISO 100、快門 1/100 為基準的光圈值
export const SUNNY_SCENES = [
  { id: "snow", label: "雪地或白沙灘（強烈反光）", n: 22 },
  { id: "sunny", label: "晴天，影子清楚", n: 16 },
  { id: "slight", label: "薄雲，影子較淡", n: 11 },
  { id: "overcast", label: "陰天，沒有影子", n: 8 },
  { id: "heavy", label: "厚雲或大陰天", n: 5.6 },
  { id: "shade", label: "開放式陰影、日落", n: 4 },
];

// 換成指定 ISO、快門（秒）後，剛好曝光的光圈值
export function sunnyAperture(baseN, iso, seconds) {
  if (!(baseN > 0) || !(iso > 0) || !(seconds > 0)) return null;
  return baseN * Math.sqrt(seconds * iso);
}

// 想用光圈 n 時，需要幾級 ND（負值＝光圈還可以再縮小）
export function ndStopsNeeded(baseN, iso, seconds, n) {
  const ok = sunnyAperture(baseN, iso, seconds);
  if (ok == null || !(n > 0)) return null;
  return 2 * Math.log2(ok / n);
}

// ---- 拍攝日素材量 ----
// 回傳一天的素材量、全部備份總量、需要幾張卡
export function shootStorage({ mbps, hoursPerDay, days, copies, cardGB, usable = 0.9 }) {
  if (!(mbps > 0) || !(hoursPerDay > 0) || !(days > 0) || !(copies >= 1) || !(cardGB > 0)) return null;
  const dayGB = capacityGB(mbps, hoursPerDay * 3600);
  const totalGB = dayGB * days;
  return {
    dayGB, totalGB,
    allCopiesGB: totalGB * copies,
    cardsPerDay: Math.ceil(dayGB / (cardGB * usable)),
  };
}

// ---- 拍攝範圍：某個距離拍得到多寬、多高 ----
export function frameSizeAt(fovDeg, distM) {
  if (!(fovDeg > 0) || !(distM > 0)) return null;
  return 2 * distM * Math.tan((fovDeg * Math.PI) / 360);
}

// ---- 變形鏡頭：解壓縮後的畫面比例（寬 ÷ 高）----
export function desqueezedRatio(w, h, squeeze) {
  if (!(w > 0) || !(h > 0) || !(squeeze > 0)) return null;
  return (w / h) * squeeze;
}

// ---- 色溫 ----
export function mired(kelvin) {
  return kelvin > 0 ? 1e6 / kelvin : null;
}
// 從色溫 a 換成色溫 b 需要的 mired 位移。正值＝要偏暖（加暖色片），負值＝要偏冷
export function miredShift(a, b) {
  const x = mired(a), y = mired(b);
  return x == null || y == null ? null : y - x;
}

// ---- 照度 ----
export const LUX_PER_FC = 10.7639;
export const luxToFc = (lux) => lux / LUX_PER_FC;
export const fcToLux = (fc) => fc * LUX_PER_FC;
// 入射式測光常用換算：EV（ISO 100）＝ log2（lux ÷ 2.5）
export const luxToEV = (lux) => (lux > 0 ? Math.log2(lux / 2.5) : null);
export const evToLux = (ev) => 2.5 * 2 ** ev;

// ---- 時間碼 ----
// 格率選項：nominal 是時間碼每秒的格數，drop 代表遺漏格式（只用在 29.97、59.94）
export const TC_RATES = [
  { id: "23.976", label: "23.976", nominal: 24, drop: false, fps: 24000 / 1001 },
  { id: "24", label: "24", nominal: 24, drop: false, fps: 24 },
  { id: "25", label: "25", nominal: 25, drop: false, fps: 25 },
  { id: "29.97df", label: "29.97 遺漏格式（DF）", nominal: 30, drop: true, fps: 30000 / 1001 },
  { id: "29.97", label: "29.97 非遺漏格式（NDF）", nominal: 30, drop: false, fps: 30000 / 1001 },
  { id: "30", label: "30", nominal: 30, drop: false, fps: 30 },
  { id: "50", label: "50", nominal: 50, drop: false, fps: 50 },
  { id: "59.94df", label: "59.94 遺漏格式（DF）", nominal: 60, drop: true, fps: 60000 / 1001 },
  { id: "59.94", label: "59.94 非遺漏格式（NDF）", nominal: 60, drop: false, fps: 60000 / 1001 },
  { id: "60", label: "60", nominal: 60, drop: false, fps: 60 },
];

// "01:02:03:04"（遺漏格式可用 ; ）→ 總格數；格式不對回傳 null
export function tcToFrames(text, rate) {
  const m = String(text).trim().match(/^(\d+)[:;](\d+)[:;](\d+)[:;.](\d+)$/);
  if (!m) return null;
  const [h, mi, s, f] = m.slice(1).map(Number);
  if (mi > 59 || s > 59 || f >= rate.nominal) return null;
  let n = (h * 3600 + mi * 60 + s) * rate.nominal + f;
  if (rate.drop) {
    const d = rate.nominal / 15; // 29.97 每分鐘遺漏 2 格，59.94 遺漏 4 格
    const totalMin = h * 60 + mi;
    if (s === 0 && f < d && mi % 10 !== 0) return null; // 這些時間碼在遺漏格式不存在
    n -= d * (totalMin - Math.floor(totalMin / 10));
  }
  return n;
}

export function framesToTc(frames, rate) {
  if (!(frames >= 0)) return null;
  let n = Math.round(frames);
  const nom = rate.nominal;
  if (rate.drop) {
    const d = nom / 15;
    const per10 = nom * 600 - d * 9;
    const perMin = nom * 60 - d;
    const blocks = Math.floor(n / per10);
    const rest = n % per10;
    n += d * 9 * blocks + (rest < d ? 0 : d * Math.floor((rest - d) / perMin));
  }
  const f = n % nom;
  const s = Math.floor(n / nom) % 60;
  const mi = Math.floor(n / (nom * 60)) % 60;
  const h = Math.floor(n / (nom * 3600));
  const p = (x) => String(x).padStart(2, "0");
  return `${p(h)}:${p(mi)}:${p(s)}${rate.drop ? ";" : ":"}${p(f)}`;
}
