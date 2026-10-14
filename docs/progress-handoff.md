# 逐光｜攝影工具組：目前進度（交接用）

更新日期：2026-10-14　｜　程式庫：`aku0419/zhuiguang-camera-toolkit`　｜　`main` 最新：`ceb2c9a`（開發分支 `claude/nice-ptolemy-8p88wf` 與 `main` 相同）

> 接手的 Claude：先讀程式庫根目錄的 `CLAUDE.md`（規則與已確定決定，與計畫書不同時以它為準），再看這份。

## 1. 專案是什麼
給台灣攝影／影視科系學生用的**免費**攝影機資料庫＋計算工具。網址 https://zhuiguang.riseatsun.com 。
目前是**封閉測試**：要用 Google（Gmail）登入才能使用整站，只有負責人手動加進「測試使用者」的帳號能登入；`robots.txt` 禁止收錄，但放行聊天軟體的連結預覽。
逐光與「初光」完全獨立（程式庫、Vercel、Supabase 都分開）；初光只能唯讀參考，絕不修改。

## 2. 跟負責人合作的規則
- 負責人不是工程師：用**繁體中文、台灣用語、白話**，需要他做的事寫成一步一步的說明。
- **絕對不要跟他要任何密碼、secret key、API key**；金鑰請他自己貼到 Vercel／Supabase 後台。
- 修改都在分支做；給 1280 寬與 390 寬的檢查；**他說「可以」才合併到 `main`**。
- 規格只採原廠資料，標 `source_url`、`source_name`、`last_verified`；查不到寫 `Unknown`，不猜。不放器材照片、不放價格。
- 不要寫「第幾階段」，只說「預計增加」。commit／程式碼不寫 AI 模型名稱。
- 台灣用語：新增、檢視、資料、設定、連結、產生、聯絡、剪接、調光、器材；接環、防手震、超音波馬達、檢查碼、格率；地名用「台」。

## 3. 技術與指令
Astro 靜態網站（Node ≥ 22.12）＋ Vercel；登入牆用 supabase-js（Google OAuth）；計算全在瀏覽器。
- `npm install`／`npm run dev`／`npm run build`／`npm test`（28 個測試）
- 資料是 JSON，建置時有格式檢查（`src/lib/cameras.js`、`media.js`、`lenses.js`、`film.js`），填錯建置會失敗。
- 所有算式只寫在 `src/lib/calc.js`，網頁和測試共用。
- Vercel 環境變數：`PUBLIC_SUPABASE_URL`、`PUBLIC_SUPABASE_KEY`（只放公開金鑰）。

## 4. 已完成
**資料**
- 攝影機 28 台（錄影模式列表；Sony FX3／A7S III／A7 IV／A7 V／FX30／ZV-E1 已補 24p／30p，FX5、FX6 也已補）
- 鏡頭 477 支、11 個品牌（Sony、Canon、Nikon、Sigma、Tamron、Viltrox、Panasonic、Fujifilm、ARRI、Cooke、Zeiss）
- 記憶卡格式 11 種（SD 系列、UHS、影片速度等級、CFexpress A／B、VPG、CFast、XQD、CompactDrive、RED PRO CFexpress）
- 底片：10 種片幅對照（Kodak 官方）、Kodak 現售拍攝用底片 8 種
- 名詞小辭典 39 個名詞

**工具（20 個）**：快門角度、升降格、等效焦段、錄影容量（含記憶卡可錄時間）、ND 減光、畫面比例（含變形鏡頭）、景深、景深對照表（可列印）、曝光級數、視角（含拍攝距離）、戶外曝光速查、拍攝日素材量、色溫換算、照度換算、時間碼計算、底片長度、底片曝光補償、底片成本粗估、攝影助理檢查清單（可勾選、列印）。

**網站功能**：全站搜尋（第一次點才下載索引）、首頁「遇到什麼問題？」入口、相機頁「這台能拍什麼」與寫入速度估算、鏡頭列表篩選、頁尾免責說明與自願斗內（綠界）、隱私權政策／服務條款（不用登入可看）、關於頁。

**問題回報與管理（Supabase）**
- 回報要登入才能送，使用者可在「我的回報」看狀態與管理者回覆。
- `/admin/`（只有管理者看得到入口）：現在線上人數、使用統計（註冊、活躍、頁面瀏覽、14 天長條圖、熱門頁）、回報管理（篩選、改狀態、回覆、備註）。
- SQL 執行順序（皆可重複執行，**負責人都已執行**）：`issue_reports.sql` → `site_admins.sql` → `admin_reports.sql` → `issue_reports_login.sql` → `usage_stats.sql`。資料表全部不開放，只開放函式。
- 說明文件：`docs/supabase-setup.md`、`docs/deploy-vercel.md`、`docs/google-login-setup.md`。

## 5. 已知注意事項
- FX6 的 HD XAVC-I 59.94p：說明書 223 Mbps、Sony 支援文章 222 Mbps，目前採說明書值並記在 `editor_notes`，待負責人核對。FX6 各格率位元率來自 Sony 支援文章與第三方資料，信心較低。
- 部分機型 24p／30p 的「裁切」標記是沿用既有列，未逐列重新查證。
- 隱私權政策與服務條款沒有經過法律專業審閱（遵循台灣法規；Supabase 區域為東京；未公開聯絡 Email，只用「回報問題」或 riseatsun.com）。
- 對焦（AF）欄位目前 Sony、Nikon 一律 `Unknown`、不顯示。
- 代理網路：新網域要負責人加進允許清單；`WebFetch` 失敗時可試 `curl --cacert /root/.ccr/ca-bundle.crt`。

## 6. 目前狀態與待辦
**現在：** 等學生測試，回饋從 `/admin/` 的回報管理看。有缺的機型／格率，依回報再補（先做熱門的）。

**尚未開始（負責人要求才做）**
- Log／LUT 說明頁（需先查官方資料）
- ORWO 黑白電影底片（需官方資料，並先確認網域已允許）
- 各品牌先跳過的系列：Viltrox 舊款、ARRI Master／Ultra Prime／Ultra Wide Zoom／Ensō、Zeiss Horizon／Aatma／Panoptes 與攝影鏡頭、Cooke 5/i、Canon CN-E 變焦、Nikon 超望遠、Sigma 長焦／魚眼、Fujifilm 500mm／T/S／增距鏡／Premista；Sirui／Laowa 暫不做
- 其他攝影機補 24p／30p 列
- 正式公開前：Google 登入從測試模式改正式發布、政策文件請專業人士看過、確認 Supabase 用量與方案
