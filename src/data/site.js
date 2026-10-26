// 全站共用的文字與導覽
export const SITE_NAME = "逐光｜攝影工具組";
export const DISCLAIMER =
  "逐光資料整理自原廠公開資訊，實際錄影格式、記憶卡需求與相容性可能因韌體版本而異，重要拍攝前請以原廠最新文件為準。";

export const SECTIONS = [
  { id: "cameras", en: "Cameras", zh: "攝影機", href: "/cameras/", desc: "規格、錄影格式、記憶卡", ready: false },
  { id: "lenses", en: "Lenses", zh: "鏡頭", href: "/lenses/", desc: "接環、片幅涵蓋、焦段", ready: true },
  { id: "media", en: "Media", zh: "記憶卡", href: "/media/", desc: "SD、CFexpress 等格式與速度", ready: true },
  { id: "film", en: "Film", zh: "底片", href: "/film/", desc: "Kodak 底片型號、片幅、底片長度", ready: true },
  { id: "tools", en: "Tools", zh: "工具", href: "/tools/", desc: "快門、焦段、景深、ND、容量", ready: true },
];

// 攝影機資料庫有資料時才算「已上線」
export const sections = (camerasReady) =>
  SECTIONS.map((s) => (s.id === "cameras" ? { ...s, ready: camerasReady } : s));

// 首頁「遇到什麼問題」：用白話問題帶到對的工具
export const PROBLEMS = [
  { q: "畫面太暗／太亮，要怎麼調？", href: "/tools/exposure-stops/" },
  { q: "為什麼電影都拍 24 格？常見格率有哪些？", href: "/glossary/#why-24" },
  { q: "想拍慢動作，要設幾 fps？", href: "/tools/frame-rate/" },
  { q: "白天戶外，要加幾級 ND？", href: "/tools/exposure-guide/" },
  { q: "外景要幾點到？黃金時刻是什麼時候？", href: "/tools/sun-path/" },
  { q: "這顆鏡頭裝在我的相機上拍多寬？", href: "/tools/field-of-view/" },
  { q: "背景想要模糊，光圈要開多大？", href: "/tools/depth-of-field/" },
  { q: "記憶卡要買多大、多快？", href: "/tools/recording-capacity/?mode=card" },
  { q: "這次拍攝要準備幾張卡、多大硬碟？", href: "/tools/shoot-storage/" },
  { q: "拍底片要準備多少預算？", href: "/tools/film-cost/" },
  { q: "開拍前、收工後，該確認哪些事？", href: "/tools/camera-checklist/" },
];

export const TOOLS = [
  {
    id: "shutter-angle", href: "/tools/shutter-angle/", name: "快門角度",
    q: "24fps、180° 是幾分之一秒？", keywords: ["shutter angle", "快門", "180度", "1/48", "1/50"],
  },
  {
    id: "frame-rate", href: "/tools/frame-rate/", name: "升降格",
    q: "60fps 放到 24fps 是幾 %？", keywords: ["slow motion", "慢動作", "fps", "格率", "升格", "降格"],
  },
  {
    id: "focal-length", href: "/tools/focal-length/", name: "等效焦段",
    q: "APS-C 35mm 等於全片幅多少？", keywords: ["crop factor", "裁切係數", "APS-C", "Super35", "M43", "全片幅"],
  },
  {
    id: "recording-capacity", href: "/tools/recording-capacity/", name: "錄影容量",
    q: "200Mbps 拍三小時要多少 GB？", keywords: ["bitrate", "位元率", "Mbps", "容量", "GB", "TB"],
  },
  {
    id: "nd-filter", href: "/tools/nd-filter/", name: "ND 減光",
    q: "ND8 是幾級？快門要調多少？", keywords: ["ND", "減光鏡", "濾鏡", "ND8", "ND64", "ND1000", "stop"],
  },
  {
    id: "aspect-ratio", href: "/tools/aspect-ratio/", name: "畫面比例",
    q: "4K 裁成 2.39:1 剩多少像素？", keywords: ["aspect ratio", "比例", "16:9", "2.39", "1.85", "裁切", "黑邊"],
  },
  {
    id: "depth-of-field", href: "/tools/depth-of-field/", name: "景深",
    q: "50mm f/2.8 對焦 3 公尺，哪裡是清楚的？", keywords: ["DoF", "景深", "光圈", "過焦距離", "hyperfocal", "散景"],
  },
  {
    id: "exposure-stops", href: "/tools/exposure-stops/", name: "曝光級數",
    q: "f/4 改 f/2.8 差幾級？", keywords: ["stop", "EV", "曝光", "光圈", "快門", "ISO", "級數"],
  },
  {
    id: "field-of-view", href: "/tools/field-of-view/", name: "視角",
    q: "35mm 裝在這台相機上拍多寬？", keywords: ["FOV", "視角", "view angle", "水平視角", "廣角", "畫角"],
  },
  {
    id: "exposure-guide", href: "/tools/exposure-guide/", name: "戶外曝光速查",
    q: "大太陽下要幾級 ND？", keywords: ["sunny 16", "戶外", "曝光", "ND", "光圈", "天氣", "太陽"],
  },
  {
    id: "shoot-storage", href: "/tools/shoot-storage/", name: "拍攝日素材量規劃",
    q: "拍三天要準備幾張卡、幾 TB 硬碟？", keywords: ["備份", "硬碟", "素材", "DIT", "記憶卡", "數量", "規劃"],
  },
  {
    id: "color-temperature", href: "/tools/color-temperature/", name: "色溫換算",
    q: "5600K 換 3200K 要加什麼校正片？", keywords: ["色溫", "mired", "K", "Kelvin", "鎢絲燈", "日光", "校正片", "CTO", "CTB", "燈光"],
  },
  {
    id: "framing", href: "/tools/framing/", name: "構圖取景",
    q: "用手機看，這顆鏡頭拍出來有多大？", keywords: ["取景", "構圖", "取景框", "焦段", "手機", "相機", "framing", "viewfinder", "director viewfinder", "鏡頭選擇", "機位", "勘景"],
  },
  {
    id: "sun-path", href: "/tools/sun-path/", name: "太陽軌跡",
    q: "那天幾點日出日落？黃金時刻是什麼時候？", keywords: ["日出", "日落", "黃金時刻", "藍調時刻", "golden hour", "blue hour", "太陽", "方位", "GPS", "指南針", "sunrise", "sunset", "外景", "勘景"],
  },
  {
    id: "light-units", href: "/tools/light-units/", name: "照度換算",
    q: "1000 lux 是幾呎燭光、EV 多少？", keywords: ["lux", "勒克斯", "呎燭光", "foot-candle", "照度", "EV", "燈光"],
  },
  {
    id: "timecode", href: "/tools/timecode/", name: "時間碼計算",
    q: "兩段素材加起來多長？", keywords: ["timecode", "時間碼", "影格", "29.97", "DF", "遺漏格式", "剪接", "frame"],
  },
  {
    id: "depth-of-field-table", href: "/tools/depth-of-field-table/", name: "景深對照表（可列印）",
    q: "一張表看光圈與距離的清楚範圍", keywords: ["景深", "對照表", "列印", "DoF", "對焦", "焦點", "攝影助理"],
  },
  {
    id: "film-length", href: "/tools/film-length/", name: "底片長度",
    q: "400 呎底片 24fps 可以拍多久？", keywords: ["film", "底片", "呎", "feet", "35mm", "16mm", "Super 8", "Super 16", "底片長度", "運行時間"],
  },
  {
    id: "film-exposure", href: "/tools/film-exposure/", name: "底片曝光補償",
    q: "500T 在日光下要加什麼濾鏡？", keywords: ["底片", "film", "EI", "濾鏡", "85", "80A", "加曝", "減曝", "曝光補償", "VISION3", "感光度"],
  },
  {
    id: "film-cost", href: "/tools/film-cost/", name: "底片成本粗估",
    q: "拍 5 分鐘 16mm，底片沖洗掃描要準備多少？", keywords: ["底片", "film", "成本", "預算", "拍攝比", "沖洗", "掃描", "16mm", "35mm", "Super 8", "費用"],
  },
  {
    id: "camera-checklist", href: "/tools/camera-checklist/", name: "攝影助理檢查清單",
    q: "開拍前、收工後，該確認哪些事？", keywords: ["檢查清單", "checklist", "攝影助理", "開拍前", "收工", "備份", "器材清單", "攝影報告", "camera report", "電池", "記憶卡"],
  },
  {
    id: "card-time", href: "/tools/recording-capacity/?mode=card", name: "記憶卡可錄時間",
    q: "256GB 卡、400Mbps 可以錄多久？", keywords: ["記憶卡", "card", "可錄時間", "SD", "CFexpress"],
  },
];

// 工具分組（首頁與工具頁用）：color 是這組的代表色
export const TOOL_GROUPS = [
  { id: "exposure", name: "曝光與快門", icon: "aperture", color: "#d9480f",
    ids: ["shutter-angle", "frame-rate", "exposure-stops", "exposure-guide", "nd-filter", "light-units", "color-temperature"] },
  { id: "lens", name: "鏡頭與構圖", icon: "frame", color: "#1c7ed6",
    ids: ["framing", "focal-length", "field-of-view", "depth-of-field", "depth-of-field-table", "aspect-ratio"] },
  { id: "record", name: "錄影與記憶卡", icon: "card", color: "#2b8a3e",
    ids: ["recording-capacity", "card-time", "shoot-storage", "timecode"] },
  { id: "film", name: "底片", icon: "film", color: "#9c36b5",
    ids: ["film-length", "film-exposure", "film-cost"] },
  { id: "field", name: "現場與準備", icon: "sun", color: "#0c8599",
    ids: ["sun-path", "camera-checklist"] },
];
export const toolGroups = () =>
  TOOL_GROUPS.map((g) => ({ ...g, tools: g.ids.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean) }));
