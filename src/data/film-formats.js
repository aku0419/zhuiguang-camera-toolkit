// 底片片幅資料。來源：Kodak 官方資料
//   1. Film Format Choices（Kodak，2024）https://www.kodak.com/content/products-brochures/Film/Film-Format-Choices-Infographic.pdf
//   2. The Essential Reference Guide for Filmmakers（Kodak）https://www.kodak.com/content/products-brochures/Film/kodak-essential-reference-guide-for-filmmakers.pdf
// 「每呎格數」是用 Kodak 公布的運行時間換算（例如 35mm 4 孔 400 呎 × 24fps = 4 分 26 秒 → 每呎 16 格；3 孔是 64 ÷ 3 ≈ 21.3 格）；
// 35mm 每呎 16 格、有 64 個孔，Kodak 指南有直接寫。查不到的欄位寫 null，網頁顯示「未知」，不猜。
export const FILM_SOURCES = [
  { name: "Kodak：Film Format Choices（2024）", url: "https://www.kodak.com/content/products-brochures/Film/Film-Format-Choices-Infographic.pdf" },
  { name: "Kodak：The Essential Reference Guide for Filmmakers", url: "https://www.kodak.com/content/products-brochures/Film/kodak-essential-reference-guide-for-filmmakers.pdf" },
];
export const FILM_LAST_VERIFIED = "2026-10-12";

// framesPerFoot：每呎幾格；w、h：Kodak 標示的畫面（capture area）寬、高 mm；kodak：Kodak 資料裡的運行時間範例
export const FILM_FORMATS = [
  { id: "s8-regular", name: "Super 8（常規畫框）", gauge: "Super 8", perfs: "每格 1 孔", framesPerFoot: 72, w: 5.79, h: 4.01,
    aspectNote: "", rollFeet: 50, note: "卡匣式底片，一卷 50 呎。",
    kodak: { feet: 50, fps: 18, text: "50 呎 × 18fps ＝ 3 分 20 秒；× 24fps ＝ 2 分 30 秒" } },
  { id: "s8-extended", name: "Super 8（延伸畫框）", gauge: "Super 8", perfs: "每格 1 孔", framesPerFoot: 72, w: 6.30, h: 4.2,
    aspectNote: "", rollFeet: 50, note: "延伸畫框（Extended Gate）；每呎格數與常規畫框相同。",
    kodak: null },
  { id: "16mm", name: "16mm（標準）", gauge: "16mm", perfs: "每格 1 孔", framesPerFoot: 40, w: null, h: null,
    aspectNote: "1.33:1", rollFeet: 400, note: "Kodak 只說明標準 16mm 的畫面比例是 1.33:1，沒有公布畫面大小，所以大小標示未知。每呎 40 格與 Super 16 相同（同一種底片，只是畫面延伸到另一側的孔位）。",
    kodak: null },
  { id: "s16", name: "Super 16", gauge: "16mm", perfs: "每格 1 孔", framesPerFoot: 40, w: 12.42, h: 7.44,
    aspectNote: "1.66:1", rollFeet: 400, note: "要用單邊有孔的底片。Kodak 稱它是目前很多獨立電影、電視、廣告、MV、紀錄片常用的拍攝片幅。",
    kodak: { feet: 400, fps: 24, text: "400 呎 × 24fps ＝ 11 分 06 秒" } },
  { id: "35-2perf", name: "35mm 2 孔", gauge: "35mm", perfs: "每格 2 孔", framesPerFoot: 32, w: 24.90, h: 9.35,
    aspectNote: "", rollFeet: 400, note: "Kodak 寫這個格式的原生畫面比例是 2.35:1；底片用量與沖洗量比 4 孔少 50%，可拍的時間是 4 孔的兩倍。",
    kodak: { feet: 400, fps: 24, text: "400 呎 × 24fps ＝ 8 分 53 秒" } },
  { id: "35-3perf", name: "35mm 3 孔", gauge: "35mm", perfs: "每格 3 孔", framesPerFoot: 64 / 3, w: 24.90, h: 13.90,
    aspectNote: "", rollFeet: 400, note: "比 4 孔少用 25% 底片與沖洗，可拍的時間多 33%。",
    kodak: { feet: 400, fps: 24, text: "400 呎 × 24fps ＝ 5 分 55 秒" } },
  { id: "35-4perf", name: "35mm 4 孔", gauge: "35mm", perfs: "每格 4 孔", framesPerFoot: 16, w: 24.90, h: 18.70,
    aspectNote: "", rollFeet: 400, note: "最標準的 35mm 拍攝片幅；35mm 底片每呎有 64 個孔、16 格。",
    kodak: { feet: 400, fps: 24, text: "400 呎 × 24fps ＝ 4 分 26 秒" } },
  { id: "35-8perf", name: "35mm 8 孔（VistaVision）", gauge: "35mm", perfs: "每格 8 孔（橫向走片）", framesPerFoot: 8, w: 37.72, h: 24.92,
    aspectNote: "1.50:1", rollFeet: 400, note: "底片橫向通過攝影機。",
    kodak: { feet: 400, fps: 24, text: "400 呎 × 24fps ＝ 2 分 13 秒" } },
  { id: "65-5perf", name: "65mm 5 孔", gauge: "65mm", perfs: "每格 5 孔", framesPerFoot: 12.8, w: 52.15, h: 23.07,
    aspectNote: "2.20:1", rollFeet: 1000, note: "拍攝用 65mm 底片，放映用 70mm 底片。",
    kodak: { feet: 1000, fps: 24, text: "1,000 呎 × 24fps ＝ 8 分 53 秒" } },
  { id: "65-15perf", name: "65mm 15 孔（IMAX）", gauge: "65mm", perfs: "每格 15 孔（橫向走片）", framesPerFoot: 64 / 15, w: 70.41, h: 56.62,
    aspectNote: "", rollFeet: 1000, note: "IMAX 攝影機讓底片橫向通過，每格用 15 個孔的寬度。",
    kodak: { feet: 1000, fps: 24, text: "1,000 呎 × 24fps ＝ 2 分 57 秒" } },
];
