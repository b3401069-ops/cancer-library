# 星夜癌症衛教書館：維護說明

每次維護請先讀這份說明，再只讀取、只修改需要的檔案。

## 檔案分工
| 檔案 | 內容 | 何時修改 |
| --- | --- | --- |
| data/cancers.js | 癌別清單：名稱、英文、主色、封面徽記、是否完成 | 新增癌別、文章完成時把 ready 改為 true |
| articles/<id>.js | 各癌別文章（固定九章） | 最常改：更新內容、影片、來源 |
| data/treatments.js | 治療小冊清單：名稱、顏色、圖示、適用癌別（cancers: "all" 或癌別 id 陣列） | 新增治療小冊時 |
| articles/tx-*.js | 治療小冊（kind: "booklet"），跨癌別共用；手術小冊依器官分開（如 tx-surgery-lung） | 更新治療內容、健保規定時 |
| js/lobby.js | 3D 書館（Three.js r128，放在 vendor/three.min.js，自行託管不經外部 CDN） | 只在調整動畫或風格時 |
| js/app.js | 切換頁面、文章排版、閱讀進度、備援書架、字體大小、列印版 | 調整文章版面時 |
| js/figures.js | 動畫圖解（SVG）與小圖示，所有癌別共用 | 新增圖解或圖示時 |
| js/figures-<id>.js | 某癌別專屬的圖解（目前有 figures-colorectal.js：colon、polyp、crcStage、colonSeg、stoma、egfrRas） | 該癌別需要專屬圖解時 |
| js/widgets.js | 互動工具：篩檢計算、檢查旅程、分期地圖、治療機轉、紅黃綠燈等 | 新增互動類型時 |
| data/site.js | 醫院名稱與癌症資源中心（服務項目、個管電話與分機、LINE、地點與路線、服務時間），所有頁面共用；紅黃綠燈的黃燈也會帶出個管電話 | 資源中心資訊變更時 |
| css/site.css | 全站樣式（書館、文章、圖解夜空石板、列印版、手機） | 調整視覺時 |
| index.html | 外框、載入哪些檔案 | 新增癌別時加一行 `<script src="articles/<id>.js">` |

## 新增一個癌別
1. data/cancers.js 加一筆（id、name、en、color、sigil、ready）。sigil 可用：lung、spiral、ribbon、leaf、wave、star。
2. 複製 articles/lung.js 為 articles/<id>.js，把 `ARTICLES.lung` 改成 `ARTICLES.<id>`，依九章格式填內容。
3. index.html 加一行 `<script src="articles/<id>.js"></script>`（有專屬圖解再加 `js/figures-<id>.js`，放在 figures.js 之後）。
4. 內容經醫師審核後，ready 改為 true，status 改為空字串或刪除，填上 reviewer 與 updated。

## 治療小冊
- 目前有：肺部手術、大腸直腸手術（含造口照顧）、放射治療、化學治療、標靶治療、免疫治療。藥物只寫類別，不寫藥名；每本都有「健保給付規定」一章。
- 小冊以網址 #tx-xxx 開啟；從某癌別文章點進去時，左上角返回鍵會回到該癌別。
- 癌別文章最後和第 4 章會自動列出適用的小冊（依 treatments.js 的 cancers 欄位）。
- 小冊可用 `videosFrom: "lung"` 借用某癌別的影片清單；新癌別有自己的影片時，在小冊裡加對應的 videos 區塊。
- 新增癌別時：在 treatments.js 把共用小冊的 cancers 維持 "all" 即可；需要該癌別專屬手術小冊時，新增 tx-surgery-<id>.js。
- 共用小冊裡某癌別專屬的區塊加上 `only: "<癌別 id>"`：從其他癌別點進來時不顯示，直接開啟小冊時全部顯示。影片區塊加 `from: "<癌別 id>"` 就會用那個癌別的影片清單。
- 專屬某癌別的小冊（cancers 只列一個癌別），返回鍵一律回到該癌別。
- 健保規定常變動，建議每季檢查一次。

## 文章區塊類型
文章最上方可放 `facts`（三個重點數字）。每章可設 `emblem`（章節圖示名稱）與 `intro`（一句導言）。
- 基本：p、h3（章內小標）、list、callout（level: info / danger）、table、steps、faq、video、sources
- 動畫圖解：figure，id 可用 breathe（呼吸與肺泡氣體交換）、cells（細胞分裂）、genes（標靶阻斷生長訊號）、plate（國健署我的餐盤）；治療動畫用 mech:surgery、mech:radiation、mech:chemo、mech:immuno
- 互動工具（js/widgets.js）：tabs、risks、symptoms、screening（肺癌篩檢資格）、journey（檢查旅程）、tnm、stagemap（分期地圖，目前為肺部）、paths（治療路徑）、mechanisms（治療機轉動畫：surgery、radiation、chemo、targeted、immuno）、checklist（看診問題，勾選存在使用者自己的瀏覽器）、videos（分集影片卡）、booklets（治療小冊入口）、cycle（化療 21 天週期）、resections（手術切除範圍動畫）、approaches（手術方式）、rttech（放射治療技術比較）、combos（免疫治療合併方式）、bodymap（全身圖點選看免疫副作用，熱點座標 x/y 以 220×440 人形為準）、quiz（小測驗，a 為正確選項的序號，從 0 開始）、resource（本院癌症資源中心）、triage（紅黃綠燈）、sidefx（依治療看副作用）、quit（戒菸時間軸）、breathe（噘嘴呼吸練習，含吸氣、吹蠟燭動畫）
- 共用工具的參數：stagemap 用 `fig` 指定分期圖（肺癌預設、大腸直腸用 crcStage）；resections 用 `fig` 指定圖解、`label` 選單名稱、`dl` 額外欄位（大腸手術用 colonSeg、造口用 stoma）；mechanisms 每項可用 `fig`、`arg` 換圖；screening 用 `kind: "crc"` 變成大腸癌糞便潛血資格；quiz 用 `topic` 指定完成時的癌別名稱；journey 站數不限。
- 其他癌別若需要專屬圖解（例如大腸、乳房分期圖），在 js/figures.js 新增，再於文章引用。

## 導覽
- 從癌別文章點進治療小冊，再按左上角或左下角「回到《肺癌》」，會回到剛才讀到的位置，選單也會停在剛才選的項目。
- 治療路徑、治療機轉等選單在電腦上會固定在畫面上方；每個面板底部有「上一個／回到選單／下一個」。

## 發佈
- 正式網址：https://cancer-library.mingneo.dev/ ，肺癌直達加 #lung（Cloudflare Pages，連動 GitHub main 分支自動部署；備用網址 https://cancer-library.pages.dev/）。
- 原始檔在 GitHub 專案 b3401069-ops/cancer-library 的 main 分支；推送後約 1 分鐘 Cloudflare 自動重新部署，網址與 QR code 不變。
- index.html 在 GitHub 版需要完整的 `<!doctype html>`、`<head>`、`<body>` 外框（claude.ai 預覽版由平台自動加上）。
- claude.ai 上的預覽版只給自己看；要給別人看一律用 cancer-library.mingneo.dev。
- 草稿期間 index.html 有 `<meta name="robots" content="noindex, nofollow">`，搜尋引擎不會收錄；正式上線時刪除。
- GitHub 專案是公開的：程式碼與內容任何人都看得到，不可放入任何病人資料。
- img/logo.png 為院徽，院方同意使用（2026-10-21）。

## 平台限制
- 發佈的網頁不能嵌入 YouTube 播放器，影片以連結卡片呈現，點擊後在 YouTube 開啟。
- 網頁不能自己開啟列印視窗；「列印版」按鈕切換成適合列印的版面，再由使用者用瀏覽器選單列印。
- 網站不載入任何外部程式：Three.js 放在 vendor/ 自行託管（2026-10-22 起）。外部只連 Google Fonts 字型。圖片請用 SVG 內嵌或放在網站檔案中。
- 純靜態網站：沒有 PHP、資料庫、表單或登入，不收集任何資料。Cloudflare 的安全標頭設定在 GitHub 版的 _headers 檔。

## 規則
- 台灣慣用醫療用語，避免中國用語。
- 醫學內容附參考來源，上線前由建銘審核。
- 每篇頁尾保留免責聲明。
