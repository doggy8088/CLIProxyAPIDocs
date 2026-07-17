# Git 支援的設定與權杖儲存

應用程式可設定為使用 Git 儲存庫作為後端，用於儲存 `config.yaml` 設定檔和來自 `auth-dir` 目錄的身分驗證權杖。這允許對您的設定進行集中管理和版本控制。

要啟用此功能，請將 `GITSTORE_GIT_URL` 環境變數設定為您的 Git 儲存庫的 URL。

**環境變數**

| 變數                      | 必填 | 預設值    | 描述                                                 |
|-------------------------|----|--------|----------------------------------------------------|
| `MANAGEMENT_PASSWORD`   | 是  |        | 管理面板密碼                                             |
| `GITSTORE_GIT_URL`      | 是  |        | 要使用的 Git 儲存庫的 HTTPS URL。                            |
| `GITSTORE_LOCAL_PATH`   | 否  | 目前工作目錄 | 將複製 Git 儲存庫的本機路徑。在 Docker 內部，此路徑預設為 `/CLIProxyAPI`。 |
| `GITSTORE_GIT_USERNAME` | 否  |        | 用於 Git 身分驗證的使用者名稱。                                   |
| `GITSTORE_GIT_TOKEN`    | 否  |        | 用於 Git 身分驗證的個人存取權杖（或密碼）。                           |

**工作原理**

1.  **複製：** 啟動時，應用程式會將遠端 Git 儲存庫複製到 `GITSTORE_LOCAL_PATH`。
2.  **設定：** 接著在複製的儲存庫中，查找 `config` 目錄下的 `config.yaml` 檔案。
3.  **引導：** 如果儲存庫中不存在 `config/config.yaml`，應用程式會將本機的 `config.example.yaml` 複製到該位置，然後提交併推送到遠端儲存庫作為初始設定。您必須確保 `config.example.yaml` 檔案可用。
4.  **權杖同步：** `auth-dir` 也在此儲存庫中管理。對身分驗證權杖的任何更改（例如，透過新的登入）都會自動提交併推送到遠端 Git 儲存庫。
