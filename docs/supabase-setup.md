# 設定「問題回報」（Supabase）

> 這份是給負責人照著做的。**全程不需要把任何密碼或金鑰傳給 Claude。**
> 逐光用的是**全新的 Supabase 專案**，跟初光的專案完全分開，不會影響初光。
> 預計花 10～15 分鐘。

## 事前說明：用到哪幾種「鑰匙」

| 名稱 | 要不要用 | 說明 |
|---|---|---|
| Project URL | 要 | 專案網址，不是秘密 |
| Publishable key（`sb_publishable_…`） | 要 | **公開金鑰**，本來就會出現在網頁裡，貼到 Vercel |
| Secret key（`sb_secret_…`） | **不要碰** | 絕對不要貼到任何地方，也不要傳給任何人 |
| 資料庫密碼 | 只需要自己存好 | 建立專案時產生，存在你的密碼管理員。網站用不到 |

資料的安全不是靠金鑰藏起來，而是靠資料庫設定：訪客**只能呼叫一個函式送出回報**，而且有長度和次數限制，**不能讀取、修改、刪除任何東西**。

## 步驟 1：建立新的 Supabase 專案

> **名額限制：** Supabase 免費方案，**每個帳號最多同時 2 個運作中的專案**。如果畫面出現「members who have exceeded their free project limits」，表示你的帳號已經有 2 個了。處理方式：
> - 有不用的測試專案 → 到那個專案 **Project Settings → General**，按 **Pause project**（暫停不計名額，之後可以 Restore）。
> - 兩個都在用 → 用另一個 Email 註冊**新的 Supabase 帳號**來建逐光的專案，並把這個帳號記在密碼管理員。
> - **初光的專案（網址列 `project/kibbcydfbuqwdssngfmz`）絕對不要暫停或刪除。**

1. 打開 https://supabase.com/dashboard ，用你平常的帳號登入。
2. 按右上角 **New project**（新增專案）。
3. 選組織（Organization）：用你平常那個就可以。
4. 填寫：
   - **Name**：`zhuiguang`
   - **Database Password**：按旁邊的 **Generate a password** 讓它產生一組，**複製後存到你的密碼管理員**（之後幾乎用不到，但請存好）。
   - **Region**：選 **Northeast Asia (Tokyo)**（離台灣近）。
   - **GitHub (optional)**：不用管，不要按 Connect GitHub。
   - **Security** 三個選項：
     - **Enable Data API**：**保持勾選**（回報按鈕靠它送出，取消就送不出去）。
     - **Automatically expose new tables**：**取消勾選**（Supabase 也建議關閉；我們的資料表要完全不開放，只開放一個送出函式）。
     - **Enable automatic RLS**：建議**勾選**（之後新增資料表時自動套上保護，多一層保險）。
5. 按 **Create new project**，等 1～2 分鐘，直到畫面不再轉圈圈。

## 步驟 2：貼上 SQL（建立資料表與送出函式）

1. 左邊選單點 **SQL Editor**。
2. 按 **New query**（新增查詢）。
3. 到 GitHub 的 `zhuiguang-camera-toolkit` 專案，打開 `supabase/issue_reports.sql`，**整份複製**。
4. 貼到 SQL Editor，按右下角 **Run**。
5. 下方出現 **Success. No rows returned** 就完成了。
   - 重複按幾次 Run 也沒關係，不會弄壞資料。
   - 如果出現紅色錯誤，把錯誤文字複製給 Claude 就好（不含任何金鑰）。

> **目前的設定順序**（問題回報改成要登入、加上管理頁之後）：到 SQL Editor 依序貼上並 Run 這幾份，每份都可以重複執行：
> 1. `supabase/issue_reports.sql`　2. `supabase/site_admins.sql`（要先用你的 Gmail 登入過逐光一次）　3. `supabase/admin_reports.sql`　4. `supabase/issue_reports_login.sql`　5. `supabase/usage_stats.sql`
> 後面三份是之後新增功能時才需要的，已經執行過的不用重做。

## 步驟 3：複製「專案網址」和「公開金鑰」

1. 左下角點 **Project Settings**（齒輪圖示）。
2. 點 **API Keys**（有些版本叫 **API**）。
3. 找到：
   - **Project URL**：像 `https://xxxxxxxx.supabase.co`，複製起來。
   - **Publishable key**：以 `sb_publishable_` 開頭，複製起來。
     - 如果畫面只看到舊式的 `anon` `public` 金鑰，也可以用那個。
     - **不要複製 Secret key**（`sb_secret_` 開頭、或標著 `service_role` 的那個）。

## 步驟 4：貼到 Vercel

1. 打開 https://vercel.com/dashboard ，進入「逐光」專案（還沒建立專案的話，先照 `docs/deploy-vercel.md` 做）。
2. 上方點 **Settings** → 左邊點 **Environment Variables**。
3. 新增兩筆（**Environments** 三個都勾：Production、Preview、Development）：

   | Key（名稱，要完全一樣） | Value（值） |
   |---|---|
   | `PUBLIC_SUPABASE_URL` | 步驟 3 的 Project URL |
   | `PUBLIC_SUPABASE_KEY` | 步驟 3 的 Publishable key |

4. 按 **Save**。
5. 上方點 **Deployments**，找到最上面那筆，按右邊 **⋯** → **Redeploy**（重新部署），讓新設定生效。

## 步驟 5：測試

1. 打開網站任一頁，按右下角橘色的「**回報問題**」。
2. 類型選「建議」，內容寫「這是測試」，按**送出**。
3. 應該會看到「已收到，謝謝你！」。
4. 回到 Supabase → 左邊 **Table Editor** → 點 **issue_reports**，應該看到剛剛那一筆。
5. 測試資料可以刪掉：點那一列 → 按右鍵或上方垃圾桶 → Delete。

## 日常：怎麼看回報

- Supabase → **Table Editor** → **issue_reports**，最新的在最上面。
- 每一筆有：類型、說明、聯絡方式（如果對方有填）、回報的頁面、裝置、時間。
- 處理完可以把 `status` 欄改成「處理中」「已修好」「不處理」，只是給你自己做記號，網站不會顯示。
- 如果有人亂灌，直接在 Table Editor 選取那些列刪除即可。系統本身已經限制：
  - 說明 5～2000 字、聯絡方式最多 200 字
  - 同一個來源 10 分鐘最多 5 則
  - 全站一天最多 300 則
  - 資料表累積 5000 則就暫停收件（清掉舊的就會恢復）

## 免費方案要知道的事

- **一週沒有任何使用，Supabase 會自動暫停專案。** 暫停後，回報會送不出去。解法：登入 Supabase，在專案頁按 **Restore project**。網站本身（查資料、算數字）完全不受影響，因為那些不需要資料庫。
- 暫停後資料不會消失，Restore 就回來了。
- 如果你覺得每週手動看一次太麻煩，告訴 Claude，可以加一個每週自動「打招呼」的設定（需要你在 GitHub 貼一次公開金鑰）。

## 隱私：我們收了什麼

送出回報時，網站會記錄：你填的內容、你選的類型、你填的聯絡方式（選填）、當下的頁面網址、裝置與瀏覽器種類（例如「iOS・Safari・390×844」），以及一個**由來源 IP 算出的雜湊值**（只用來限制短時間內的重複送出，無法還原成 IP）。不記錄 IP 本身。這些說明已經寫在網站的「關於逐光」頁。
