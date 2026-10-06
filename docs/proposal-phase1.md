# 逐光 第一階段提案（待負責人確認）

狀態：**草案第 2 版**（已對照計畫書 `docs/plan.md` 第十八點），負責人確認前不開始寫程式。

---

## 1. 計畫分析（重點摘要）

- 核心目標只有一個：**學生第一次進來，30 秒內解決一個攝影問題**（計畫書第十七點）。所以第一版的重點是**工具好用、相機頁清楚**，資料量不是重點。
- 計畫書和上一個對話的決定有幾處不同，我的處理方式：

| 項目 | 計畫書 | 上一個對話的決定 | 提案 |
|---|---|---|---|
| 第一階段相機數 | 約 10 台測試資料 | 20 台 | **先做 10 台確認版面，再補到 20 台**（同一階段內分兩批） |
| 問題回報 | 第一版可先不接 Supabase | 第一階段要做 | **放在第一階段最後一步**；網站本身完全不依賴它 |
| 網站框架 | 可參考初光 | Astro | **Astro**（理由見第 3 點） |
| 品牌 | 含 Fujifilm、DJI | 20 台清單沒有這兩家 | 請你決定（見第 8 點） |
| 錄影容量／記憶卡時間 | 兩個工具 | 同一個工具可切換 | **同一頁、上方切換**；工具列表上仍列成兩個入口，學生一樣找得到 |

## 2. 第一版 MVP

做：

1. 首頁：五個入口（CAMERAS／LENSES／MEDIA／FILM／TOOLS）＋全站搜尋。LENSES、MEDIA、FILM 顯示「即將推出」。
2. 上方導覽列（手機版收成選單）。
3. 攝影機列表（可依品牌、片幅篩選）＋每台一頁。
4. 工具首頁＋5 個工具（快門角度、升降格、等效焦段、錄影容量、記憶卡可錄時間）。
5. 相機頁的捷徑按鈕：「用這台算錄影容量」「算等效焦段」「算升降格」，自動帶入這台資料。
6. 頁尾免責說明（用計畫書第十六點的文字）。
7. 回報問題按鈕（不用登入）。

不做：登入、收藏、比較、任何後台管理介面。

## 3. 技術架構

```
使用者的瀏覽器
   ├─ 看網頁、用計算工具 ──► Vercel（Astro 預先做好的靜態網頁）
   │                         計算在瀏覽器裡完成
   └─ 按「回報問題」送出 ──► 逐光自己的 Supabase（只能呼叫一個有限制的函式）
```

- **為什麼用 Astro 而不是跟初光一樣直接寫 HTML**：初光是一頁一頁手寫的 HTML。逐光有「每台相機一頁」的需求，20 台、之後 50 台，手寫會很難維護。Astro 只是「把資料檔自動做成網頁」的工具，做出來的仍然是純 HTML，不需要伺服器、不需要 React 這類大型框架。這是最簡單又夠用的方案（B 方案）。
- 互動部分（計算器、搜尋、回報視窗）用一般 JavaScript 寫，跟初光一樣。
- 資料放在 repo 裡的 JSON 檔（計畫書第九點），不放資料庫。
- 搜尋：建置時產生一份小清單，在瀏覽器裡比對關鍵字，不用外部服務。
- SEO：每頁獨立標題與描述、自動產生 sitemap.xml。

## 4. 從初光可以參考的地方（已只讀看過原始碼，沒有做任何修改）

初光是純 HTML＋JavaScript，沒有使用框架，部署在 Vercel。

| 初光的東西 | 逐光怎麼用 |
|---|---|
| `assets/workspace.css` 的顏色設定（深藍灰文字、橘色強調色 `#d9480f`、淺灰底）、自動深色模式 | **照抄配色**，兩個網站看起來是同一家 |
| 字體：Barlow Condensed（英文標題）、Chiron Hei HK（中文）、IBM Plex Mono（數字） | **照用**；數字用等寬字體，計算結果比較好讀 |
| `assets/site.css` 的卡片、按鈕、頁首、頁尾樣式 | 參考後重寫成逐光需要的版本 |
| `assets/feedback.js` 右下角橘色「回報問題」按鈕與彈出視窗 | **外觀照做**；但初光要登入才能回報，逐光改成不用登入 |
| `supabase/migrations/013_client_errors.sql` 的作法：資料表不開放、只能透過函式寫入、函式裡限制長度與數量 | **照這個模式**寫逐光的問題回報 |
| `vercel.json` 的安全標頭（Content-Security-Policy 等） | 照用，但改成逐光自己的 Supabase 網址 |
| Google 登入流程 | 第一版不用，先不參考 |

## 5. 頁面與網址

| 網址 | 頁面 |
|---|---|
| `/` | 首頁 |
| `/cameras/` | 攝影機列表 |
| `/cameras/sony-fx3/` 等 | 每台相機一頁（資料檔自動產生） |
| `/tools/` | 工具首頁（5 個工具入口） |
| `/tools/shutter-angle/` | 快門角度 |
| `/tools/frame-rate/` | 升降格 |
| `/tools/focal-length/` | 等效焦段 |
| `/tools/recording-capacity/` | 錄影容量（預設） |
| `/tools/recording-capacity/?mode=card` | 同一頁切到「記憶卡可錄時間」 |
| `/lenses/`、`/media/`、`/film/` | 即將推出 |
| `/about/` | 關於與免責說明完整版 |
| `/404` | 找不到頁面 |

相機頁捷徑的網址範例：`/tools/recording-capacity/?camera=sony-fx3`、`/tools/focal-length/?camera=sony-fx30`。

## 6. 元件（共用的畫面零件）

| 元件 | 用途 |
|---|---|
| `BaseLayout` | 每頁共用外框：頁首、導覽、頁尾免責、回報問題按鈕 |
| `SiteHeader`／`SiteFooter` | 頁首導覽、頁尾 |
| `SearchBox` | 全站搜尋 |
| `ReportButton` | 回報問題按鈕＋視窗 |
| `SectionCard` | 首頁五個入口卡片（含「即將推出」狀態） |
| `CameraCard` | 列表上的每台相機 |
| `SpecTable` | 相機規格表 |
| `RecordingModes` | 錄影模式表（手機版改成一列一張卡片，避免左右捲動） |
| `ToolLinks` | 相機頁的工具捷徑按鈕 |
| `SourceNote` | 資料來源與最後確認日期 |

## 7. 資料格式

每台相機一個 JSON 檔：`src/data/cameras/sony-fx3.json`。
（計畫書建議一個 `cameras.json` 放全部；但每台相機有一整串錄影模式，一台一個檔案比較好查證、好修改，我建議分開。之後的 `lenses.json`、`media.json`、`film.json` 資料比較短，就照計畫書用單一檔案。）

建置時會自動檢查格式，填錯就無法上線。

```json
{
  "slug": "sony-fx3",
  "brand": "Sony",
  "model": "FX3",
  "type": "電影機（Cinema Line）",
  "announced": "2021-02",

  "sensor": {
    "format": "Full Frame",
    "width_mm": 0,
    "height_mm": 0,
    "resolution_mp": 0
  },
  "base_iso": [0, 0],
  "log": ["S-Log3"],
  "raw": { "internal": "none", "external": "16-bit RAW (via HDMI)" },
  "open_gate": false,
  "lens_mount": "Sony E",
  "media": ["CFexpress Type A", "SDXC UHS-II"],
  "timecode": "in/out (multi-terminal)",
  "sdi": "none",
  "hdmi": "Type A",
  "dynamic_range_claimed": "15+ stops",

  "recording_modes": [
    {
      "resolution": "3840x2160",
      "max_fps": 0,
      "codec": "XAVC S-I",
      "bitrate_mbps": 0,
      "bit_depth": 10,
      "chroma": "4:2:2",
      "crop": "none",
      "notes": ""
    }
  ],

  "source_name": "Sony Official",
  "source_url": "https://...",
  "extra_sources": [
    { "source_name": "Sony FX3 Help Guide", "source_url": "https://..." }
  ],
  "last_verified": "2026-10-06",
  "editor_notes": "查證備註，只給我們看，不顯示在網頁上"
}
```

（以上 0 和 ... 只是格式示範，正式資料一筆一筆查原廠。）

規則：

- 任何欄位查不到就填 `"Unknown"`，網頁顯示「未知」。
- 「最大錄影解析度」「最大格率」不另外填，**由錄影模式列表自動算出**，避免兩個地方寫得不一樣。
- `crop`：`"none"`／`"crop"`／`"Unknown"`；有裁切可加 `crop_factor`。
- `bitrate_mbps` 單位 Mbps。位元率查不到的模式，在容量工具裡會顯示「位元率未知」，不能選來算。
- Dynamic Range 只記原廠宣稱值，網頁標示「原廠宣稱」（計畫書第十五點）。
- 每台至少一個原廠來源（`source_name`、`source_url`、`last_verified`）；用到原廠手冊等其他資料時列在 `extra_sources`。
- 錄影模式只收常用、有意義的組合，不列出所有組合。

## 8. 工具算式（會寫在每個工具頁上）

- **快門角度**：快門速度 ＝ 1 ÷（格率 × 360 ÷ 角度）。24 fps＋180° → 1/48 秒，並提示「相機上最接近的是 1/50」。
- **升降格**：播放速度 ＝ 時間軸格率 ÷ 拍攝格率；慢動作倍率 ＝ 拍攝格率 ÷ 時間軸格率。60 → 24：播放速度 40%、慢動作 2.5×。
- **等效焦段**：等效焦段 ＝ 焦段 × 換算倍率。選項：Full Frame（1×）、Super35（約略值，約 1.5×）、APS-C Sony（1.5×）、APS-C Canon（1.6×）、M43（2×）、1 inch（約 2.7×）。從相機頁進來時用那台的實際感光元件尺寸計算。Sony APS-C 35mm → 52.5mm。
- **錄影容量**：容量（GB）＝ 位元率（Mbps）× 秒數 ÷ 8 ÷ 1000。200 Mbps × 3 小時 ＝ 270 GB。
- **記憶卡可錄時間**：同一個式子倒過來。256 GB、400 Mbps → 約 85 分鐘。
- 都會註明：1 GB ＝ 10 億位元組（跟記憶卡包裝相同）；格式化後可用容量會比標示少；實際以相機顯示為準。

## 9. 問題回報（第一階段最後一步）

- 逐光自己的 Supabase 專案，不碰初光的。
- 資料表 `issue_reports`：哪一頁、問題內容、聯絡方式（選填）、裝置、時間。
- 照初光 013 的作法：資料表完全不開放，只能呼叫 `submit_issue_report()`，函式裡：
  - 內容 5～2000 字、聯絡方式最多 200 字
  - 同一個來源 10 分鐘內最多 5 則
  - 全站一天最多 300 則，總數超過 5000 則就暫停收件
- 你看回報的方式：第一版先直接在 Supabase 後台的資料表頁面看（不另做管理頁）。
- 做到這一步時，我會寫 `docs/supabase-setup.md` 一步一步教你。你不需要給我任何金鑰。

## 10. 建議延後的功能

- 鏡頭、記憶卡、底片資料庫 → 第二階段（首頁先顯示「即將推出」）
- ND、畫面比例、底片長度、景深、曝光 Stop 計算器 → 第二階段
- 登入、收藏、我的器材庫 → 等有需要再說
- 相機比較、錄影格式精靈、器材包、感光元件視覺化、教學文章 → Roadmap
- 回報問題的管理頁面 → 先用 Supabase 後台看就好
- 斗內按鈕 → 網站上線後再加，很簡單

## 11. 開發順序（每一步都給你截圖，你說「可以」才合併）

1. 網站骨架：首頁、導覽、頁尾、工具首頁、即將推出頁（不含相機資料）
2. 5 個工具
3. 攝影機列表＋相機頁＋第一批 10 台（逐台查原廠）
4. 補齊第二批 10 台
5. 問題回報＋Supabase 設定教學
6. 部署到 Vercel＋綁定 zhuiguang.riseatsun.com（教你在 Vercel、Namecheap 按哪裡）

## 12. 攝影機清單（2026-10-06 負責人回覆後更新）

負責人決定：A7 IV／A7 V 兩台都放、R6 Mark II／III 兩台都放、加入 FX5、Fujifilm、Nikon ZR／Z9／Z8；DJI 不放；Blackmagic 不放舊機，以新的 12K 機種為主。

| 品牌 | 型號 |
|---|---|
| Sony（8） | FX3、FX30、FX5、FX6、A7S III、A7 IV、A7 V、ZV-E1 |
| Canon（4） | EOS R6 Mark II、EOS R6 Mark III、EOS R5 C、EOS C70 |
| Nikon（4） | Z6III、Z8、Z9、ZR |
| Panasonic（2） | LUMIX S5II、GH7 |
| Fujifilm（1～2） | X-H2S（待確認是否加 GFX ETERNA 55） |
| Blackmagic（2） | PYXIS 12K、URSA Cine 12K LF（待確認） |
| RED（2） | KOMODO 6K、V-RAPTOR（8K VV） |
| ARRI（3） | ALEXA Mini、ALEXA Mini LF、ALEXA 35 |

合計 26～27 台。分兩批上線（每批都給負責人看截圖）。

### 預期查證困難

- **ARRI**：錄影模式很多，位元率在原廠另外的資料表文件，第一版只收主要模式。
- **RED**：R3D 位元率隨畫質設定變動，原廠多用「每 GB 可錄幾分鐘」表示，會換算並註明。
- **Blackmagic**：BRAW 位元率依壓縮比不同，原廠手冊有表。
- **部分相機的原廠規格沒有寫位元率**，會標 Unknown。
