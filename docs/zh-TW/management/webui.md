# Web UI

專案位址：[Cli-Proxy-API-Management-Center](https://github.com/router-for-me/Cli-Proxy-API-Management-Center)

這是 CLIProxyAPI 官方提供的網頁管理介面。

預設網址：`http://localhost:8317/management.html`

設定 `remote-management.disable-control-panel` 為 `true` 時，伺服器將跳過下載 `management.html`，且 `/management.html` 會傳回 404，從而停用內建管理介面。

你可以透過設定環境變數 `MANAGEMENT_STATIC_PATH` 來指定 `management.html` 的儲存目錄。

## 連線資訊儲存與外掛資源頁

官方管理中心會將連線狀態存入目前來源的瀏覽器 `localStorage`。服務位址會保留，方便下次重新連線。只有在使用者啟用「記住密碼」，或遷移舊版已儲存的工作階段時，才會保留管理金鑰。儲存值只經過可逆的混淆處理，不能視為加密安全邊界。

當管理中心和 CLIProxyAPI 位於相同來源時，從 `/v0/resource/plugins/<pluginID>/...` 載入的外掛資源頁也位於該來源。受信任的外掛資源頁可以讀取同一份 `localStorage`，並重複使用其中的管理金鑰呼叫 `/v0/management/...`。

安裝並啟用帶資源頁的外掛，應視為信任該外掛的瀏覽器端程式碼可以存取目前管理會話。外掛資源頁應打包自己的 JavaScript，不應載入第三方指令碼，因為同源頁面中的任何指令碼都可以讀取同源儲存裡的管理上下文。

如果管理中心與 CLIProxyAPI 部署在不同來源，瀏覽器的同源政策會阻止外掛資源 iframe 讀取管理中心來源的 `localStorage`。在這種部署方式下，外掛頁面應處理缺少管理金鑰的情況，並提示使用者開啟同源管理頁面或重新登入。

## 使用自訂 Web UI

現在支援從自訂 GitHub 儲存庫取得管理面板。設定範例：

```yaml
remote-management:
  panel-github-repository: "https://github.com/your-org/your-management-ui"
```

- 儲存庫位址寫法：`https://github.com/<org>/<repo>`，程式會自動轉換成 `https://api.github.com/repos/<org>/<repo>/releases/latest` 呼叫。
- 也可以直接寫 API 位址：`https://api.github.com/repos/<org>/<repo>/releases/latest`。
- 伺服器會在背景定期檢查最新的 Release，尋找名為 `management.html` 的資產，並下載到靜態目錄（預設為設定檔同層的 `static/`，或 `MANAGEMENT_STATIC_PATH` 指定的目錄）。若資產包含 `digest` 欄位（建議使用 `sha256:<hex>`），伺服器會使用該值驗證雜湊。

## 在 GitHub 釋出自訂 Web UI 的規範

1. 建置自訂管理面板，產生單個 `management.html`（建議將靜態資源打包進同一個檔案）。
2. 建立 GitHub 儲存庫並推送程式碼。
3. 建立 Release（使用 `latest` 會被自動檢測），上傳資產檔案：
   - 必須包含檔名 **`management.html`**。
   - 建議在資產中繼資料中填寫 `digest` 欄位，格式 `sha256:<檔案雜湊>`，方便驗證完整性。
4. 在 CLIProxyAPI 設定中設定 `remote-management.panel-github-repository` 為該儲存庫位址或對應的 API 位址。
5. 重新啟動或熱重新載入設定後，伺服器會自動取得最新的管理面板。
