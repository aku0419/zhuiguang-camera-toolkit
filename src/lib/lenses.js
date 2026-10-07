// 讀取並檢查 src/data/lenses/*.json（鏡頭）。格式不對時建置會失敗。
import { cameras } from "./cameras.js";

const U = "Unknown";
const files = import.meta.glob("../data/lenses/*.json", { eager: true, import: "default" });
const isStr = (v) => typeof v === "string" && v.trim() !== "";
const isNum = (v) => typeof v === "number" && isFinite(v);

function check(file, l) {
  const errs = [];
  const need = (ok, f) => { if (!ok) errs.push(f); };
  need(isStr(l.slug) && /^[a-z0-9-]+$/.test(l.slug), "slug");
  need(file.endsWith(`/${l.slug}.json`), "檔名要跟 slug 一樣");
  for (const f of ["brand", "series", "model", "mount", "source_name"]) need(isStr(l[f]), f);
  need(["prime", "zoom"].includes(l.type), "type（prime / zoom）");
  need(isNum(l.focal_min) && isNum(l.focal_max) && l.focal_min <= l.focal_max, "focal_min / focal_max");
  need(l.type === "zoom" ? l.focal_min < l.focal_max : l.focal_min === l.focal_max, "type 與焦段不一致");
  need(isNum(l.max_aperture), "max_aperture");
  need(l.aperture_type == null || ["F", "T"].includes(l.aperture_type), "aperture_type（F / T）");
  need(["Full Frame", "APS-C", "Super35", "Medium Format", "Large Format", "Micro Four Thirds", U].includes(l.coverage), "coverage");
  need(isStr(l.min_focus), "min_focus");
  need(l.mounts == null || (Array.isArray(l.mounts) && l.mounts.every(isStr)), "mounts");
  need(l.mount_match == null || (Array.isArray(l.mount_match) && l.mount_match.every(isStr)), "mount_match");
  need(l.filter_mm == null || isNum(l.filter_mm), "filter_mm");
  need(isNum(l.weight_g) || l.weight_g === U, "weight_g");
  need(/^https:\/\//.test(l.source_url || ""), "source_url");
  need(/^\d{4}-\d{2}-\d{2}$/.test(l.last_verified || ""), "last_verified");
  if (errs.length) throw new Error(`鏡頭資料格式錯誤：${file}\n  - ${errs.join("\n  - ")}`);
}

const all = Object.entries(files).map(([f, l]) => { check(f, l); return l; });
const seen = new Set();
for (const l of all) {
  if (seen.has(l.slug)) throw new Error(`鏡頭資料重複：${l.slug}`);
  seen.add(l.slug);
}

export const LENS_BRAND_ORDER = ["Sony", "Canon", "Nikon", "Sigma", "Tamron", "Viltrox", "Panasonic", "Fujifilm", "ARRI", "Cooke", "Zeiss"];
const kind = (l) => (l.type === "prime" ? 0 : 1);
export const lenses = all.sort((a, b) =>
  (LENS_BRAND_ORDER.indexOf(a.brand) + 1 || 99) - (LENS_BRAND_ORDER.indexOf(b.brand) + 1 || 99) ||
  kind(a) - kind(b) || a.focal_min - b.focal_min || a.max_aperture - b.max_aperture
);

export const MOUNT_ORDER = ["Sony E", "Canon RF", "Nikon Z", "L-Mount", "Fujifilm X", "Micro Four Thirds", "PL"];
export const mountsOf = (l) => l.mounts || [l.mount];

export const focalText = (l) => {
  const n = (v) => String(v);
  return l.type === "zoom" ? `${n(l.focal_min)}–${n(l.focal_max)}mm` : `${n(l.focal_min)}mm`;
};
export const apertureText = (l) => {
  const tele = l.max_aperture_tele ? `–${l.max_aperture_tele}` : "";
  return `${l.aperture_type || "F"}${l.max_aperture}${tele}`;
};
export const typeText = (l) => (l.type === "zoom" ? "變焦" : "定焦");

// 這支鏡頭能裝在哪些相機：用卡口名稱比對相機的「卡口」欄
export function camerasFor(l) {
  return cameras
    .filter((c) => typeof c.lens_mount === "string" && (l.mount_match || [l.mount]).some((m) => c.lens_mount.includes(m)))
    .map((c) => {
      let fit;
      if (l.coverage === "APS-C" && /全片幅|大片幅/.test(c.format_group)) {
        fit = "這是 APS-C 專用鏡頭，裝在較大片幅的機身會裁切成較小的畫面範圍";
      } else if (l.coverage === "Full Frame" && c.crop_factor && c.crop_factor > 1.15) {
        fit = `涵蓋全片幅；這台感光元件較小，視角約變窄 ${Math.round(c.crop_factor * 10) / 10} 倍（等效焦段 ${Math.round(l.focal_min * c.crop_factor * 10) / 10}${l.type === "zoom" ? `–${Math.round(l.focal_max * c.crop_factor * 10) / 10}` : ""}mm）`;
      } else if (l.coverage === "APS-C" && /Super35|APS-C/.test(c.format_group)) {
        fit = "APS-C 鏡頭，對應這台的感光元件";
      } else if (l.coverage === "Medium Format" && /大片幅/.test(c.format_group)) {
        fit = "中片幅鏡頭，對應這台的感光元件";
      } else if (l.coverage === "Micro Four Thirds" && c.format_group === "M43") {
        fit = "M43 鏡頭，對應這台的感光元件";
      } else if (l.coverage === "Full Frame" && /全片幅/.test(c.format_group)) {
        fit = "全片幅鏡頭，對應這台的感光元件";
      } else {
        fit = "";
      }
      return { c, fit };
    });
}
