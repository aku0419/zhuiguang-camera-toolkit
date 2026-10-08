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

## 用語規定（台灣用語）

- 全站只用台灣用語，介面字照初光的對照表（`/home/user/film-production-tool/docs/glossary.md`）：新增、檢視、資料、設定、連結、產生、聯絡、剪接、調光、器材；不用添加、查看、數據、設置、鏈接、生成、聯繫、剪輯、調色、設備。
- 器材用語：**接環**（不用卡口，glossary 有註明「也有人叫卡口」）、**防手震**（不用防震）、**超音波馬達**（不用超聲波）、**檢查碼**（不用校驗碼）、前端（不用先端）。
- 日文、英文原文翻成繁體中文時，要先改成台灣常用說法；沒把握的詞，問負責人。
- 地名一律用「台」，不用「臺」。

## 跟「First Light 初光」的關係

- 初光（程式庫 `aku0419/film-production-tool`，網址 firstlight.riseatsun.com）是另一個正在使用的工具。
- 逐光是**完全獨立的新網站**：獨立程式庫、獨立 Vercel 專案、獨立 Supabase 專案，不共用任何東西。
- 需要參考初光的設計時，可以把初光程式庫加進來**只讀**參考（例如 `assets/site.css`、`assets/workspace.css` 的顏色、字體、按鈕樣式）。
- **絕對不可以修改、推送、合併、開 PR 到初光的程式庫。** 也不可以動初光的 Supabase、Vercel、DNS 和正式資料。

## 技術架構（已確定）

- 用 **Astro** 產生靜態網站，部署在**新的 Vercel 專案**，之後綁定 `zhuiguang.riseatsun.com`。
- 每台器材、每個工具都是一個獨立網頁（獨立網址、標題、描述）。
- **要用 Gmail（Google 登入）才能使用整站**（負責人 2026-10 決定，跟初光一樣）。做法跟初光一樣：網頁上的登入牆（`src/lib/auth.js`、`src/components/AuthGate.astro`、`/login/`），用逐光自己的 Supabase 專案的 Google 登入，不是真正保密。
- **封閉測試**：Google 登入維持測試模式，只有負責人手動加入「測試使用者」的 Gmail 能登入；先不公開、不發布、不送 Google 搜尋。`robots.txt` 禁止搜尋引擎收錄、已停用網站地圖，但放行聊天軟體與社群的「連結預覽」程式（facebookexternalhit、Twitterbot、Line 等），這樣貼連結才會顯示標題；頁面仍有 `noindex`。
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

## 新增工具（已完成）

- ND 減光、畫面比例、景深、曝光級數（`/tools/nd-filter/`、`aspect-ratio/`、`depth-of-field/`、`exposure-stops/`），算式在 `calc.js`。景深用容許彌散圓＝全片幅對角線 ÷ 1500 再依片幅倍率縮小，相機頁、鏡頭頁都有「算景深」按鈕。
- 再加：色溫換算（K／mired）、照度換算（lux／呎燭光／EV）、時間碼計算（含 29.97／59.94 遺漏格式）、景深對照表（可列印）；視角工具加「拍攝距離」算拍攝範圍；畫面比例頁加「變形鏡頭」解壓縮比例。算式都在 `calc.js` 並有測試。
- 名詞小辭典 `/glossary/`（資料 `src/data/glossary.js`，38 個名詞，只講觀念不放相機規格數字，搜尋框也找得到）。
- 另加：視角、戶外曝光速查（Sunny 16 經驗法則，標示估算）、拍攝日素材量規劃；首頁「遇到什麼問題？」白話入口（`site.js` 的 `PROBLEMS`）；相機頁「這台能拍什麼」由錄影模式自動整理。
- 片幅用詞：台灣的 Medium Format 叫「中片幅」，所以篩選寫「中片幅／大片幅（比全片幅大）」，鏡頭列表寫「中／大片幅」。
- 對負責人與網站上，不要說「第幾階段」，只說「預計增加」。底片資料庫與底片長度計算還沒做，工具頁寫「預計增加」。
- 頁尾有自願斗內區塊（綠界連結 `https://p.ecpay.com.tw/0C16FE3`，新分頁開啟），首頁不放標語。
- 全站搜尋清單不放在首頁 HTML 裡，第一次點搜尋框才下載 `/search-index.json`（來源 `src/lib/search-index.js`），資料變多時首頁也不會變慢。鏡頭列表卡片用 `content-visibility:auto`。
- 首頁不顯示上方選單（首頁卡片就是入口），進到其他頁才出現。
- 網站左上 logo 跟初光一樣：英文粗體在前（ZHUIGUANG）、小的中文在後（逐光）。

## 記憶卡資料庫（進行中）

- 資料放 `src/data/media/<slug>.json`，檢查在 `src/lib/media.js`；每種格式一頁（`/media/<slug>/`），自動列出用到這種卡的相機（用相機「記憶卡」欄的文字比對，設定在 `camera_match`）。
- 只做「格式」，不收品牌 SKU、不放價格。規格只採官方組織資料（SD 協會、CFA 等），標示來源與查證日期。
- 相機頁錄影模式表有「需要的寫入速度（估算）」：位元率 ÷ 8 = MB/s，相機有 SD 卡槽時再標 SD 影片速度等級（V6／V10／V30／V60／V90，算式在 `calc.js` 的 `sdVideoClass`）。這是估算，頁面要註明以原廠說明書為準。
- 已完成：SD／SDHC／SDXC／SDUC、UHS-I、UHS-II、影片速度等級、CFexpress Type A／B、CFexpress 影片效能保證（VPG）、CFast 2.0、XQD、Codex CompactDrive、RED PRO CFexpress。RED PRO CFast（KOMODO 用）還沒找到官方頁面，先不收。

## 鏡頭資料庫（進行中）

- 資料放 `src/data/lenses/<slug>.json`，檢查在 `src/lib/lenses.js`；列表 `/lenses/`（可依品牌、接環、定焦／變焦篩選），每支一頁 `/lenses/<slug>/`，自動列出「接環相同」的相機。
- 列表頁功能：搜尋框（空白分隔、全部符合）、品牌／接環／定焦變焦／焦段（廣角≤28、標準、望遠≥85）／光圈／片幅篩選，依品牌分區顯示，可用網址參數預設（例如 `/lenses/?brand=Sony`）。鏡頭頁有「算等效焦段」按鈕（帶 `?focal=`）與「看更多該品牌鏡頭」。
- 一個品牌一個品牌做，每批至少 20 支，先請負責人確認再合併。順序：Sony → Canon → Nikon → Sigma → Tamron → Viltrox → Panasonic → Fujifilm → ARRI → Cooke → Zeiss → Sirui／Laowa 等。
- 規格只採原廠資料，標示來源與查證日期；原廠表沒寫的欄位寫 `Unknown`，不用猜。
- Sony：美國、台灣等官網會擋，目前用 Sony Japan 的官方規格頁（`https://www.sony.jp/ichigan/products/<型號>/spec.html`，日文）整理成繁體中文。已收 37 支（FE／E 接環 G Master、G、標準系列）。
- Canon：用 Canon 台灣官方產品頁（繁體中文，規格在頁面的 `#specifications` 區塊；電影鏡頭頁的規格表在「鏡頭接環」那一段）整理。已收 42 支 RF／RF-S 鏡頭與 7 支 CN-R 電影定焦（T 值、成像範圍）。CN-E 變焦（EF/PL）頁面版型不同，還沒收。
- Nikon：用 Nikon 全球官網（`imaging.nikon.com/imaging/lineup/lens/z-mount/<鏡頭>/`，英文）的 Specifications 區塊整理成繁體中文。已收 41 支 NIKKOR Z（S-Line、非 S、DX、微距），超望遠（400／600／800 等）先不收。對焦（AF）欄位各家規格表多半沒寫，目前 Sony、Nikon 一律 `Unknown` 不顯示。
- Sigma：用 Sigma 全球官網（`www.sigma-global.com/en/lenses/<型號>/`、`/en/cine-lenses/...`，英文）整理。已收 39 支（Art、Contemporary、Sports 部分；DG／DN／DC）與 15 支 Cine（FF High Speed Prime、AF Cine、High Speed Zoom）。一支鏡頭有多個接環版本時只做一頁，用 `mounts`（篩選用）與 `mount_match`（比對相機）列出，各接環不同的重量、尺寸寫在 `weight_note`、`size_text`。長焦大砲（150-600、500mm 等）、魚眼、Aizu、Classic Prime 先不收。
- Tamron：用 Tamron 全球官網的規格頁（`www.tamron.com/global/consumer/lenses/<型號代碼>/spec.html`，英文，欄位以 Tab 分隔）整理。已收 24 支現行無反光鏡鏡頭（Sony E／Nikon Z／Fujifilm X／Canon RF）；已停產（End of sale）與單反（EF／F／A 接環）、M43 的不收。Di III-A、Di II 當作 APS-C 專用。
- Viltrox：用 Viltrox 官方網站商品頁的 Specs 區塊整理（英文）。已收 21 支（Air、EVO、Pro、LAB 定焦；Sony E／Nikon Z／Fujifilm X／L-Mount）。舊款頁面格式不同、找不到規格的先跳過（負責人決定：這不是台灣主流品牌，找不到就不補）。
- Panasonic：用 Panasonic 日本官網的規格頁（`panasonic.jp/dc/p-db/<型號>_spec.html`，日文表格）整理。鏡頭清單是 JavaScript 動態載入、我讀不到，所以用型號試探網址（S-R／S-E／S-S／S-X、H-ES／H-X／H-HS 等），頁面存在才收。已收 41 支（LUMIX S 的 L-Mount 15 支、LUMIX G／LEICA DG 的 M43 26 支）。M43 鏡頭的 `coverage` 是 `Micro Four Thirds`。
- Fujifilm：用 Fujifilm X 官網（`www.fujifilm-x.com/en-us/products/lenses/<鏡頭>/specifications/`，英文）整理。已收 52 支（XF／XC 的 Fujifilm X 接環、GF 的 Fujifilm G 接環含 PZ 電影變焦 T 值）。官網有幾頁會顯示成別支鏡頭的規格（例如 XC13-33、XF16mmF2.8），收錄前一定要檢查頁面的 `Type` 欄位跟鏡頭名稱一致，不一致就跳過。500mm、T/S、增距鏡、Fujinon Premista／MK 電影鏡頭還沒收。
- ARRI：用 ARRI 官網 Signature Prime／Signature Zoom 頁面的鏡頭卡片（T 值、長度、前端直徑、重量、最近對焦距離）整理，接環 LPL、成像範圍 46 mm（`coverage: "Large Format"`）來自總覽頁。已收 20 支（Signature Prime 16 支、Signature Zoom 4 支）。Master Prime、Ultra Prime、Ultra Wide Zoom、Ensō 的規格表在官網被截斷或抓不到，先不收（不猜）。
- Cooke：用 Cooke Optics 官網各系列頁面最下方的規格表（橫向表格：第一列是焦段，往下每一列是一個項目，每個值對應一支鏡頭）整理，接環、涵蓋片幅來自頁面上方的 Focal length range／Format／Mount 摘要。已收 89 支（S8/i FF、S7/i FF、Panchro/i Classic FF／S35、Panchro 65/i、Macro/i FF、Anamorphic/i FF／S35、Varotal/i FF 變焦、SP3、AP3）。規格表某一列的數量跟焦段數量對不上時，該項寫 Unknown 不硬配；5/i 頁面沒有規格表先不收。
- Zeiss：用 ZEISS Cinematography 官網（`www.zeiss.com/photonics-and-optics/en/cinematography/lenses/<系列>.html`）頁面最下方的 Technical Data 整理（英文）。已收 48 支：CP.3、Supreme Prime、Supreme Prime Radiance、Nano Prime、Cinema Zoom、Supreme Zoom Radiance、Lightweight Zoom LWZ.3。Horizon Anamorphic、Aatma、Panoptes 65 的表格格式不同先不收。Zeiss 的攝影鏡頭（Otus、Batis、Loxia 等）還沒收。
- 電影鏡頭用 T 值：`aperture_type: "T"`；可填 `front_diameter_mm`、`image_circle_mm`、`size_text`。一支鏡頭可裝的接環不只一個時（例如 EF／PL 可換），用 `mount_match` 列出要比對的相機接環文字。

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

## 管理頁（現在線上人數）

- 管理頁 `/admin/`：只有 `site_admins` 資料表裡的帳號看得到；管理者登入後，右上角帳號列會多一顆「管理」按鈕（`AuthGate.astro` 用 `is_site_admin()` 判斷，結果記在該分頁的 sessionStorage），一般使用者看不到。目前顯示「現在線上人數」與各頁人數。做法跟初光一樣：Supabase Realtime Presence，頻道 `zg-online`，每個登入後的分頁匿名加入，只送頁面名稱（不送帳號、姓名）；分頁切到背景超過 2 分鐘不算；管理頁本身不算。
- 程式：`src/lib/online.js`（連線）、`src/lib/online-summary.js`（整理人數，有測試）、`src/pages/admin.astro`；`AuthGate.astro` 登入後啟動計算。
- 資料庫：`supabase/site_admins.sql`（資料表不開放，只開放 `is_site_admin()` 函式；要先用負責人的 Gmail 登入過一次才能執行）。
- CSP（`vercel.json`）的 `connect-src` 要有 `wss://*.supabase.co`，Realtime 才連得上。
- 隱私說明 `/about/` 已寫明匿名線上人數；若改變記錄內容要同步改。
- 問題回報管理（同在 `/admin/`）：列出回報、依狀態篩選（未結案／新回報／處理中／已修好／不處理／全部）、改狀態、寫備註（只有管理者看得到）。回報是匿名的，沒辦法直接回覆對方；對方有留聯絡方式時，管理者自己去聯絡，再把處理情形寫在備註。
- 資料庫：`supabase/admin_reports.sql`（要先執行 `issue_reports.sql`、`site_admins.sql`）。資料表仍然完全不開放，只有 `admin_list_reports()`、`admin_update_report()` 兩個函式，函式裡先檢查 `is_site_admin()`。用 pglite 測過：非管理者與 anon 都被拒絕，壞狀態、過長備註、找不到都有擋。畫面上回報內容一律用 `textContent` 顯示，不會執行裡面的 HTML。

- 使用統計（同在 `/admin/`，仿初光）：註冊人數、今天／近 7 天活躍人數、頁面瀏覽次數、近 14 天每天活躍人數長條圖、近 7 天最多人看的頁面。登入後每打開一頁（管理頁除外）由 `src/lib/usage.js` 呼叫 `log_visit()`；資料庫 `supabase/usage_stats.sql`（要先執行 `site_admins.sql`）：`usage_daily`（某天哪些帳號來過）與 `usage_pages`（某天某頁幾次）分開存、資料表完全不開放，無法對應「誰看了哪一頁」；只有管理者能呼叫 `admin_stats()`。日期以台灣時間算；頁面路徑只收簡單字元、一天最多 500 種。已用 pglite 測過權限與限制。隱私說明 `/about/` 已寫明。

## 其他

- commit 訊息、程式碼註解、PR 內容不要寫任何 AI 模型名稱。
