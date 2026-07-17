# PostgreSQL 支援的設定與權杖儲存

在託管環境中執行服務時，可以選擇使用 PostgreSQL 來儲存設定與權杖，藉助託管資料庫減輕本機檔案管理壓力。

**環境變數**

| 變數                      | 必填 | 預設值          | 描述                                                                 |
|-------------------------|----|---------------|----------------------------------------------------------------------|
| `MANAGEMENT_PASSWORD`   | 是  |               | 管理面板密碼（啟用遠端管理時必需）。                                          |
| `PGSTORE_DSN`           | 是  |               | PostgreSQL 連線串，例如 `postgresql://user:pass@host:5432/db`。       |
| `PGSTORE_SCHEMA`        | 否  | public        | 建立表時使用的 schema；留空則使用預設 schema。                               |
| `PGSTORE_LOCAL_PATH`    | 否  | 目前工作目錄       | 本機副本根目錄，服務會在 `<值>/pgstore` 下寫入快取；若無法取得工作目錄，則改用 `/tmp/pgstore`。 |

**工作原理**

1.  **初始化：** 啟動時透過 `PGSTORE_DSN` 連線資料庫，確保 schema 存在，並在缺失時建立 `config_store` 與 `auth_store`。
2.  **本機副本：** 在 `<PGSTORE_LOCAL_PATH 或目前工作目錄>/pgstore` 下建立可寫快取，重複使用 `config/config.yaml` 與 `auths/` 目錄。
3.  **引導：** 若資料庫中無設定記錄，會使用 `config.example.yaml` 初始化，並以固定識別碼 `config` 寫入。
4.  **權杖同步：** 設定與權杖的變更會寫入 PostgreSQL；資料庫內容也會反向同步至本機副本，讓檔案監聽與管理介面可繼續運作。
