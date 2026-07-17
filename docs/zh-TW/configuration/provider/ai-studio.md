# AI Studio 使用說明

您可以將本服務 (CLIProxyAPI) 作為後端，配合 [這個 AI Studio 應用程式](https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL) 使用。請遵循以下步驟進行設定：

1.  **啟動 CLIProxyAPI 服務**：確保您的 CLIProxyAPI 執行個體正在本機或遠端執行。
2.  **存取 AI Studio 應用程式**：在瀏覽器中登入您的 Google 帳號，然後開啟以下連結：
    - [https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL](https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL)

> **注意：** 若使用 Brave 瀏覽器，可能需要停用 Shields 功能，否則 WebSocket 連線可能遭到封鎖。其他廣告攔截器也可能造成相同問題。

## 連線設定

預設情況下，AI Studio 應用程式會嘗試連線到本機的 CLIProxyAPI (`ws://127.0.0.1:8317`)。

-   **連線到遠端服務**：
    如果您需要連線到遠端部署的 CLIProxyAPI，請修改 AI Studio 應用程式中的 `config.ts` 檔案，更新 `WEBSOCKET_PROXY_URL` 的值。
    -   如果您的遠端服務啟用了 SSL，請使用 `wss://` 協議。
    -   如果未啟用 SSL，請使用 `ws://` 協議。

## 驗證設定

預設情況下，CLIProxyAPI 的 WebSocket 連線不要求身分驗證。

-   **在 CLIProxyAPI 伺服器端啟用身分驗證**：
    在您的 `config.yaml` 檔案中，將 `ws_auth` 設定為 `true`。
-   **在 AI Studio 用戶端設定身分驗證**：
    在 AI Studio 應用程式的 `config.ts` 檔案中，設定 `JWT_TOKEN` 的值為您的驗證權杖。
