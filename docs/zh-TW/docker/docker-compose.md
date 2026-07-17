# 使用 Docker Compose 執行

1.  複製儲存庫並進入目錄：
    ```bash
    git clone https://github.com/router-for-me/CLIProxyAPI.git
    cd CLIProxyAPI
    ```

2.  準備設定檔：
    透過複製範例檔案來建立 `config.yaml` 檔案，並根據您的需求進行自訂。
    ```bash
    cp config.example.yaml config.yaml
    ```
    *（Windows 使用者請注意：您可以在 CMD 或 PowerShell 中使用 `copy config.example.yaml config.yaml`。）*

    若需讓外掛商店安裝的外掛在容器重啟後仍然保留，請在 `docker-compose.yml` 中增加外掛目錄掛載：
    ```yaml
    - ./plugins:/CLIProxyAPI/plugins
    ```

3.  啟動服務：
    -   **適用於大多數使用者：** 建議採用此方式。
        執行以下命令，使用 Docker Hub 上的預建置映像檔啟動服務。服務將在背景執行。
        ```bash
        docker compose up -d
        ```
    -   **適用於進階使用者：**
        如果您修改了原始碼並需要建置新映像檔，請使用互動式輔助指令碼：
        -   對於 Windows (PowerShell):
            ```powershell
            .\docker-build.ps1
            ```
        -   對於 Linux/macOS:
            ```bash
            bash docker-build.sh
            ```
        指令碼將提示您選擇執行方式：
        - **選項 1：使用預建置的映像檔執行**：建議採用此方式。它會從映像檔儲存庫拉取最新的官方映像檔並啟動容器。
        - **選項 2：從原始碼建置並執行**：適用於開發者。它會從本機原始碼建置映像檔，將其標記為 `cli-proxy-api:local`，然後啟動容器。需要修改原始碼時可採用此選項。

4. 要在容器內執行登入命令進行身分驗證：
    - **OpenAI Codex**：
    ```bash
    docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser --codex-login
    ```
    - **Claude**:
    ```bash
    docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser --claude-login
    ```
    - **Antigravity**:
    ```bash
    docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser --antigravity-login
    ```

5.  檢視伺服器記錄：
    ```bash
    docker compose logs -f
    ```

6.  停止應用程式：
    ```bash
    docker compose down
    ```
