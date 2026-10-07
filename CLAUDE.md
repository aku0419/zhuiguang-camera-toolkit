# CLAUDE.md — 逐光｜攝影工具組

這份檔案是本專案的規則與已確定決定。每次對話開始都先讀這份，照著做。
計畫書原文在 `docs/plan.md`，第一階段提案在 `docs/proposal-phase1.md`。計畫書和這份檔案不同時，以這份檔案為準。
有新的決定時，更新這份檔案（在分支上改，跟其他修改一起給負責人確認）。

## 跟負責人溝通的方式

- 負責人不是工程師：負責給意見、測試、在後台按按鈕。程式全部由 Claude 完成。
- 一律用**繁體中文、台灣用語**、講白話。需要負責人做的事，寫成一步一步的說明。
- **絕對不要跟負責人要任何密碼、secret key、API key**。需要金鑰的設定，教負責人自己貼到後台（Vercel / Supabase 的設定頁）。
- 程式裡、commit 裡、截圖裡都不能出現金鑰。只有「公開金鑰」（例如 Supabase anon key）可以放在前端，而且也是請負責人自己貼到 Vercel 環境變數。

## 工作流程

1. 每次修改都在分支上做，不直接改 `main`。
2. 做完給負責人**電腦版（1280 寬）和手機版（390 寬）的截圖**。
3. 負責人說「可以」才合併到 `main`。沒說可以就不合併。
4. 依計畫書第十八點的順序進行（計畫書只有十八點）。先提案、確認，再寫程式。開發順序見 `docs/proposal-phase1.md` 第 11 點。
5. **不要 Over-engineering**：有「完整但複雜」和「簡單但夠用」兩種方案時，選簡單夠用的。
6. 成功標準：學生第一次進網站，不用教學，30 秒內解決一個攝影問題。

## 跟「First Light 初光」的關係

- 初光（程式庫 `aku0419/film-production-tool`，網址 firstlight.riseatsun.com）是另一個正在使用的工具。
- 逐光是**完全獨立的新網站**：獨立程式庫、獨立 Vercel 專案、獨立 Supabase 專案，不共用任何東西。
- 需要參考初光的設計時，可以把初光程式庫加進來**只讀**參考（例如 `assets/site.css`、`assets/workspace.css` 的顏色、字體、按鈕樣式）。
- **絕對不可以修改、推送、合併、開 PR 到初光的程式庫。** 也不可以動初光的 Supabase、Vercel、DNS 和正式資料。

## 技術架構（已確定）

- 用 **Astro** 產生靜態網站，部署在**新的 Vercel 專案**，之後綁定 `zhuiguang.riseatsun.com`。
- 每台器材、每個工具都是一個獨立網頁（獨立網址、標題、描述）。
- **要用 Gmail（Google 登入）才能使用整站**（負責人 2026-10 決定，跟初光一樣）。做法跟初光一樣：網頁上的登入牆（`src/lib/auth.js`、`src/components/AuthGate.astro`、`/login/`），用逐光自己的 Supabase 專案的 Google 登入，不是真正保密。
- **封閉測試**：Google 登入維持測試模式，只有負責人手動加入「測試使用者」的 Gmail 能登入；先不公開、不發布、不送 Google 搜尋。`robots.txt` 禁止收錄，已停用網站地圖。
- 計算全部在瀏覽器裡完成，不需要伺服器。
- 問題回報用**獨立的 Supabase 專案**（不跟初光共用）。寫入只能透過有**長度限制和次數限制**的資料庫函式，前端不能直接寫資料表。

## 內容規則（已確定）

- **不放任何器材照片**，只顯示名稱和規格。
- 規格**一定要查原廠資料**（原廠網站、原廠 Manual、官方 Support Document）。不能把 AI 的記憶當成規格來源。
- 器材資料放在 repo 裡的 JSON 檔（`src/data/`），不放資料庫。
- Dynamic Range 只記原廠宣稱值，網頁標示「原廠宣稱」。
  - 每筆資料記錄 `source_url`、`source_name`、`last_verified`（查證日期，格式 YYYY-MM-DD）。
  - 查不到或不確定就寫 `"Unknown"`，**不要猜**，也不要用第三方網站的數字填原廠欄位。
  - 查證有困難的地方，直接告訴負責人，請負責人幫忙核對。
- 攝影機不能只記「最大格率、編碼」，要記成**錄影模式列表**：每一列記解析度、最高格率、編碼、位元率、位元深度、色彩取樣、是否裁切。
- 錄影容量計算用到位元率；位元率查不到的模式，在工具裡不能被選來計算（或標示「位元率未知」）。

## 工具規則（已確定）

- **錄影容量**和**記憶卡可錄時間**是同一個算式，做成**同一個工具、可以切換方向**。
  - 要註明 GB 的算法（1 GB = 1,000,000,000 位元組，跟記憶卡包裝上的標示一樣）。
  - 要提醒：記憶卡格式化後實際可用容量會比標示少。
- **等效焦段**：選「通用 Super35」時要註明是**約略值**（每台相機的 Super35 尺寸不同）；從相機頁進去時，用那台相機的**實際感光元件尺寸**。
- 每台攝影機頁面要有「用這台算錄影容量」「算等效焦段」等按鈕，自動帶入這台的資料（用網址參數帶入，例如 `/tools/recording-capacity/?camera=sony-fx3`）。

## 設計（已確定）

- 沿用初光風格：簡單乾淨、**手機優先**、繁體中文介面。
- 頁尾一定要有免責說明，文字：「逐光資料整理自原廠公開資訊，實際錄影格式、記憶卡需求與相容性可能因韌體版本而異，重要拍攝前請以原廠最新文件為準。」
- 網站完全免費，不鎖功能、不做付費會員。未來只放自願斗內。
- 每頁都要有「回報問題」按鈕（回報本身不需要額外登入資料，只帶公開金鑰）。

## 第一階段範圍

- 首頁：五個入口（攝影機、工具、鏡頭、記憶卡、底片）＋全站搜尋。鏡頭／記憶卡／底片先顯示「即將推出」。
- 攝影機列表頁，每台攝影機一頁（第一階段 28 台，名單見 `docs/proposal-phase1.md` 第 12 點；DJI 不放、Blackmagic 只放 URSA Cine 系列）。
- 工具：快門角度、升降格、等效焦段、錄影容量（含記憶卡可錄時間）。
- 頁尾免責說明、問題回報。

## 記憶卡資料庫（第二階段，進行中）

- 資料放 `src/data/media/<slug>.json`，檢查在 `src/lib/media.js`；每種格式一頁（`/media/<slug>/`），自動列出用到這種卡的相機（用相機「記憶卡」欄的文字比對，設定在 `camera_match`）。
- 只做「格式」，不收品牌 SKU、不放價格。規格只採官方組織資料（SD 協會、CFA 等），標示來源與查證日期。
- 相機頁錄影模式表有「需要的寫入速度（估算）」：位元率 ÷ 8 = MB/s，相機有 SD 卡槽時再標 SD 影片速度等級（V6／V10／V30／V60／V90，算式在 `calc.js` 的 `sdVideoClass`）。這是估算，頁面要註明以原廠說明書為準。
- 已完成：SD／SDHC／SDXC／SDUC、UHS-I、UHS-II、影片速度等級、CFexpress Type A／B、CFexpress 影片效能保證（VPG）、CFast 2.0、XQD、Codex CompactDrive、RED PRO CFexpress。RED PRO CFast（KOMODO 用）還沒找到官方頁面，先不收。

## 鏡頭資料庫（第二階段，進行中）

- 資料放 `src/data/lenses/<slug>.json`，檢查在 `src/lib/lenses.js`；列表 `/lenses/`（可依品牌、卡口、定焦／變焦篩選），每支一頁 `/lenses/<slug>/`，自動列出「卡口相同」的相機。
- 一個品牌一個品牌做，每批至少 20 支，先請負責人確認再合併。順序：Sony → Canon → Nikon → Sigma → Tamron → Viltrox → Panasonic → Fujifilm → ARRI → Cooke → Zeiss → Sirui／Laowa 等。
- 規格只採原廠資料，標示來源與查證日期；原廠表沒寫的欄位寫 `Unknown`，不用猜。
- Sony：美國、台灣等官網會擋，目前用 Sony Japan 的官方規格頁（`https://www.sony.jp/ichigan/products/<型號>/spec.html`，日文）整理成繁體中文。已收 37 支（FE／E 卡口 G Master、G、標準系列）。
- Canon：用 Canon 台灣官方產品頁（繁體中文，規格在頁面的 `#specifications` 區塊；電影鏡頭頁的規格表在「鏡頭接環」那一段）整理。已收 42 支 RF／RF-S 鏡頭與 7 支 CN-R 電影定焦（T 值、成像範圍）。CN-E 變焦（EF/PL）頁面版型不同，還沒收。
- Nikon：用 Nikon 全球官網（`imaging.nikon.com/imaging/lineup/lens/z-mount/<鏡頭>/`，英文）的 Specifications 區塊整理成繁體中文。已收 41 支 NIKKOR Z（S-Line、非 S、DX、微距），超望遠（400／600／800 等）先不收。對焦（AF）欄位各家規格表多半沒寫，目前 Sony、Nikon 一律 `Unknown` 不顯示。
- Sigma：用 Sigma 全球官網（`www.sigma-global.com/en/lenses/<型號>/`、`/en/cine-lenses/...`，英文）整理。已收 39 支（Art、Contemporary、Sports 部分；DG／DN／DC）與 15 支 Cine（FF High Speed Prime、AF Cine、High Speed Zoom）。一支鏡頭有多個卡口版本時只做一頁，用 `mounts`（篩選用）與 `mount_match`（比對相機）列出，各卡口不同的重量、尺寸寫在 `weight_note`、`size_text`。長焦大砲（150-600、500mm 等）、魚眼、Aizu、Classic Prime 先不收。
- Tamron：用 Tamron 全球官網的規格頁（`www.tamron.com/global/consumer/lenses/<型號代碼>/spec.html`，英文，欄位以 Tab 分隔）整理。已收 24 支現行無反光鏡鏡頭（Sony E／Nikon Z／Fujifilm X／Canon RF）；已停產（End of sale）與單反（EF／F／A 卡口）、M43 的不收。Di III-A、Di II 當作 APS-C 專用。
- Viltrox：用 Viltrox 官方網站商品頁的 Specs 區塊整理（英文）。已收 21 支（Air、EVO、Pro、LAB 定焦；Sony E／Nikon Z／Fujifilm X／L-Mount）。舊款頁面格式不同、找不到規格的先跳過（負責人決定：這不是台灣主流品牌，找不到就不補）。
- Panasonic：用 Panasonic 日本官網的規格頁（`panasonic.jp/dc/p-db/<型號>_spec.html`，日文表格）整理。鏡頭清單是 JavaScript 動態載入、我讀不到，所以用型號試探網址（S-R／S-E／S-S／S-X、H-ES／H-X／H-HS 等），頁面存在才收。已收 41 支（LUMIX S 的 L-Mount 15 支、LUMIX G／LEICA DG 的 M43 26 支）。M43 鏡頭的 `coverage` 是 `Micro Four Thirds`。
- Fujifilm：用 Fujifilm X 官網（`www.fujifilm-x.com/en-us/products/lenses/<鏡頭>/specifications/`，英文）整理。已收 52 支（XF／XC 的 Fujifilm X 卡口、GF 的 Fujifilm G 卡口含 PZ 電影變焦 T 值）。官網有幾頁會顯示成別支鏡頭的規格（例如 XC13-33、XF16mmF2.8），收錄前一定要檢查頁面的 `Type` 欄位跟鏡頭名稱一致，不一致就跳過。500mm、T/S、增距鏡、Fujinon Premista／MK 電影鏡頭還沒收。
- ARRI：用 ARRI 官網 Signature Prime／Signature Zoom 頁面的鏡頭卡片（T 值、長度、前端直徑、重量、最近對焦距離）整理，卡口 LPL、成像範圍 46 mm（`coverage: "Large Format"`）來自總覽頁。已收 20 支（Signature Prime 16 支、Signature Zoom 4 支）。Master Prime、Ultra Prime、Ultra Wide Zoom、Ensō 的規格表在官網被截斷或抓不到，先不收（不猜）。
- Cooke：用 Cooke Optics 官網各系列頁面最下方的規格表（橫向表格：第一列是焦段，往下每一列是一個項目，每個值對應一支鏡頭）整理，卡口、涵蓋片幅來自頁面上方的 Focal length range／Format／Mount 摘要。已收 89 支（S8/i FF、S7/i FF、Panchro/i Classic FF／S35、Panchro 65/i、Macro/i FF、Anamorphic/i FF／S35、Varotal/i FF 變焦、SP3、AP3）。規格表某一列的數量跟焦段數量對不上時，該項寫 Unknown 不硬配；5/i 頁面沒有規格表先不收。
- 電影鏡頭用 T 值：`aperture_type: "T"`；可填 `front_diameter_mm`、`image_circle_mm`、`size_text`。一支鏡頭可裝的卡口不只一個時（例如 EF／PL 可換），用 `mount_match` 列出要比對的相機卡口文字。

## 開發指令

- `npm install`：安裝
- `npm run dev`：本機預覽
- `npm run build`：建置（輸出在 `dist/`）
- `npm test`：檢查計算式（計畫書的例子都要算對）
- `ZG_SAMPLE=1 npm run build`：加入 `tests/fixtures/cameras/` 的範例相機，只用來預覽版面；正式建置不會出現
- 相機資料放 `src/data/cameras/<slug>.json`，格式檢查在 `src/lib/cameras.js`，填錯建置會失敗
- 計算式只寫在 `src/lib/calc.js`，網頁和測試共用。

## 問題回報（已設定完成）

- 前端：`src/components/ReportButton.astro`（每頁右下角按鈕＋視窗），用 `fetch` 呼叫 Supabase REST 的 `submit_issue_report()`，只帶 `apikey`（公開金鑰），不用 supabase-js。
- 資料庫：`supabase/issue_reports.sql`（資料表不開放、只開放函式；長度、次數、總量限制；只存 IP 雜湊）。改這份 SQL 要保持可重複執行，並重新用本機測試（pglite）驗證限制都有效。
- 設定值：Vercel 環境變數 `PUBLIC_SUPABASE_URL`、`PUBLIC_SUPABASE_KEY`（只放公開金鑰，**絕對不放 secret key**）。沒設定時按鈕仍出現，送出時顯示暫時無法送出。
- CSP（`vercel.json`）的 `connect-src` 已允許 `https://*.supabase.co`。
- 操作說明給負責人：`docs/supabase-setup.md`、`docs/deploy-vercel.md`。
- 隱私說明寫在 `/about/`；若新增收集的欄位，要同步改那裡。

## 其他

- commit 訊息、程式碼註解、PR 內容不要寫任何 AI 模型名稱。
