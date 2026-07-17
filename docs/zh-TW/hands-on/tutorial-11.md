# 零成本部署：AI Studio 反向代理

> **注意：** 本教學的部署方案必須搭配 `CLIProxyAPI`。開始前，請先準備正在執行的 `CLIProxyAPI` 執行個體。

CLIProxyAPI 自 v6.3.x 起支援透過 WebSocket 串接 AI 供應商，第一個支援的服務是 AI Studio。

此方式需要瀏覽器持續開啟，以執行 AIStudioBuild 上的 WebSocket 通訊程式；若部署於 VPS，則需要較多記憶體。

以下採用 Docker 部署至 Hugging Face，利用免費執行個體執行無頭瀏覽器。

### 第一步：設定 AIStudioBuild 應用程式

依 `CLIProxyAPI` 設定調整 AIStudioBuild 的 WebSocket 通訊程式。先開啟官方[範例程式](https://aistudio.google.com/apps/drive/1CPW7FpWGsDZzkaYgYOyXQ_6FWgxieLmL)並建立副本，再修改圖中標示的兩個位置。若 `CLIProxyAPI` 的 `ws-auth` 設為 `true`，請將 `JWT_TOKEN` 設為 `CLIProxyAPI` 中用於身分驗證的 `api-keys` 值。接著將 `WEBSOCKET_PROXY_URL` 設為 `CLIProxyAPI` 位址，例如 `wss://mycap.example.com/v1/ws`。儲存設定後，記下應用程式連結供後續使用。

![](https://img.072899.xyz/2025/11/359a2572d0206c20dba7fe12a136d6e8.png)

多帳號使用時，需要多操作一個步驟，將該應用程式存取權限設定為 `Public`。

![](https://img.072899.xyz/2025/11/69c6395d1a98c38c68bc6c8dd46b3014.png)

**安全警告：** 設為 `Public` 後，任何取得連結的人都可能存取應用程式。請勿公開分享該連結，以免洩漏授權資訊。

### 第二步：準備 AIStudio Cookie

建議使用瀏覽器的隱私模式登入 [AI Studio](https://aistudio.google.com/)，再從開發人員工具複製 Cookie；位置如下圖。

![](https://img.072899.xyz/2025/11/51f860bf363cab01aa4c3fd5181b7f72.png)

### 第三步之一：部署 Hugging Face Space

開啟 [AIStudioBuildWS Space](https://huggingface.co/spaces/hkfires/AIStudioBuildWS) 並建立副本。在 `CAMOUFOX_INSTANCE_URL` 填入第一步取得的應用程式連結，在 `USER_COOKIE_1` 填入第二步取得的 Cookie，然後點選 **Duplicate Space**。

![](https://img.072899.xyz/2025/11/04e84ce3b0f2abe7ae9e717ac8b5aa0b.png)

等待 Hugging Face 建置完成，出現如下記錄，即部署成功：

![](https://img.072899.xyz/2025/11/e818f38cfb272c1fc10ca97c2ef23c6b.png)

如果有多個帳號，參考 `USER_COOKIE_1`，在 Hugging Face Space 的設定中依序增加 `USER_COOKIE_2`、`USER_COOKIE_3` 等環境變數即可。

**重要提醒：** Cookie 是敏感資訊，必須存入 **Secrets**，不可使用 **Variables**，以免 Cookie 外洩。

### 第三步之二：使用 Docker 部署至伺服器

如果你擁有自己的伺服器（VPS），也可以使用 Docker Compose 進行部署。

1.  **下載程式碼**
    ```bash
    git clone https://github.com/hkfires/AIStudioBuildWS.git
    cd AIStudioBuildWS
    ```

2.  **設定環境變數**
    複製 `.env.example` 為 `.env`，並填入必要資訊（`CAMOUFOX_INSTANCE_URL` 和 `USER_COOKIE_1` 等）。

    也可以在 `cookies` 目錄下放置 JSON 格式的 Cookie 檔案（檔名任意），程式會自動讀取。
    ```bash
    cp .env.example .env
    nano .env
    ```

3.  **啟動服務**
    ```bash
    docker compose up -d --build
    ```

部署完成後，`CLIProxyAPI` 應出現類似下圖的記錄。

![](https://img.072899.xyz/2025/11/e0db39f81a3bbb956cbe9364e656a76f.png)

### 參考專案

https://github.com/cliouo/aistudio-build-proxy-all
