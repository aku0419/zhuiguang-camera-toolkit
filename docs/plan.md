# 逐光｜攝影工具組 計畫書（負責人原文，2026-10-06 提供）

> 這份是負責人提供的計畫書原文存檔，之後的對話以這份為準。
> 計畫書之後另有確定的決定，記在 `CLAUDE.md`；兩者不同時，以 `CLAUDE.md` 為準。

我要開發第二套免費給影視科學生使用的網站工具。

目前我已經有一套：First Light｜初光 製片工具包 https://firstlight.riseatsun.com/

初光目前使用：Claude 協助開發、GitHub（程式碼與版本管理）、Vercel（網站部署）、Supabase（資料庫／Google 登入）、Namecheap（DNS）、子網域 firstlight.riseatsun.com。

現在我要做第二套獨立網站：「逐光｜攝影工具組」，預計網址 https://zhuiguang.riseatsun.com/

這是一套免費給影視科學生、剛開始學攝影的人、學生劇組、獨立影像工作者使用的中文攝影工具與資料庫。

網站核心原則很簡單：「打開就會用，需要的資料快速找到。」

不要做得太複雜，不要做成大型 SaaS，也不要一開始做成完整器材百科。希望像 First Light 一樣，可以快速完成第一版，再慢慢增加功能。

網站完全免費，不鎖功能、不做付費會員。未來只會放「請我喝杯咖啡」形式的自願斗內，不影響使用。

## 一、網站主要架構

首頁先分成五個區域：

1. CAMERAS 攝影機資料庫
2. LENSES 鏡頭資料庫
3. MEDIA 記憶卡／儲存媒體
4. FILM 電影底片
5. TOOLS 攝影計算工具

網站以 Mobile First 為主，因為很多學生會在教室、器材店、片場直接用手機查。

## 二、攝影機資料庫

第一版先收錄常見品牌：Sony、Canon、Panasonic、Blackmagic Design、Fujifilm、Nikon、DJI、RED、ARRI。

第一版不用做幾百台，先約 30～50 台常用機型。

每台攝影機至少包含：品牌、型號、類型、Sensor Size、Sensor Resolution、最大錄影解析度、最大 Frame Rate、Codec、Bit Depth、Chroma Subsampling、RAW、Log、Base ISO / Dual Base ISO、Lens Mount、Media、Timecode、SDI、HDMI、Open Gate、官方產品頁、最後確認日期。

重要規格不要自行猜測，優先使用：1. 原廠網站 2. 原廠 Manual 3. 官方 Support Document。如果不確定就標 Unknown。

## 三、鏡頭資料庫

第一版先做常用品牌／系列：Sony G Master、Canon RF / RF L / CN-E、Sigma Art / Cine、Tamron、Zeiss CP.3 / Supreme Prime、ARRI Signature Prime、Cooke S4 / S8。

鏡頭資料包含：品牌、系列、型號、Prime / Zoom、焦段、最大光圈 / T-stop、Lens Mount、Coverage、Image Circle（有資料再填）、Autofocus、Minimum Focus、Filter Thread、Front Diameter、Weight。

第一版重點是讓學生知道：「這是什麼鏡頭？」「能不能裝？」「能不能 Cover 我的 Sensor？」

## 四、記憶卡／儲存媒體

第一版包含：SD、SDHC、SDXC、UHS-I、UHS-II、V30、V60、V90、CFexpress Type A、CFexpress Type B、CFast 2.0、XQD、RED Media、Codex Compact Drive。

先以「格式規格」為主，不用一開始收所有品牌與 SKU。

資料至少包含：格式、Bus、最低持續寫入速度、常見用途、常見錄影格式需求。

## 五、電影底片

第一版先收錄 Kodak 常見電影底片：VISION3 50D、VISION3 200T、VISION3 250D、VISION3 500T、EKTACHROME 100D。

支援格式：Super 8、16mm、Super 16、35mm。

資料包含：名稱、ISO、Daylight / Tungsten、色溫、格式、基本特性、適合情境、官方資料。

## 六、第一版攝影工具

1. 快門角度計算器：輸入 FPS、Shutter Angle；輸出 Shutter Speed。例如 24fps + 180° → 1/48 sec，並提示接近 1/50 sec。
2. 升降格計算器：輸入拍攝 FPS、Timeline FPS。例如 60fps → 24fps，輸出播放速度 40%、慢動作倍率 2.5×。
3. 等效焦段計算器：支援 Full Frame、Super35、APS-C Sony、APS-C Canon、M43、1 inch。例如 Sony APS-C 35mm → 約 52.5mm Full Frame Equivalent。
4. 錄影容量計算器：輸入 Bitrate、拍攝時間。例如 200 Mbps、3 小時 → 約 270GB。
5. 記憶卡錄影時間計算器：輸入 Card Capacity、Bitrate。例如 256GB、400 Mbps → 可錄多久。

第二階段再加入：6. ND 計算器 7. 畫面比例計算器 8. Film Runtime Calculator 9. 景深計算器 10. 曝光 Stop 計算器。

## 七、資料與工具要互相連動

逐光不要只是百科。例如進入 Sony FX3 頁面後，可以直接看到：規格、支援的 Media、Lens Mount、錄影格式、快速進入容量計算、升降格計算、焦段換算。

網站的重點是：「查資料後，可以直接解決問題。」

## 八、搜尋

首頁需要簡單的全站搜尋。例如：FX3、V90、500T、24-70，可以搜尋 Camera、Lens、Media、Film。第一版不用 AI Search，普通 keyword search 就可以。

## 九、資料架構

第一版器材資料優先使用靜態資料，例如 /src/data/cameras.json、/src/data/lenses.json、/src/data/media.json、/src/data/film.json，或 TypeScript data files。

不要一開始把所有器材資料放 Supabase。原因：讀取多、修改少、快、穩定、免費、好維護、減少資料庫使用量。

## 十、Supabase

第一版甚至可以先不接 Supabase。等主要網站和工具完成後，再考慮加入：Google Login、Favorites、使用者回報錯誤、Beta Tester、我的常用器材。

攝影機查詢、鏡頭查詢、底片資料、計算器：全部不需要登入就可以使用。不要讓登入變成使用門檻。

## 十一、工程架構

逐光必須是獨立專案。不要修改 First Light。請建立獨立 GitHub Repository、獨立 Vercel Project。建議 Repository：zhuiguang-camera-toolkit。未來正式網址：zhuiguang.riseatsun.com。

可以參考 First Light 的 framework、UI、layout、responsive design、auth flow、Vercel config、Supabase config，但不要直接修改 First Light 的正式 repo 或 production 設定。

## 十二、第一階段 MVP

第一階段不要一次做完全部。先完成：首頁、Navigation、Mobile Responsive、Camera Database、約 10 台攝影機測試資料、Tools 首頁。

先完成 5 個工具：1. 快門角度 2. 升降格 3. 焦段換算 4. 錄影容量 5. 記憶卡錄影時間。

目標是先確認：網站好不好用、手機操作順不順、資料呈現清不清楚。

## 十三、第二階段

再加入：Lens Database、Media Database、Film Database、ND Calculator、Aspect Ratio Calculator、Film Runtime Calculator。攝影機增加到約 30～50 台。

## 十四、未來 Roadmap

下面先列著，但不要第一版就做：Camera Compare、Lens Compatibility、Camera Recording Format Wizard、我的器材庫、Favorites、Camera Package Builder、Lighting Calculator、Timecode Calculator、Sensor / Crop 視覺化、Codec 教學、原生 ISO 教學。

不要 Over-engineering。

## 十五、資料正確性

逐光會被學生當學習工具，所以正確性很重要。每筆器材資料最好保留 source_url、source_name、last_verified（例如 source_name: Sony Official、last_verified: 2026-10-06）。

如果規格因 Firmware 可能改變，要保留最後確認日期。

Dynamic Range 這種數據，如果不同來源差很多，不要當絕對值，可以標：Manufacturer Claimed DR。

不要把 AI 記憶當作正式規格來源。

## 十六、網站免責

Footer 可以放：「逐光資料整理自原廠公開資訊，實際錄影格式、記憶卡需求與相容性可能因韌體版本而異，重要拍攝前請以原廠最新文件為準。」

## 十七、成功標準

第一版不是看資料有多少。成功標準是：學生第一次進網站，不需要教學，就可以在 30 秒內解決一個攝影問題。例如：「60fps 放到 24fps 是幾％？」「APS-C 35mm 等效多少？」「200Mbps 拍三小時需要多少容量？」「這台攝影機用什麼記憶卡？」做到這件事就夠了。

## 十八、請你現在先做的事

先不要直接寫大量程式碼。請先：

1. 分析這份計畫
2. 提出你認為第一版最合理的 MVP
3. 建議技術架構
4. 如果能看到 First Light 原始碼，先分析哪些架構可以參考
5. 列出逐光第一階段需要建立的頁面、Route、Component、Data Structure
6. 告訴我哪些功能你建議延後
7. 確認整體架構簡單、可以快速完成
8. 然後再開始實作

最重要：不要 Over-engineering。如果有兩種方案：A 很完整但複雜、B 簡單但夠用，優先選 B。

另外，First Light 已經是正式使用中的網站。任何操作都不得修改、刪除或破壞 First Light 的 GitHub、Supabase、Vercel、DNS、正式資料。逐光必須視為一個全新的獨立專案。
