# 教學 3：NanoBanana 實作

本期內容將介紹如何透過新增 Gemini Web 的 Cookie，使 `CLIProxyAPI` 支援 `NanoBanana` 模型。

Gemini 的 `NanoBanana` 模型提供影像處理功能，但 Google 並未提供該模型的免費 API。CLIProxyAPI 可整合 Gemini Web，並以 API 形式使用 `NanoBanana`。

我們有兩種方法可以取得驗證資訊：

### 第一種方法

首先，使用 Google 帳號登入 [Gemini](https://gemini.google.com/app)。原始教學資料指出，一般帳號每天有 100 次影像產生配額，Pro 帳號則有 1,000 次。登入後，在瀏覽器中按 F12 開啟開發人員工具，並切換至「網路」(Network) 分頁。

![](https://img.072899.xyz/2025/09/074fcf1c455e99185ceeada71a27bd8c.png)

在篩選框中輸入 `List`，然後將滑鼠懸停在您的使用者頭像上。片刻之後，下方清單中應出現 `ListAccounts` 的項目。如果未出現，請重新整理頁面重試。

![](https://img.072899.xyz/2025/09/7cb7104fa93a6b6a6903e0745d3b5573.png)

點選 `ListAccounts`，在「標頭」 (Headers) -> 「請求標頭」 (Request Headers) 中找到 `Cookie`，並完整複製其值。

![](https://img.072899.xyz/2025/09/c2ba085f10fcb145aff7e9d5081b9382.png)

回到 `CLIProxyAPI` 程式所在的目錄，開啟終端或命令列，輸入命令 `cli-proxy-api --gemini-web-auth`。根據提示，貼上我們剛才複製的 `Cookie` 值並按 Enter，即可看到驗證成功的訊息，`Cookie` 已被自動儲存。

![](https://img.072899.xyz/2025/09/e149d07875cb8dab12de95f82d2b3e45.png)

### 第二種方法

若使用 macOS，或第一種方法驗證失敗，可能需要手動輸入 `__Secure-1PSID` 與 `__Secure-1PSIDTS`。請切換至「應用程式」(Application) 分頁，並依序複製圖中的這兩個值。

![](https://img.072899.xyz/2025/09/e5b5debae5ec74a31a1b527e506895e7.png)

![](https://img.072899.xyz/2025/09/7767f178e1186358f1a9a498108e5ac0.png)

在命令列執行驗證時，根據提示手動填入這兩個值即可完成驗證。

![](https://img.072899.xyz/2025/09/b02fb7704d5c67385d781f9d9893e0b2.png)

### 驗證步驟

接著驗證功能。目前程式僅支援透過 OpenAI 相容介面與 Gemini 原生介面進行文字生成圖片或圖文生成圖片。因此，先前在 `Cherry Studio` 中設定的供應商類型 `OpenAI Response` 必須改為 `OpenAI`。

![](https://img.072899.xyz/2025/09/48892cc3ce1e3c4379b694afa45c5d35.png)

新增模型 `NanoBanana` (即 `gemini-2.5-flash-image-preview`)。

![](https://img.072899.xyz/2025/09/4674845c6412ec6f5366d109070047fc.png)

現在，在 `Cherry Studio` 中測試一下吧！

![](https://img.072899.xyz/2025/09/fdd35aa92224cd76cbf888ce3ff2cce2.png)

若成功產生圖片，即表示設定完成。

### 注意事項

- ~~舊版應避免在 `CLIProxyAPI` 中新增多個 Gemini Web 帳號，因為輪替呼叫可能破壞工作階段的連續性並導致請求失敗。~~ 自 6.0.17 版起，程式支援 Gemini Web 黏著性工作階段，因此可新增多個帳號。
- 在 `Cherry Studio` 中，**切勿**在 `OpenAI Response` 供應商型別下新增 `NanoBanana` 模型。已知 `Cherry Studio` 在此情況下存在 Bug，會導致程式崩潰。
