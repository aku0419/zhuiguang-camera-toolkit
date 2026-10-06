# 逐光 第一階段提案（待負責人確認）

狀態：**草案**，負責人確認前不開始寫程式。

---

## 一、架構

```
使用者的瀏覽器
   │
   ├─ 看網頁、用計算工具 ──► Vercel（Astro 產生的靜態網頁，全部預先做好）
   │                         計算在瀏覽器裡完成，不經過伺服器
   │
   └─ 按「回報問題」送出 ──► 逐光自己的 Supabase 專案
                              只能呼叫一個函式 submit_issue_report()
                              函式會檢查長度、次數，通過才寫入
```

- **Astro**：寫好資料檔（每台相機一個檔案），建置時自動產生每台相機的網頁。新增一台相機＝新增一個資料檔，不用改程式。
- **全站搜尋**：建置時把所有相機和工具的名稱、別名整理成一份小清單，搜尋在瀏覽器裡完成，不需要外部服務。
- **SEO**：每頁有自己的標題、描述、網址；自動產生 sitemap.xml；相機頁加上結構化資料。
- **費用**：Vercel 和 Supabase 免費方案就夠用。

## 二、相機資料格式

每台相機一個檔案：`src/content/cameras/<品牌>-<型號>.json`。建置時會自動檢查格式，填錯（例如位元率寫成文字）會直接報錯，不會上線。

```json
{
  "slug": "sony-fx3",
  "brand": "Sony",
  "model": "FX3",
  "aliases": ["ILME-FX3"],
  "category": "cinema-line",
  "status": "current",
  "announced": "2021-02",
  "mount": "Sony E",

  "sensor": {
    "format": "full-frame",
    "width_mm": 35.6,
    "height_mm": 23.8,
    "effective_megapixels": 10.2,
    "source": "s1"
  },

  "base_iso": [800, 12800],
  "log_profiles": ["S-Log3"],
  "media": ["CFexpress Type A", "SDXC UHS-II"],

  "recording_modes": [
    {
      "resolution": "3840x2160",
      "max_fps": 119.88,
      "codec": "XAVC S-I",
      "bitrate_mbps": 1200,
      "bit_depth": 10,
      "chroma": "4:2:2",
      "crop": "none",
      "crop_factor": null,
      "notes": "",
      "source": "s1"
    }
  ],

  "sources": [
    {
      "id": "s1",
      "source_name": "Sony 官方 FX3 規格頁",
      "source_url": "https://...",
      "last_verified": "2026-10-06"
    }
  ],

  "unknown_fields": ["..."],
  "editor_notes": "給負責人看的查證備註，不顯示在網頁上"
}
```

（上面的數字只是格式示範，正式資料會一筆一筆查原廠。）

欄位規則：

| 欄位 | 說明 |
|---|---|
| 任何數字欄位 | 查不到就填 `"Unknown"`，網頁顯示「未知（原廠未公布）」 |
| `crop` | `"none"`（不裁切）／`"crop"`（裁切）／`"Unknown"`；有裁切且原廠有給倍率時填 `crop_factor` |
| `bitrate_mbps` | 單位 Mbps（百萬位元／秒）。RAW 這類「位元率會變動」的格式，原廠有給最高值就填最高值並在 `notes` 註明；沒給就填 `"Unknown"` |
| `source` | 指向 `sources` 裡的編號，表示這一筆是從哪份原廠資料查到的 |
| `last_verified` | 實際打開原廠頁面核對的日期 |

一台相機的錄影模式可能有幾十種組合，**第一版只收「常用、有意義」的模式**（每種解析度＋編碼取最高格率那一列，加上重要的裁切模式），不會把所有組合都列出來。

## 三、計算方式（會寫在每個工具頁上）

- **錄影容量**：容量（GB）＝ 位元率（Mbps）× 秒數 ÷ 8 ÷ 1000
  例：200 Mbps 錄 1 小時 ＝ 200 × 3600 ÷ 8 ÷ 1000 ＝ 90 GB
  GB 採 1 GB ＝ 10⁹ 位元組（跟記憶卡包裝相同）；電腦 Windows 顯示的「GB」其實是 GiB，數字會看起來比較小。
  提醒：記憶卡格式化後可用容量通常比標示少，實際可錄時間以相機顯示為準。
  反方向（記憶卡可錄時間）＝ 同一個式子倒過來算，畫面上一個切換鈕。
- **快門角度**：快門速度 ＝ 格率 × 360 ÷ 角度（例：24 fps、180° → 1/48 秒）。
- **升降格**：播放速度倍率 ＝ 拍攝格率 ÷ 時間軸格率；並算出拍攝 N 秒、播放變幾秒。
- **等效焦段**：等效焦段 ＝ 焦段 × 換算倍率；換算倍率 ＝ 43.27 mm（全片幅對角線）÷ 感光元件對角線。另顯示等效光圈（景深參考）。

## 四、檔案清單

```
CLAUDE.md                          專案規則（已建立）
docs/proposal-phase1.md            本提案
docs/data-guide.md                 新增／查證相機資料的步驟
docs/supabase-setup.md             教負責人建立 Supabase 的步驟
supabase/issue_reports.sql         資料表＋寫入函式（負責人貼到 Supabase 執行）

package.json / astro.config.mjs / tsconfig.json
src/content.config.ts              相機資料格式檢查規則
src/content/cameras/*.json         20 台相機資料

src/layouts/BaseLayout.astro       共用外框：頁首、頁尾免責、回報問題按鈕
src/components/
  SiteHeader.astro / SiteFooter.astro
  SearchBox.astro                  全站搜尋
  ReportIssue.astro                回報問題視窗
  CameraSpecTable.astro            規格表
  RecordingModesTable.astro        錄影模式表
  SourceList.astro                 資料來源與查證日期
  ComingSoon.astro                 「即將推出」卡片

src/pages/
  index.astro                      首頁（五個入口＋搜尋）
  cameras/index.astro              攝影機列表（可依品牌、片幅篩選）
  cameras/[slug].astro             每台相機一頁（自動產生 20 頁）
  tools/index.astro                工具列表
  tools/shutter-angle.astro        快門角度
  tools/frame-rate.astro           升降格
  tools/equivalent-focal-length.astro  等效焦段
  tools/recording-capacity.astro   錄影容量／記憶卡可錄時間
  lenses/index.astro               即將推出
  media/index.astro                即將推出（記憶卡）
  film/index.astro                 即將推出（底片）
  disclaimer.astro                 免責說明完整版
  404.astro

src/lib/calc/*.ts                  四個工具的計算（另附自動測試）
src/lib/search-index.ts            產生搜尋清單
src/styles/global.css              顏色、字體、按鈕（參考初光）
public/robots.txt, favicon
```

## 五、問題回報（Supabase）

- 資料表 `issue_reports`：頁面網址、問題類型、內容、聯絡方式（選填）、時間。
- 前端**不能直接讀寫資料表**，只能呼叫函式 `submit_issue_report()`。
- 函式檢查：
  - 內容 5～2000 字、聯絡方式最多 200 字、網址最多 500 字
  - 同一來源 10 分鐘內最多 5 則
  - 全站一天最多 300 則（超過就暫停收件，避免被灌爆）
- 這一步做到時，我會寫好 `docs/supabase-setup.md`，一步一步教你建立專案、貼 SQL、把「公開金鑰」貼到 Vercel。你不需要給我任何金鑰。

## 六、第一階段 20 台攝影機（請確認）

查證時發現有兩台在 2025 年底已出新一代，建議調整：

| # | 品牌 | 型號 | 備註 |
|---|---|---|---|
| 1 | Sony | FX3 | |
| 2 | Sony | FX30 | Super35 |
| 3 | Sony | A7S III | |
| 4 | Sony | A7 IV → **建議改 A7 V**？ | A7 V 已於 2025/12 發表。A7 IV 還很多人在用，二選一或兩台都放 |
| 5 | Sony | ZV-E1 | |
| 6 | Sony | FX6 | |
| 7 | Canon | EOS R6 Mark II → **建議改 R6 Mark III**？ | R6 Mark III 已於 2025/11 發表 |
| 8 | Canon | EOS R5 C | |
| 9 | Canon | EOS C70 | |
| 10 | Nikon | Z6III | |
| 11 | Nikon | Z8 | |
| 12 | Panasonic | LUMIX S5II | |
| 13 | Panasonic | GH7 | M4/3 |
| 14 | Blackmagic | Pocket Cinema Camera 6K Pro | Super35 |
| 15 | Blackmagic | Cinema Camera 6K | |
| 16 | RED | KOMODO 6K | Super35 |
| 17 | RED | V-RAPTOR | 有 8K VV 和 S35 版本，建議先做 8K VV |
| 18 | ARRI | ALEXA Mini | 已停產但租賃市場仍常見 |
| 19 | ARRI | ALEXA Mini LF | |
| 20 | ARRI | ALEXA 35 | |

可以考慮的替補：**Nikon ZR**（2025/9 發表，Nikon 與 RED 合作的電影機，很熱門）。若要放，建議替換其中一台。

### 預期查證困難（先跟你說）

- **ARRI**：錄影模式非常多，位元率多半寫在獨立的「Data rates」文件，第一版只收主要模式。
- **RED**：R3D 位元率會隨畫質設定變動，原廠多以「每秒 MB」或「每 GB 可錄分鐘數」表示，我會換算並註明。
- **Blackmagic**：Blackmagic RAW 位元率依壓縮比不同，原廠手冊有表，資料量大。
- **Canon / Nikon 相機**：部分模式原廠沒寫位元率，會標 Unknown。
- 部分原廠網站對海外連線限制，查不到時會列出來請你幫忙打開核對。

---

## 需要你回覆的事

1. 架構、資料格式、檔案清單：可以嗎？
2. 第 4 台：A7 IV／A7 V／兩台都放？
3. 第 7 台：R6 Mark II／R6 Mark III／兩台都放？
4. Nikon ZR 要不要放？要的話替換哪一台？
5. 計畫書沒有一起貼上來（訊息在「以下是完整的計畫書」後就結束了），請再貼一次，我要對照第二十七點的順序和其他細節。
