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
