// 全站共用的文字與導覽
export const SITE_NAME = "逐光｜攝影工具組";
export const DISCLAIMER =
  "逐光資料整理自原廠公開資訊，實際錄影格式、記憶卡需求與相容性可能因韌體版本而異，重要拍攝前請以原廠最新文件為準。";

export const SECTIONS = [
  { id: "cameras", en: "Cameras", zh: "攝影機", href: "/cameras/", desc: "規格、錄影格式、記憶卡", ready: false },
  { id: "lenses", en: "Lenses", zh: "鏡頭", href: "/lenses/", desc: "卡口、片幅涵蓋、焦段", ready: true },
  { id: "media", en: "Media", zh: "記憶卡", href: "/media/", desc: "SD、CFexpress 等格式與速度", ready: true },
  { id: "film", en: "Film", zh: "底片", href: "/film/", desc: "Kodak 電影底片資料", ready: false },
  { id: "tools", en: "Tools", zh: "工具", href: "/tools/", desc: "快門、焦段、景深、ND、容量", ready: true },
];

// 攝影機資料庫有資料時才算「已上線」
export const sections = (camerasReady) =>
  SECTIONS.map((s) => (s.id === "cameras" ? { ...s, ready: camerasReady } : s));

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
    id: "card-time", href: "/tools/recording-capacity/?mode=card", name: "記憶卡可錄時間",
    q: "256GB 卡、400Mbps 可以錄多久？", keywords: ["記憶卡", "card", "可錄時間", "SD", "CFexpress"],
  },
];
