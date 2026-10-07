# 設定 Google 登入（給負責人，一步一步照做）

逐光用 Supabase 的 Google 登入。**不需要把任何金鑰傳給 Claude**，全部都是你自己貼到後台。
這份設定只動「逐光」自己的 Supabase 和你新建的 Google 登入設定，**不要修改初光那一組**。

## 一、在 Google 後台建立登入設定

1. 打開 https://console.cloud.google.com/ ，用你的 Google 帳號登入。
2. 最上方選專案。**建議新建一個專案**叫「逐光」（避免動到初光的設定）：專案選單 → 新增專案 → 名稱填「逐光」→ 建立。
3. 左邊選單 → **API 和服務** → **OAuth 同意畫面**（有些版本叫 Google Auth Platform → 品牌塑造）。
   - 應用程式名稱：逐光｜攝影工具組
   - 使用者支援電子郵件：選你自己的 Gmail
   - 對象選 **外部**，開發人員聯絡資訊填你的 Gmail，儲存。
   - **發布狀態保持「測試中」**，不要按發布（先封閉測試）。
4. **對象**（Audience）頁面 → **測試使用者** → 新增使用者：把允許登入的 Gmail 一個一個加進去（含你自己）。只有名單內的人能登入，上限 100 人。
5. 左邊 **憑證**（Clients）→ 建立憑證 / 建立用戶端 → **OAuth 用戶端 ID** → 應用程式類型選 **網頁應用程式**。
   - 名稱：逐光
   - **已授權的重新導向 URI**：貼上 Supabase 給的網址。取得方式：
     Supabase 後台 → 逐光專案 → **Authentication** → **Sign In / Providers**（或 Providers）→ **Google** → 會看到 **Callback URL (for OAuth)**，長得像 `https://xxxx.supabase.co/auth/v1/callback`，複製貼過來。
   - 按建立。畫面會出現「用戶端 ID」和「用戶端密鑰」。**先不要關掉。**

## 二、貼到 Supabase

1. Supabase 後台 → 逐光專案 → Authentication → Sign In / Providers → **Google**。
2. 打開 **Enable Sign in with Google**。
3. 把「用戶端 ID」貼到 **Client IDs**，「用戶端密鑰」貼到 **Client Secret**。按 **Save**。（這些只貼在這裡，不要傳給任何人，包括 Claude。）

## 三、設定允許的網址

Supabase 後台 → Authentication → **URL Configuration**：
- **Site URL**：`https://zhuiguang.riseatsun.com`
- **Redirect URLs** 新增：
  - `https://zhuiguang.riseatsun.com/login/`
  - `https://zhuiguang-camera-toolkit.vercel.app/login/`（備用網址，不需要可略過）
  - `http://localhost:4321/login/`（只在本機測試用，不需要可略過）

## 四、測試

1. 網站程式合併後，開 https://zhuiguang.riseatsun.com ，會自動跳到登入頁。
2. 按「用 Google 帳號登入」，選有加進測試使用者的 Gmail。
3. Google 會顯示「這個應用程式未經 Google 驗證」，這是測試模式的正常現象：按「進階」→「前往逐光（不安全）」→ 繼續即可。
4. 登入後會回到網站，右上角會顯示你的 Email 和「登出」。

## 新增測試的學生

Google 後台 → OAuth 同意畫面 → 對象 → 測試使用者 → 新增 Gmail。加完對方就能登入，不需要改程式。

## 日後要公開時

要把「發布狀態」改成正式發布，Google 可能要求隱私權政策網址、服務條款網址與網域驗證。到那時再跟 Claude 說，我會一步一步帶你。
