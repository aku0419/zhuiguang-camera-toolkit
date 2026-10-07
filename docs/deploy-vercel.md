# 部署到 Vercel，並綁定 zhuiguang.riseatsun.com

> 給負責人照著做。**這是全新的 Vercel 專案，不會動到初光。**
> 全程不需要把任何金鑰傳給 Claude。預計 15～20 分鐘（DNS 生效可能再等幾分鐘到幾小時）。

## 步驟 1：在 Vercel 匯入專案

1. 打開 https://vercel.com/dashboard ，登入。
2. 按 **Add New…** → **Project**。
3. 在 **Import Git Repository** 找到 **aku0419/zhuiguang-camera-toolkit**。
   - 找不到的話，按 **Adjust GitHub App Permissions**，在 GitHub 頁面的「Repository access」勾選這個專案，儲存後回來。
   - **請不要勾選或動到 film-production-tool（初光）。**
4. 按 **Import**。
5. 設定頁面（大部分保持預設就好）：
   - **Project Name**：`zhuiguang-camera-toolkit`
   - **Framework Preset**：應該會自動偵測成 **Astro**。如果沒有，手動選 Astro。
   - **Root Directory**：保持 `./`
   - **Build Command / Output Directory**：保持預設（Astro 會自動填 `npm run build`、`dist`）
6. 先**不要**按 Deploy。展開 **Environment Variables**，照 `docs/supabase-setup.md` 步驟 4 新增 `PUBLIC_SUPABASE_URL` 與 `PUBLIC_SUPABASE_KEY`。
   - 還沒建好 Supabase 的話可以先跳過，網站照樣能用，只是「回報問題」會顯示「暫時無法送出」。之後補上再 Redeploy 就好。
7. 按 **Deploy**，等 1～2 分鐘，出現慶祝畫面。

## 步驟 2：確認 Node 版本

1. 專案頁 → **Settings** → **General**。
2. 找到 **Node.js Version**，選 **22.x**（逐光需要 22.12 以上）。
3. 如果剛剛改了，到 **Deployments** 對最新一筆按 **Redeploy**。

## 步驟 3：先用 Vercel 給的網址檢查

部署完成後，Vercel 會給一個像 `zhuiguang-camera-toolkit.vercel.app` 的網址。打開它，確認：
- 首頁、攝影機列表、任一台相機、五個工具都正常。
- 手機也開開看。

## 步驟 4：加入網域 zhuiguang.riseatsun.com

1. 專案頁 → **Settings** → **Domains**。
2. 輸入 `zhuiguang.riseatsun.com`，按 **Add**。
3. Vercel 會告訴你要加一筆 DNS 記錄，通常是：

   | Type | Name（Host） | Value |
   |---|---|---|
   | CNAME | `zhuiguang` | Vercel 顯示的值（常見是 `cname.vercel-dns.com`，**以 Vercel 畫面上顯示的為準**） |

## 步驟 5：到 Namecheap 加 DNS 記錄

1. 打開 https://www.namecheap.com ，登入，左邊點 **Domain List**。
2. 找到 **riseatsun.com**，按右邊 **Manage**。
3. 上方點 **Advanced DNS** 分頁。
4. 在 **Host Records** 區，按 **Add New Record**：
   - **Type**：`CNAME Record`
   - **Host**：`zhuiguang`
   - **Value**：貼上 Vercel 顯示的值
   - **TTL**：`Automatic`
5. 按右邊綠色打勾儲存。
6. **請不要修改或刪除 `firstlight` 那一筆**（初光用的），也不要動其他現有記錄。

## 步驟 6：等待生效

1. 回到 Vercel 的 **Domains** 頁，`zhuiguang.riseatsun.com` 旁邊會從「Invalid Configuration」變成打勾（通常幾分鐘，最久幾小時）。
2. 打勾後，Vercel 會自動申請 HTTPS 憑證，不用另外設定。
3. 打開 https://zhuiguang.riseatsun.com 確認。

## 之後的日常

- 程式有更新（合併到 `main`）時，Vercel 會**自動重新部署**。
- Claude 在分支上做的修改，Vercel 會自動產生**預覽網址**（在 GitHub 分支或 Vercel 的 Deployments 頁看得到），可以在手機上直接測試，滿意再合併到 main。
- 網站完成後可以到 Google Search Console 提交 `https://zhuiguang.riseatsun.com/sitemap-index.xml`，讓 Google 更快收錄。（需要時跟 Claude 說，我會一步一步帶。）
