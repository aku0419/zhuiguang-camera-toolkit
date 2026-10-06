// 讀取並檢查 src/data/cameras/*.json。格式不對時建置會直接失敗，錯的資料不會上線。
import { cropFactorFromSize } from "./calc.js";

const U = "Unknown";
const files = import.meta.glob("../data/cameras/*.json", { eager: true, import: "default" });
// 只有在本機預覽版面時（ZG_SAMPLE=1）才會載入範例資料，正式網站不會出現
const samples = process.env.ZG_SAMPLE === "1"
  ? import.meta.glob("../../tests/fixtures/cameras/*.json", { eager: true, import: "default" })
  : {};

const isNum = (v) => typeof v === "number" && isFinite(v);
const isNumOrU = (v) => isNum(v) || v === U;
const isStr = (v) => typeof v === "string" && v.trim() !== "";
const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isUrl = (v) => typeof v === "string" && /^https:\/\//.test(v);

function check(file, c) {
  const errs = [];
  const need = (ok, field) => { if (!ok) errs.push(field); };
  need(isStr(c.slug) && /^[a-z0-9-]+$/.test(c.slug), "slug（只能用小寫英文、數字、-）");
  need(file.endsWith(`/${c.slug}.json`), "檔名要跟 slug 一樣");
  need(isStr(c.brand), "brand");
  need(isStr(c.model), "model");
  need(isStr(c.type), "type");
  need(c.sensor && isStr(c.sensor.format), "sensor.format");
  need(c.sensor && isNumOrU(c.sensor.width_mm) && isNumOrU(c.sensor.height_mm), "sensor.width_mm / height_mm（數字或 Unknown）");
  need(c.sensor && isNumOrU(c.sensor.resolution_mp), "sensor.resolution_mp（數字或 Unknown）");
  need(c.base_iso === U || (Array.isArray(c.base_iso) && c.base_iso.length > 0 && c.base_iso.every(isNum)), "base_iso（數字陣列或 Unknown）");
  need(c.log === U || (Array.isArray(c.log) && c.log.every(isStr)), "log（文字陣列或 Unknown）");
  for (const f of ["raw", "lens_mount", "timecode", "sdi", "hdmi", "dynamic_range_claimed"]) need(isStr(c[f]), f);
  need(c.open_gate === true || c.open_gate === false || c.open_gate === U, "open_gate（true / false / Unknown）");
  need(c.media === U || (Array.isArray(c.media) && c.media.every(isStr)), "media");
  need(Array.isArray(c.recording_modes) && c.recording_modes.length > 0, "recording_modes（至少一列）");
  (c.recording_modes || []).forEach((m, i) => {
    const p = `recording_modes[${i}].`;
    need(isStr(m.resolution), p + "resolution");
    need(isNumOrU(m.max_fps), p + "max_fps");
    need(isStr(m.codec), p + "codec");
    need(isNumOrU(m.bitrate_mbps), p + "bitrate_mbps");
    need(isNumOrU(m.bit_depth), p + "bit_depth");
    need(isStr(m.chroma), p + "chroma");
    need(["none", "crop", U].includes(m.crop), p + "crop（none / crop / Unknown）");
    need(m.crop_factor == null || isNum(m.crop_factor), p + "crop_factor");
  });
  need(isStr(c.source_name), "source_name");
  need(isUrl(c.source_url), "source_url（https 網址）");
  need(isDate(c.last_verified), "last_verified（YYYY-MM-DD）");
  need(c.extra_sources == null || (Array.isArray(c.extra_sources) && c.extra_sources.every((s) => isStr(s.source_name) && isUrl(s.source_url))), "extra_sources");
  if (errs.length) throw new Error(`相機資料格式錯誤：${file}\n  - ${errs.join("\n  - ")}`);
}

function pixels(res) {
  const m = /^(\d+)\s*x\s*(\d+)/.exec(res);
  return m ? Number(m[1]) * Number(m[2]) : 0;
}

// 篩選用的片幅分類（原廠名稱五花八門，列表頁統一成四類）
export function formatGroup(f) {
  if (/M43|Four Thirds/i.test(f)) return "M43";
  if (/Super ?35|APS-C/i.test(f)) return "Super35／APS-C";
  if (/^Full Frame/i.test(f)) return "全片幅";
  return "大片幅（比全片幅大）";
}

function enrich(c, sample) {
  const known = c.recording_modes.filter((m) => isNum(m.max_fps));
  const top = [...c.recording_modes].sort((a, b) => pixels(b.resolution) - pixels(a.resolution))[0];
  const factor = isNum(c.sensor.width_mm) && isNum(c.sensor.height_mm)
    ? cropFactorFromSize(c.sensor.width_mm, c.sensor.height_mm) : null;
  return {
    ...c,
    sample,
    name: `${c.brand} ${c.model}`,
    format_group: formatGroup(c.sensor.format),
    max_resolution: isStr(c.max_resolution) ? c.max_resolution : top.resolution,
    max_fps: known.length ? Math.max(...known.map((m) => m.max_fps)) : U,
    crop_factor: factor,
  };
}

const all = [
  ...Object.entries(files).map(([f, c]) => { check(f, c); return enrich(c, false); }),
  ...Object.entries(samples).map(([f, c]) => { check(f, c); return enrich(c, true); }),
];
const seen = new Set();
for (const c of all) {
  if (seen.has(c.slug)) throw new Error(`相機資料重複：${c.slug}`);
  seen.add(c.slug);
}

export const BRAND_ORDER = ["Sony", "Canon", "Nikon", "Panasonic", "Fujifilm", "Blackmagic Design", "RED", "ARRI"];
export const cameras = all.sort((a, b) =>
  (BRAND_ORDER.indexOf(a.brand) + 1 || 99) - (BRAND_ORDER.indexOf(b.brand) + 1 || 99) ||
  a.model.localeCompare(b.model, "en", { numeric: true })
);

// 感光元件尺寸未知時，用片幅名稱對應到等效焦段工具的通用倍率
function formatId(f) {
  if (/^Full Frame/i.test(f)) return "ff";
  if (/^M43/i.test(f)) return "m43";
  if (/Super ?35/i.test(f)) return "s35";
  if (/APS-C/i.test(f)) return "apsc-sony";
  return null;
}

// 給工具頁用的精簡資料（帶入感光元件尺寸與錄影模式）
export const camerasForTools = cameras.map((c) => ({
  slug: c.slug,
  name: c.name,
  format: c.sensor.format,
  format_id: formatId(c.sensor.format),
  crop_factor: c.crop_factor,
  modes: c.recording_modes.map((m) => ({
    label: `${m.resolution} ${isNum(m.max_fps) ? m.max_fps + "p" : ""} ${m.codec} ${m.bit_depth === U ? "" : m.bit_depth + "-bit"} ${m.chroma === U ? "" : m.chroma}`.replace(/\s+/g, " ").trim(),
    fps: m.max_fps,
    mbps: m.bitrate_mbps,
    crop: m.crop,
    sq: /S&Q|僅慢動作/.test(m.notes || ""),
  })),
}));

export const show = (v, unit = "") => (v === U || v == null || v === "" ? "未知" : `${v}${unit}`);
