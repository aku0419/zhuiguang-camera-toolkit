import { TOOLS, sections } from "../data/site.js";
import { cameras } from "./cameras.js";
import { lenses } from "./lenses.js";
import { GLOSSARY } from "../data/glossary.js";

// 搜尋清單：建置時整理好，搜尋在瀏覽器裡比對。之後加入相機、鏡頭等資料。
export const searchItems = [
  ...cameras.map((c) => ({
    title: c.name, type: "攝影機", href: `/cameras/${c.slug}/`,
    text: [c.brand, c.model, c.sensor.format, c.lens_mount, ...(c.aliases || [])].join(" "),
  })),
  ...lenses.map((l) => ({
    title: `${l.brand} ${l.model}`, type: "鏡頭", href: `/lenses/${l.slug}/`,
    text: [l.brand, l.series, l.model, l.model_code, l.mount, l.coverage].filter(Boolean).join(" "),
  })),
  ...GLOSSARY.map((g) => ({
    title: `${g.term}（名詞）`, type: "名詞", href: `/glossary/#${g.id}`,
    text: [g.term, g.en, g.text].join(" "),
  })),
  ...TOOLS.map((t) => ({ title: t.name, type: "工具", href: t.href, text: [t.name, t.q, ...t.keywords].join(" ") })),
  ...sections(cameras.length > 0).map((s) => ({
    title: s.zh + (s.ready ? "" : "（即將推出）"), type: "分類", href: s.href, text: [s.zh, s.en, s.desc].join(" "),
  })),
];
