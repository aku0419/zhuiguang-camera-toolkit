import { lenses } from "../lib/lenses.js";
// 構圖取景工具用的精簡鏡頭清單（瀏覽器開頁時才下載）
const data = lenses.map((l) => ({
  s: l.slug, b: l.brand, r: l.series, m: l.model, t: l.type,
  f1: l.focal_min, f2: l.focal_max, a: l.max_aperture, at: l.aperture_type || "F",
  mt: l.mount, mm: l.mount_match || [l.mount], c: l.coverage,
  ic: typeof l.image_circle_mm === "number" ? l.image_circle_mm : null,
}));
export const GET = () => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
