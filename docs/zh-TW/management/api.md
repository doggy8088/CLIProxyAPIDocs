---
outline: 'deep'
---

# 管理 API

基底路徑：`http://localhost:8317/v0/management`

此 API 用於管理 CLIProxyAPI 的執行階段設定與憑證檔案。所有變更都會寫入 YAML 設定檔，並由服務自動熱重新載入。

注意：下列選項無法透過 API 修改，必須在設定檔中設定；必要時請重新啟動服務：
- `remote-management.allow-remote`
- `remote-management.secret-key`（若啟動時偵測到明文，會自動以 bcrypt 雜湊並寫回設定）

## 身分驗證

- 所有請求（包括本機存取）都必須提供有效的管理金鑰。
- 遠端存取必須在設定檔中啟用：`remote-management.allow-remote: true`
- 使用下列任一方式提供明文管理金鑰：
    - `Authorization: Bearer <plaintext-key>`
    - `X-Management-Key: <plaintext-key>`

若啟動時偵測到設定中的管理金鑰為明文，會自動使用 bcrypt 雜湊並回寫至設定檔。

其他說明：
- 設定環境變數 `MANAGEMENT_PASSWORD` 會將其視為額外的明文管理金鑰，並強制啟用遠端管理（即便 `remote-management.allow-remote` 為 false）。該值不會寫入設定，需要透過 `Authorization` / `X-Management-Key` 標頭直接傳送。
- 透過 `cliproxy run --password <pwd>` 或 SDK 的 `WithLocalManagementPassword` 啟動服務後，來自 `127.0.0.1`/`::1` 的請求可使用該「本機密碼」替代遠端金鑰，同樣透過上述標頭傳遞；該密碼僅存在於執行時記憶體。
- 僅當 `remote-management.secret-key` 為空且未設定 `MANAGEMENT_PASSWORD` 時，管理 API 才會整體被停用（所有 `/v0/management` 路由均傳回 404）。
- 任何用戶端 IP（包括 localhost）若連續 5 次身分驗證失敗，都會觸發約 30 分鐘的暫時封鎖。

## 請求/回應約定

- Content-Type：`application/json`（除非另有說明）。
- 布林/整數/字串更新：請求體為 `{ "value": <type> }`。
- 陣列 PUT：既可使用原始陣列（如 `["a","b"]`），也可使用 `{ "items": [ ... ] }`。
- 陣列 PATCH：支援 `{ "old": "k1", "new": "k2" }` 或 `{ "index": 0, "value": "k2" }`。
- 物件陣列 PATCH：支援按索引或按關鍵欄位匹配（各端點中單獨說明）。

## 端點說明

### 用量統計佇列
- 舊的記憶體聚合 usage 端點（`/usage`、`/usage/export`、`/usage/import`）已移除。如需讀取每次請求的佇列記錄，請使用 `GET /usage-queue`。
- 如需以 JSON 取得每次請求的用量記錄，請使用同一連接埠提供的 [Redis 用量佇列](./redis-usage-queue)（RESP）。
- 透過 `/usage-statistics-enabled` 啟用或停用用量發布。

- GET `/usage-queue?count=10` — 從佇列中彈出最多 `count` 條用量記錄
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        'http://localhost:8317/v0/management/usage-queue?count=10'
      ```
    - 回應：
      ```json
      [
        {
          "timestamp": "2026-05-05T12:00:00Z",
          "latency_ms": 1234,
          "source": "user@example.com",
          "auth_index": "0",
          "tokens": {
            "input_tokens": 10,
            "output_tokens": 20,
            "reasoning_tokens": 0,
            "cached_tokens": 0,
            "total_tokens": 30
          },
          "failed": false,
          "provider": "openai",
          "model": "gpt-5.4",
          "alias": "gpt-5.4",
          "endpoint": "POST /v1/chat/completions",
          "auth_type": "api_key",
          "api_key": "sk-...",
          "request_id": "req_..."
        }
      ]
      ```
    - 說明：
        - `count` 可選，預設值為 `1`，且必須為正整數。
        - 回應始終是陣列，包括 `count=1`；佇列為空時傳回 `[]`。
        - 透過該介面傳回的記錄會從佇列中移除。
        - Redis 相容用量佇列讀取的是同一個佇列；`LPOP` 和 `RPOP` 也會移除傳回的記錄。

### 設定
- GET `/config` — 取得完整的設定
    - 請求:
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/config
      ```
    - 回應:
      ```json
      {"debug":true,"proxy-url":"","api-keys":["1...5","JS...W"],"quota-exceeded":{"switch-project":true,"switch-preview-model":true},"gemini-api-key":[{"api-key":"AI...01","base-url":"https://generativelanguage.googleapis.com","headers":{"X-Custom-Header":"custom-value"},"proxy-url":"","excluded-models":["gemini-1.5-pro","gemini-1.5-flash"]},{"api-key":"AI...02","proxy-url":"socks5://proxy.example.com:1080","excluded-models":["gemini-pro-vision"]}],"request-log":true,"request-retry":3,"claude-api-key":[{"api-key":"cr...56","base-url":"https://example.com/api","proxy-url":"socks5://proxy.example.com:1080","models":[{"name":"claude-3-5-sonnet-20241022","alias":"claude-sonnet-latest"}],"excluded-models":["claude-3-opus"]},{"api-key":"cr...e3","base-url":"http://example.com:3000/api","proxy-url":""},{"api-key":"sk-...q2","base-url":"https://example.com","proxy-url":""}],"codex-api-key":[{"api-key":"sk...01","base-url":"https://example/v1","proxy-url":"","excluded-models":["gpt-4o-mini"]}],"openai-compatibility":[{"name":"openrouter","base-url":"https://openrouter.ai/api/v1","api-key-entries":[{"api-key":"sk...01","proxy-url":""}],"models":[{"name":"moonshotai/kimi-k2:free","alias":"kimi-k2"}]}]}
      ```
    - 說明：
        - 傳回中不再包含 `generative-language-api-key`；若需純字串檢視，可使用專用的 `GET /generative-language-api-key` 介面。
        - 若服務尚未載入設定檔，則傳回空物件 `{}`。

### 最新版本
- GET `/latest-version` — 查詢最新發行版本號（僅傳回版本字串，不下載資源）
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/latest-version
      ```
    - 回應：
      ```json
      { "latest-version": "v1.2.3" }
      ```
    - 說明：
        - 版本資訊來源 `https://api.github.com/repos/router-for-me/CLIProxyAPI/releases/latest`，請求標頭使用 `User-Agent: CLIProxyAPI`。
        - 若設定了 `proxy-url`，查詢會重複使用該代理；只傳回版本號，不會下載版本資產。

### Debug
- GET `/debug` — 取得目前 debug 狀態
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/debug
      ```
    - 回應：
      ```json
      { "debug": false }
      ```
- PUT/PATCH `/debug` — 設定 debug（布林值）
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":true}' \
        http://localhost:8317/v0/management/debug
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### YAML 設定
- GET `/config.yaml` — 下載已儲存的原始 YAML 設定
    - 回應標頭：
        - `Content-Type: application/yaml; charset=utf-8`
        - `Cache-Control: no-store`
    - 回應體：保留註釋與格式的原始 YAML 流。
- PUT `/config.yaml` — 使用 YAML 檔案整體替換設定
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/yaml' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        --data-binary @config.yaml \
        http://localhost:8317/v0/management/config.yaml
      ```
    - 回應：
      ```json
      { "ok": true, "changed": ["config"] }
      ```
    - 說明：
        - 服務會先載入 YAML 驗證其有效性，驗證失敗傳回 `422` 以及 `{ "error": "invalid_config", "message": "..." }`。
        - 寫入失敗會傳回 `500`，格式 `{ "error": "write_failed", "message": "..." }`。

### 檔案記錄開關
- GET `/logging-to-file` — 檢視是否啟用檔案記錄
    - 回應：
      ```json
      { "logging-to-file": true }
      ```
- PUT/PATCH `/logging-to-file` — 開啟或關閉檔案記錄
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":false}' \
        http://localhost:8317/v0/management/logging-to-file
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 記錄檔
- GET `/logs` — 取得合併後的最新記錄行
    - 查詢參數：
        - `after`（可選）：Unix 時間戳，僅傳回該時間之後的記錄。
    - 回應：
      ```json
      {
        "lines": ["2024-05-20 12:00:00 info request accepted"],
        "line-count": 125,
        "latest-timestamp": 1716206400
      }
      ```
    - 說明：
        - 需要先啟用檔案記錄，否則會以 `400` 傳回 `{ "error": "logging to file disabled" }`。
        - 若目前沒有記錄檔，傳回的 `lines` 為空陣列、`line-count` 為 `0`。
        - `latest-timestamp` 是本輪掃描到的最大時間戳；若記錄無時間戳，則傳回輸入的 `after`（或 `0`），可直接作為下一次輪詢的 `after`。
        - `line-count` 為本輪遍歷的行總數，包含被 `after` 過濾掉的舊記錄，可幫助判斷記錄是否有新增。
- DELETE `/logs` — 刪除輪替記錄檔並清除主要記錄檔
    - 回應：
      ```json
      { "success": true, "message": "Logs cleared successfully", "removed": 3 }
      ```

### 請求錯誤記錄
- GET `/request-error-logs` — 在關閉請求記錄時列出錯誤請求記錄檔
    - 回應：
      ```json
      {
        "files": [
          {
            "name": "error-2024-05-20.log",
            "size": 12345,
            "modified": 1716206400
          }
        ]
      }
      ```
    - 說明：
        - 當 `request-log` 為 `true` 時，該介面始終傳回空清單。
        - 檔案來自同一記錄目錄，檔名必須以 `error-` 開頭並以 `.log` 結尾。
        - `modified` 為最後修改時間的 Unix 時間戳。
- GET `/request-error-logs/:name` — 下載指定錯誤請求記錄檔
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -OJ 'http://localhost:8317/v0/management/request-error-logs/error-2024-05-20.log'
      ```
    - 說明：
        - `name` 必須是安全檔名（不能包含 `/` 或 `\`），且必須與現有的 `error-*.log` 項目匹配，否則會傳回驗證錯誤或未找到錯誤。
        - 處理函式會在傳送檔案前驗證解析後的完整路徑，確保其仍位於記錄目錄之內。

### Usage 統計開關
- GET `/usage-statistics-enabled` — 檢視是否啟用請求統計
    - 回應：
      ```json
      { "usage-statistics-enabled": true }
      ```
- PUT/PATCH `/usage-statistics-enabled` — 啟用或關閉統計
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":true}' \
        http://localhost:8317/v0/management/usage-statistics-enabled
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 代理伺服器 URL
- GET `/proxy-url` — 取得代理 URL 字串
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/proxy-url
      ```
    - 回應：
      ```json
      { "proxy-url": "socks5://user:pass@127.0.0.1:1080/" }
      ```
- PUT/PATCH `/proxy-url` — 設定代理 URL 字串
    - 請求（PUT）：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":"socks5://user:pass@127.0.0.1:1080/"}' \
        http://localhost:8317/v0/management/proxy-url
      ```
    - 請求（PATCH）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":"http://127.0.0.1:8080"}' \
        http://localhost:8317/v0/management/proxy-url
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/proxy-url` — 清除代理 URL
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE http://localhost:8317/v0/management/proxy-url
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 超出配額行為
- GET `/quota-exceeded/switch-project`
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/quota-exceeded/switch-project
      ```
    - 回應：
      ```json
      { "switch-project": true }
      ```
- PUT/PATCH `/quota-exceeded/switch-project` — 布林值
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":false}' \
        http://localhost:8317/v0/management/quota-exceeded/switch-project
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- GET `/quota-exceeded/switch-preview-model`
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/quota-exceeded/switch-preview-model
      ```
    - 回應：
      ```json
      { "switch-preview-model": true }
      ```
- PUT/PATCH `/quota-exceeded/switch-preview-model` — 布林值
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":true}' \
        http://localhost:8317/v0/management/quota-exceeded/switch-preview-model
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- POST `/reset-quota` — 清除指定憑證的配額與冷卻路由狀態
    - 請求：
      ```bash
      curl -X POST -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"auth_index":"<AUTH_INDEX>"}' \
        http://localhost:8317/v0/management/reset-quota
      ```
    - 回應：
      ```json
      {
        "status": "ok",
        "auth_index": "<AUTH_INDEX>",
        "models": ["gpt-5"]
      }
      ```
    - 說明：
        - `auth_index` 是 `GET /auth-files` 傳回的穩定執行時憑證識別碼。
        - 此介面不接受憑證檔名或 auth ID。
        - 呼叫後會清除執行時 quota/cooldown 狀態，並立即恢復該憑證參與路由。

### API 金鑰（代理服務身分驗證）
這些介面會更新設定中 `auth.providers` 內建的 `config-api-key` 提供者，舊版頂層 `api-keys` 會自動保持同步。
- GET `/api-keys` — 傳回完整清單
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/api-keys
      ```
    - 回應：
      ```json
      { "api-keys": ["k1","k2","k3"] }
      ```
- PUT `/api-keys` — 完整改寫清單
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '["k1","k2","k3"]' \
        http://localhost:8317/v0/management/api-keys
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/api-keys` — 修改其中一個（`old/new` 或 `index/value`）
    - 請求（按 old/new）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"old":"k2","new":"k2b"}' \
        http://localhost:8317/v0/management/api-keys
      ```
    - 請求（按 index/value）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"index":0,"value":"k1b"}' \
        http://localhost:8317/v0/management/api-keys
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/api-keys` — 刪除其中一個（`?value=` 或 `?index=`）
    - 請求（按值刪除）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/api-keys?value=k1'
      ```
    - 請求（按索引刪除）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/api-keys?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

- GET `/api-key-usage` — 按 provider 與 API key 分組的近期請求桶
    - 回應：
      ```json
      {
        "openai": {
          "https://openrouter.ai/api/v1|k1": {
            "success": 12,
            "failed": 1,
            "recent_requests": [
              { "time": "12:00-12:10", "success": 3, "failed": 0 },
              { "time": "12:10-12:20", "success": 1, "failed": 1 }
            ]
          }
        }
      }
      ```
    - 說明：
        - 頂層 key 為 provider 名稱。
        - 二級 key 為 `base_url|api_key`（base URL 可能為空，例如 `|k1`）。
        - `recent_requests` 固定包含 20 個時間區段，每個區段為 10 分鐘，並使用本機時間標籤 `HH:MM-HH:MM`。

### Gemini API Key
- GET `/gemini-api-key`
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/gemini-api-key
      ```
    - 回應：
      ```json
      {
        "gemini-api-key": [
          {"api-key":"AIzaSy...01","auth-index":"a1b2c3d4e5f67890","base-url":"https://generativelanguage.googleapis.com","headers":{"X-Custom-Header":"custom-value"},"proxy-url":"","excluded-models":["gemini-1.5-pro","gemini-1.5-flash"]},
          {"api-key":"AIzaSy...02","auth-index":"b1c2d3e4f5a67890","proxy-url":"socks5://proxy.example.com:1080","excluded-models":["gemini-pro-vision"]}
        ]
      }
      ```
- PUT `/gemini-api-key`
    - 請求（陣列形式）：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '[{"api-key":"AIzaSy-1","headers":{"X-Custom-Header":"vendor-value"},"excluded-models":["gemini-1.5-flash"]},{"api-key":"AIzaSy-2","base-url":"https://custom.example.com","excluded-models":["gemini-pro-vision"]}]' \
        http://localhost:8317/v0/management/gemini-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/gemini-api-key`
    - 請求（按索引更新）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"index":0,"value":{"api-key":"AIzaSy-1","base-url":"https://custom.example.com","headers":{"X-Custom-Header":"custom-value"},"proxy-url":"","excluded-models":["gemini-1.5-pro","gemini-pro-vision"]}}' \
        http://localhost:8317/v0/management/gemini-api-key
      ```
    - 請求（按 api-key 匹配更新）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"match":"AIzaSy-1","value":{"api-key":"AIzaSy-1","headers":{"X-Custom-Header":"custom-value"},"proxy-url":"socks5://proxy.example.com:1080","excluded-models":["gemini-1.5-pro-latest"]}}' \
        http://localhost:8317/v0/management/gemini-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/gemini-api-key`
    - 請求（按 api-key 刪除）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE \
        'http://localhost:8317/v0/management/gemini-api-key?api-key=AIzaSy-1'
      ```
    - 請求（按索引刪除）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE \
        'http://localhost:8317/v0/management/gemini-api-key?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - `excluded-models` 為可選欄位，伺服器端會先轉小寫、去除首尾空白、去重並忽略空字串後再儲存。

### Codex API KEY（物件陣列）
- GET `/codex-api-key` — 列出全部
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/codex-api-key
      ```
    - 回應：
      ```json
      { "codex-api-key": [ { "api-key": "sk-a", "base-url": "https://codex.example.com/v1", "proxy-url": "socks5://proxy.example.com:1080", "headers": { "X-Team": "cli" }, "excluded-models": ["gpt-4o-mini"] } ] }
      ```
- PUT `/codex-api-key` — 完整改寫清單
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '[{"api-key":"sk-a","base-url":"https://codex.example.com/v1","proxy-url":"socks5://proxy.example.com:1080","headers":{"X-Team":"cli"},"excluded-models":["gpt-4o-mini","gpt-4.1-mini"]},{"api-key":"sk-b","base-url":"https://custom.example.com","proxy-url":"","headers":{"X-Env":"prod"},"excluded-models":["gpt-3.5-turbo"]}]' \
        http://localhost:8317/v0/management/codex-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/codex-api-key` — 修改其中一個（按 `index` 或 `match`）
    - 請求（按索引）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"index":1,"value":{"api-key":"sk-b2","base-url":"https://c.example.com","proxy-url":"","headers":{"X-Env":"stage"},"excluded-models":["gpt-3.5-turbo-instruct"]}}' \
        http://localhost:8317/v0/management/codex-api-key
      ```
    - 請求（按匹配）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"match":"sk-a","value":{"api-key":"sk-a","base-url":"https://codex.example.com/v1","proxy-url":"socks5://proxy.example.com:1080","headers":{"X-Team":"cli"},"excluded-models":["gpt-4o-mini","gpt-4.1"]}}' \
        http://localhost:8317/v0/management/codex-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/codex-api-key` — 刪除其中一個（`?api-key=` 或 `?index=`）
    - 請求（按 api-key）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/codex-api-key?api-key=sk-b2'
      ```
    - 請求（按索引）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/codex-api-key?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - `base-url` 必填；若 PUT/PATCH 中將 `base-url` 留空，則該項目會被視為刪除。
        - `headers` 支援自訂請求標頭，伺服器端會自動去除空白鍵值對。
        - `excluded-models` 可用於遮蔽該供應商下的指定模型，伺服器端會先轉小寫、去除首尾空白、去重並忽略空字串。

### 請求重試次數
- GET `/request-retry` — 取得整數
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/request-retry
      ```
    - 回應：
      ```json
      { "request-retry": 3 }
      ```
- PUT/PATCH `/request-retry` — 設定整數
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":5}' \
        http://localhost:8317/v0/management/request-retry
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 最大重試間隔
- GET `/max-retry-interval` — 取得最大重試間隔（秒）
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/max-retry-interval
      ```
    - 回應：
      ```json
      { "max-retry-interval": 30 }
      ```
- PUT/PATCH `/max-retry-interval` — 設定最大重試間隔（秒）
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":60}' \
        http://localhost:8317/v0/management/max-retry-interval
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 請求記錄開關
- GET `/request-log` — 取得布林值
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/request-log
      ```
    - 回應：
      ```json
      { "request-log": false }
      ```
- PUT/PATCH `/request-log` — 設定布林值
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":true}' \
        http://localhost:8317/v0/management/request-log
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### WebSocket 身分驗證（`ws-auth`）
- GET `/ws-auth` — 檢視 WebSocket 閘道器是否啟用身分驗證
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/ws-auth
      ```
    - 回應：
      ```json
      { "ws-auth": true }
      ```
- PUT/PATCH `/ws-auth` — 切換 `/ws/*` 路由是否強制身分驗證
    - 請求：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"value":false}' \
        http://localhost:8317/v0/management/ws-auth
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - 當從 `false` 切換為 `true` 時，服務會主動斷開所有現有的 WebSocket 連線，確保重連時必須攜帶有效的 API 憑證。
        - 關閉身分驗證不會影響已建立的連線，但新的連線會跳過身分驗證流程，直到再次開啟。

### Claude API KEY（物件陣列）
- GET `/claude-api-key` — 列出全部
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/claude-api-key
      ```
    - 回應：
      ```json
      { "claude-api-key": [ { "api-key": "sk-a", "base-url": "https://example.com/api", "proxy-url": "socks5://proxy.example.com:1080", "headers": { "X-Workspace": "team-a" }, "excluded-models": ["claude-3-opus"] } ] }
      ```
- PUT `/claude-api-key` — 完整改寫清單
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '[{"api-key":"sk-a","proxy-url":"socks5://proxy.example.com:1080","headers":{"X-Workspace":"team-a"},"excluded-models":["claude-3-opus"]},{"api-key":"sk-b","base-url":"https://c.example.com","proxy-url":"","headers":{"X-Env":"prod"},"excluded-models":["claude-3-sonnet","claude-3-5-haiku"]}]' \
        http://localhost:8317/v0/management/claude-api-key
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/claude-api-key` — 修改其中一個（按 `index` 或 `match`）
    - 請求（按索引）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
          -d '{"index":1,"value":{"api-key":"sk-b2","base-url":"https://c.example.com","proxy-url":"","headers":{"X-Env":"stage"},"excluded-models":["claude-3.7-sonnet"]}}' \
          http://localhost:8317/v0/management/claude-api-key
        ```
    - 請求（按匹配）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
          -d '{"match":"sk-a","value":{"api-key":"sk-a","base-url":"","proxy-url":"socks5://proxy.example.com:1080","headers":{"X-Workspace":"team-a"},"excluded-models":["claude-3-opus","claude-3.5-sonnet"]}}' \
          http://localhost:8317/v0/management/claude-api-key
        ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- DELETE `/claude-api-key` — 刪除其中一個（`?api-key=` 或 `?index=`）
    - 請求（按 api-key）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/claude-api-key?api-key=sk-b2'
      ```
    - 請求（按索引）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/claude-api-key?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - `headers` 是選用的鍵值對，伺服器端會自動移除空白鍵和值；若要移除某個標頭，請在請求中省略該欄位。
        - `excluded-models` 可用於遮蔽對應 Claude 模型，伺服器端會先轉小寫、去除首尾空白、去重並忽略空字串。

### OpenAI 相容供應商（物件陣列）
- GET `/openai-compatibility` — 列出全部
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/openai-compatibility
      ```
    - 回應：
      ```json
      {
        "openai-compatibility": [
          {
            "name": "openrouter",
            "disabled": false,
            "base-url": "https://openrouter.ai/api/v1",
            "api-key-entries": [
              { "api-key": "sk", "proxy-url": "", "auth-index": "a1b2c3d4e5f67890" }
            ],
            "models": [],
            "headers": { "X-Provider": "openrouter" }
          }
        ]
      }
      ```
- PUT `/openai-compatibility` — 完整改寫清單
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '[{"name":"openrouter","base-url":"https://openrouter.ai/api/v1","api-key-entries":[{"api-key":"sk","proxy-url":""}],"models":[{"name":"m","alias":"a"}],"headers":{"X-Provider":"openrouter"}}]' \
        http://localhost:8317/v0/management/openai-compatibility
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
- PATCH `/openai-compatibility` — 修改其中一個（按 `index` 或 `name`）
    - 請求（按名稱）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"name":"openrouter","value":{"name":"openrouter","disabled":false,"base-url":"https://openrouter.ai/api/v1","api-key-entries":[{"api-key":"sk","proxy-url":""}],"models":[],"headers":{"X-Provider":"openrouter"}}}' \
        http://localhost:8317/v0/management/openai-compatibility
      ```
    - 請求（按索引）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"index":0,"value":{"name":"openrouter","disabled":false,"base-url":"https://openrouter.ai/api/v1","api-key-entries":[{"api-key":"sk","proxy-url":""}],"models":[],"headers":{"X-Provider":"openrouter"}}}' \
        http://localhost:8317/v0/management/openai-compatibility
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

    - 說明：
        - 仍可提交舊版 `api-keys` 欄位，但所有金鑰都會自動遷移至 `api-key-entries`，傳回結果中的 `api-keys` 會逐步留空。
        - `disabled: true` 可在不刪除設定的情況下停用該供應商（路由/選鑰會跳過）。
        - `headers` 可為特定相容供應商統一附加 HTTP 標頭，伺服器端會自動移除空白鍵值。
        - `base-url` 不能為空；若 PUT/PATCH 將 `base-url` 設為空字串，則該供應商會被刪除。
- DELETE `/openai-compatibility` — 刪除（`?name=` 或 `?index=`）
    - 請求（按名稱）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/openai-compatibility?name=openrouter'
      ```
    - 請求（按索引）：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/openai-compatibility?index=0'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### OAuth 排除模型
用於為基於 OAuth 的供應商設定需要排除的模型清單。鍵為供應商識別碼字串，值為字串陣列。

- GET `/oauth-excluded-models` — 取得目前對應
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/oauth-excluded-models
      ```
    - 回應：
      ```json
      {
        "oauth-excluded-models": {
          "openai": ["gpt-4.1-mini"],
          "claude": ["claude-3-5-haiku-20241022"]
        }
      }
      ```
- PUT `/oauth-excluded-models` — 完整替換整張對應表
    - 請求：
      ```bash
      curl -X PUT -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"openai":["gpt-4.1-mini"],"claude":["claude-3-5-haiku-20241022"]}' \
        http://localhost:8317/v0/management/oauth-excluded-models
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - 請求體也可以為 `{ "items": { ... } }` 形式；無論哪種形式，空白模型名稱都會被自動過濾。
- PATCH `/oauth-excluded-models` — 新增/更新或刪除單個供應商項目
    - 請求（新增或更新）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"provider":"claude","models":["claude-3-5-haiku-20241022"]}' \
        http://localhost:8317/v0/management/oauth-excluded-models
      ```
    - 請求（透過空陣列刪除供應商）：
      ```bash
      curl -X PATCH -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d '{"provider":"claude","models":[]}' \
        http://localhost:8317/v0/management/oauth-excluded-models
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - `provider` 會被標準化為小寫。若傳入空的 `models` 陣列，則表示刪除該供應商；如供應商不存在，則傳回 `404`。
- DELETE `/oauth-excluded-models` — 刪除某個供應商的全部排除模型
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -X DELETE 'http://localhost:8317/v0/management/oauth-excluded-models?provider=claude'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```

### 憑證檔案管理

管理 `auth-dir` 下的 JSON 權杖檔案：列出、下載、上傳、刪除。

- GET `/auth-files` — 清單
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' http://localhost:8317/v0/management/auth-files
      ```
    - 回應（執行階段憑證管理器可用時）：
      ```json
      {
        "files": [
          {
            "id": "claude-user@example.com",
            "auth_index": "a1b2c3d4e5f67890",
            "name": "claude-user@example.com.json",
            "provider": "claude",
            "label": "Claude Prod",
            "status": "ready",
            "status_message": "ok",
            "disabled": false,
            "unavailable": false,
            "runtime_only": false,
            "source": "file",
            "path": "/abs/path/auths/claude-user@example.com.json",
            "size": 2345,
            "modtime": "2025-08-30T12:34:56Z",
            "success": 12,
            "failed": 1,
            "recent_requests": [
              { "time": "12:00-12:10", "success": 3, "failed": 0 },
              { "time": "12:10-12:20", "success": 1, "failed": 1 }
            ],
            "email": "user@example.com",
            "account_type": "anthropic",
            "account": "workspace-1",
            "created_at": "2025-08-30T12:00:00Z",
            "updated_at": "2025-08-31T01:23:45Z",
            "last_refresh": "2025-08-31T01:23:45Z"
          }
        ]
      }
      ```
    - 說明：
        - 清單依 `name` 排序且不區分大小寫；`status`、`status_message`、`disabled`、`unavailable` 直接反映執行階段憑證狀態，方便辨識失效憑證。
        - `runtime_only=true` 表示該憑證僅存在於執行時儲存（例如 Git/PG/ObjectStore 或遠端匯入），`source` 會是 `memory`；若存在對應磁碟檔案則 `source=file` 並補充 `path`/`size`/`modtime`。
        - `auth_index` 是憑證的穩定執行時識別碼（可用於 `/api-call` 等介面）。
        - `success`/`failed` 為累計計數（記憶體態）。
        - `recent_requests` 固定包含 20 個時間區段，每個區段為 10 分鐘，並使用本機時間標籤 `HH:MM-HH:MM`。
        - `email`、`account_type`、`account`、`last_refresh` 來源於 JSON 內的中繼資料（自動相容 `last_refresh`／`lastRefreshedAt` 等欄位）。
        - 核心憑證管理器無法使用時，會改為掃描 `auth-dir`；此時只傳回 `name`、`size`、`modtime`、`type`、`email` 欄位。
        - `runtime_only` 資料無法透過下載/刪除端點處理，需要在對應供應商背景或透過其他 API 撤銷。

- GET `/auth-files/download?name=<file.json>` — 下載單個檔案
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -OJ 'http://localhost:8317/v0/management/auth-files/download?name=acc1.json'
      ```
    - 說明：
        - `name` 必須是 `.json` 檔名，且僅能下載 `source=file` 的項目；`runtime_only` 憑證沒有磁碟檔案無法匯出。

- POST `/auth-files` — 上傳
    - 請求（multipart）：
      ```bash
      curl -X POST -F 'file=@/path/to/acc1.json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/auth-files
      ```
    - 請求（原始 JSON）：
      ```bash
      curl -X POST -H 'Content-Type: application/json' \
      -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -d @/path/to/acc1.json \
        'http://localhost:8317/v0/management/auth-files?name=acc1.json'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - 必須先啟用核心憑證管理器，否則會以 `503` 傳回 `{ "error": "core auth manager unavailable" }`。
        - multipart 與原始 JSON 兩種上傳方式都要求檔名以 `.json` 結尾，且上傳後會立即註冊至執行階段憑證管理器。

- DELETE `/auth-files?name=<file.json>` — 刪除單個檔案
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/auth-files?name=acc1.json'
      ```
    - 回應：
      ```json
      { "status": "ok" }
      ```
    - 說明：
        - 僅刪除磁碟上的 `.json` 檔案，並在成功刪除後通知執行時管理器停用對應憑證；`runtime_only` 項目不會被該端點移除。

- DELETE `/auth-files?all=true` — 刪除 `auth-dir` 下所有 `.json` 檔案
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' -X DELETE 'http://localhost:8317/v0/management/auth-files?all=true'
      ```
    - 回應：
      ```json
      { "status": "ok", "deleted": 3 }
      ```
    - 說明：
        - 僅統計並刪除磁碟檔案，成功後同樣會對被移除的憑證執行停用；對純記憶體項目無影響。

### Vertex 憑證匯入
此功能等同 CLI `vertex-import`，用於上傳 Google 服務帳號 JSON，並在 `auth-dir` 下產生 `vertex-<project>.json`。

- POST `/vertex/import` — 上傳 Vertex 服務帳號金鑰
    - 請求（multipart）：
      ```bash
      curl -X POST \
        -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        -F 'file=@/path/to/my-project-sa.json' \
        -F 'location=us-central1' \
        http://localhost:8317/v0/management/vertex/import
      ```
    - 回應：
      ```json
      {
        "status": "ok",
        "auth-file": "/abs/path/auths/vertex-my-project.json",
        "project_id": "my-project",
        "email": "svc@my-project.iam.gserviceaccount.com",
        "location": "us-central1"
      }
      ```
    - 說明：
        - 必須使用 `multipart/form-data`，並透過 `file` 欄位上傳完整的服務帳號 JSON。若 JSON 無效或缺少 `project_id`/`private_key`，會傳回 `400`。
        - `location` 表單（或查詢）欄位可選，未提供時儲存為 `us-central1`，後續可在產生的檔案中手動調整。
        - 服務會自動正規化 `private_key`、寫入 `vertex` 標籤，並透過權杖儲存區保存；若儲存失敗，將以 `500` 傳回 `{ "error": "save_failed", ... }`。

### 登入/授權 URL

以下端點用於發起各供應商的登入流程，並傳回需要在瀏覽器中開啟的 URL。流程完成後，權杖會儲存到 `auths/` 目錄。

對於 Anthropic、Codex 與 Antigravity，可附加 `?is_webui=true` 以便從管理介面複用內建回呼轉送。

- GET `/anthropic-auth-url` — 開始 Anthropic（Claude）登入
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/anthropic-auth-url
      ```
    - 回應：
      ```json
      { "status": "ok", "url": "https://...", "state": "anth-1716206400" }
      ```
    - 說明：
        - 若從 Web UI 觸發，可新增 `?is_webui=true` 複用本機回呼服務。

- GET `/codex-auth-url` — 開始 Codex 登入
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/codex-auth-url
      ```
    - 回應：
      ```json
      { "status": "ok", "url": "https://...", "state": "codex-1716206400" }
      ```

- GET `/antigravity-auth-url` — 開始 Antigravity 登入
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        http://localhost:8317/v0/management/antigravity-auth-url
      ```
    - 回應：
      ```json
      { "status": "ok", "url": "https://...", "state": "ant-1716206400" }
      ```
    - 說明：
        - 若從 Web UI 觸發，可新增 `?is_webui=true`。服務會在本機連接埠 `51121` 啟動暫時的回呼轉送器，並重複使用主要 HTTP 連接埠接收最終重新導向。

- GET `/get-auth-status?state=<state>` — 輪詢 OAuth 流程狀態
    - 請求：
      ```bash
      curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
        'http://localhost:8317/v0/management/get-auth-status?state=<STATE_FROM_AUTH_URL>'
      ```
    - 回應範例：
      ```json
      { "status": "wait" }
      ```

      ```json
      { "status": "ok" }
      ```

      ```json
      { "status": "error", "error": "Authentication failed" }
      ```
    - 說明：
        - `state` 參數必須與登入端點傳回的值一致；若狀態進入 `ok` 或 `error`，服務會清除該 state，再次輪詢會收到 `{ "status": "ok" }` 表示流程已收尾。
        - `status: "wait"` 表示仍在等待回呼或權杖交換，可視需要繼續輪詢。

## 錯誤回應

通用錯誤格式：
- 400 Bad Request: `{ "error": "invalid body" }`
- 401 Unauthorized: `{ "error": "missing management key" }` 或 `{ "error": "invalid management key" }`
- 403 Forbidden: `{ "error": "remote management disabled" }`
- 404 Not Found: `{ "error": "item not found" }` 或 `{ "error": "file not found" }`
- 422 Unprocessable Entity: `{ "error": "invalid_config", "message": "..." }`
- 500 Internal Server Error: `{ "error": "failed to save config: ..." }`
- 503 Service Unavailable: `{ "error": "core auth manager unavailable" }`

## 說明

- 變更會寫回 YAML 設定檔，並由檔案監控器熱重新載入設定與用戶端。
- `remote-management.allow-remote` 與 `remote-management.secret-key` 不能透過 API 修改，需在設定檔中設定。
