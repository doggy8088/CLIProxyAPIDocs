---
outline: 'deep'
---

# 管理 API v8

基底路徑：`http://localhost:8317/v8/management`

這是適用於 v8 佈局的設定與運作 API。設定路徑與 [設定選項](../configuration/options) 中記載的 v8 YAML 樹狀結構相對應。設定寫入成功後會將檔案持久化儲存，並由服務熱重新載入。

`/v0/management` 仍可供既有用戶端使用，但已接近棄用。請勿再以該 API 開發新功能。

## 身分驗證

- 除 OAuth 回呼外，每個請求都必須攜帶有效的管理金鑰，包括來自 localhost 的請求。
- 遠端存取需要 `management.allow-remote: true`。在 v8 寫入遷移檔案之前，舊版名稱 `remote-management.allow-remote` 仍可使用。
- 使用下列任一標頭傳送明文金鑰：
    - `Authorization: Bearer <plaintext-key>`
    - `X-Management-Key: <plaintext-key>`

其他說明：

- `MANAGEMENT_PASSWORD` 會額外註冊一個僅存在於記憶體中的管理金鑰，並在 `allow-remote` 為 false 時仍保持遠端管理啟用。該值不會寫入磁碟。
- `cliproxy run --password <pwd>` 與 SDK 的 `WithLocalManagementPassword` 僅接受來自 localhost（`127.0.0.1` 或 `::1`）的該密碼。它僅存在於記憶體中。
- 當 `management.secret-key` 為空、`MANAGEMENT_PASSWORD` 未設定，且未設定本機管理密碼時，路由會傳回 404。`/v0/management` 同樣傳回 404。
- Home 模式不會公開此 API，同樣傳回 404。
- 同一個用戶端 IP（包括 localhost）若連續 5 次身分驗證失敗，將面臨約 30 分鐘的暫時封鎖。
- 明文 `management.secret-key` 會在載入或儲存設定時以 bcrypt 雜湊處理。

## 請求與回應約定

- 除非端點另有說明，否則通過身分驗證的設定與操作請求體使用 `Content-Type: application/json`。
- v8 設定請求體即為值本身。不要將其包裝在 `{ "value": ... }`、`{ "items": ... }` 或舊版欄位名稱中。
- `GET /config` 與 `GET /config/<path>` 會將該 YAML 節點以 JSON 傳回。路徑不存在時傳回 `404` 與 `{ "error": "not_found" }`。
- `PUT` 會取代所選節點。`PATCH` 會深層合併物件，並取代所有其他類型。`null` 會被儲存；它不會刪除欄位。若要移除欄位，請使用 `DELETE`。
- 路徑區段是 YAML 對應鍵。它們不是陣列索引。清單會整體取代。
- 設定變更成功會傳回 `{ "status": "ok", "config-version": 8 }`，並熱重新載入已儲存的檔案。
- `GET` 會傳回 v8 檢視，但不會改寫檔案。第一次成功的 `PUT`、`PATCH` 或 `DELETE` 會將舊版檔案遷移為 `config-version: 8`、移除舊版寫法，並保留註解。被拒絕的寫入不會遷移檔案。
- v8 寫入會拒絕舊版欄位名稱與未知的根區段。舊版對照請參閱 [設定選項](../configuration/options)。

下列欄位由 Home 擁有。變更這些欄位會傳回 `400` 與 `{ "error": "read_only_field", "field": "<path>" }`：

- `credentials/concurrency/lifecycle-config-revision`
- `credentials/concurrency/observation-barrier-revision`
- `plugins/auth-revision`

## 設定

欄位名稱、預設值與供應商規則定義於 [設定選項](../configuration/options)。以下範例僅說明傳輸方式。

### 讀取設定

- `GET /config` — 完整的 v8 文件。
- `GET /config/<section>/<key>/...` — 一個巢狀節點。
- `GET /config.yaml` — 相同 v8 檢視的 YAML 版本。

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  http://localhost:8317/v8/management/config
```

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  http://localhost:8317/v8/management/config/routing/strategy
```

```text
"round-robin"
```

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Accept: application/yaml' \
  http://localhost:8317/v8/management/config.yaml
```

說明：

- 回應會傳送 `Cache-Control: no-store`。
- YAML 使用 `Content-Type: application/yaml; charset=utf-8`。
- JSON 讀取會省略 `oauth.providers.codex.live-media-relay.ice-servers` 中的 `username` 與 `credential`。YAML 讀取仍包含這些值。
- 當無法讀取可用的設定時，處理常式會傳回 `500` 與 `{ "error": "read_failed" }` 或 `{ "error": "invalid_config" }`。

### 取代或合併設定

- `PUT /config` 會取代整份文件。請求體必須是 JSON 物件。
- `PATCH /config` 會將 JSON 物件深層合併至文件中。
- `PUT /config/<path>` 會取代該節點。請求體是原始 JSON 值：物件、陣列、字串、數字、布林值或 `null`。
- `PATCH /config/<path>` 在目前節點與請求體皆為物件時會合併，否則會取代該節點。
- `PUT /config.yaml` 會以一份 v8 YAML 文件取代檔案。`Content-Type` 可為 `application/yaml`。`/config.yaml` 沒有 `PATCH`。

```bash
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"routing":{"retry":{"request-retry":0}},"oauth":{"providers":{"aistudio":{"ws-auth":false}}}}' \
  http://localhost:8317/v8/management/config
```

```bash
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '"direct"' \
  http://localhost:8317/v8/management/config/requests/proxy-url
```

```bash
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '["client-key-1","client-key-2"]' \
  http://localhost:8317/v8/management/config/access/api-keys
```

```bash
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"enabled":true,"priority":10}' \
  http://localhost:8317/v8/management/config/plugins/configs/example-plugin
```

```bash
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/yaml' \
  --data-binary @config.yaml \
  http://localhost:8317/v8/management/config.yaml
```

回應：

```json
{ "status": "ok", "config-version": 8 }
```

上游 API 金鑰是群組清單。請取代整個供應商清單；路徑無法選取 `api-keys/codex/0`。

```bash
curl -X PUT -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '[{"name":"codex-1","base-url":"https://example.invalid","keys":[{"api-key":"sk-example","weight":1}]}]' \
  http://localhost:8317/v8/management/config/api-keys/codex
```

說明：

- 舊版包裝如 `{ "value": 0 }` 不是 v8 值，驗證會失敗。
- 未知區段、舊版名稱，以及未通過設定解析的值都會被拒絕。先前的檔案會保持不變。
- 將已遮蔽的 JSON ICE 伺服器清單寫回時，會為具有相同 `urls` 的項目保留 TURN `username` 與 `credential`。明確的空字串或 `null` 會清除該金鑰。YAML 取代不會保留被省略的金鑰。
- 寫入會就地更新現有的設定檔，因此 Docker 檔案掛載會保持相同的 inode。
- 可以變更 `management.secret-key` 或 `management.allow-remote`。空金鑰且沒有備用密碼會使後續管理呼叫傳回 404。

### 刪除設定欄位

- `DELETE /config/<path>` 會移除該欄位，並修剪因此變空的對應祖先節點。
- `DELETE /config` 會被拒絕。

```bash
curl -X DELETE -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  http://localhost:8317/v8/management/config/requests/proxy-url
```

## 伺服器

### 最新版本

- `GET /server/latest-version` — 最新的 GitHub 發行標籤。它不會下載資產。

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  http://localhost:8317/v8/management/server/latest-version
```

```json
{ "latest-version": "v1.2.3" }
```

查詢使用 `https://api.github.com/repos/router-for-me/CLIProxyAPI/releases/latest`，並帶有 `User-Agent: CLIProxyAPI`。系統會遵循已設定的 `requests.proxy-url`。

## 請求

### 已驗證的上游呼叫

- `POST /requests/api-call` — 傳送一個對外 HTTP 請求，可選擇使用已儲存的憑證。

```bash
curl -X POST -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"auth_index":"a1b2","method":"GET","url":"https://api.example.com/v1/ping","header":{"Authorization":"Bearer $TOKEN$"}}' \
  http://localhost:8317/v8/management/requests/api-call
```

```json
{ "status_code": 200, "header": { "Content-Type": ["application/json"] }, "body": "{\"ok\":true}" }
```

說明：

- 必填欄位為 `method` 與絕對 `url`。選填欄位為字串對應 `header`、原始字串 `data` 與 `proxy_url`。
- `auth_index` 也接受 `authIndex` 或 `AuthIndex`。
- 標頭中的 `$TOKEN$` 會被所選憑證的存取權杖或 API 金鑰取代。
- 憑證代理的優先順序高於請求中的 `proxy_url` 與全域代理。回應會在 `status_code` 中保留上游狀態。
- 此功能可以使用已儲存的憑證呼叫任意 URL。請保護管理金鑰。

## 路由

### 重設冷卻

- `POST /routing/cooldown/reset` — 清除一個憑證的配額與冷卻狀態。

```bash
curl -X POST -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"auth_index":"a1b2"}' \
  http://localhost:8317/v8/management/routing/cooldown/reset
```

```json
{ "status": "ok", "auth_index": "a1b2", "models": ["gpt-5.4"] }
```

未知的 `auth_index` 會傳回 `404` 與 `{ "error": "auth not found" }`。

### 靜態模型定義

- `GET /routing/model-definitions/:channel` — 一個管道的靜態目錄中繼資料。

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  http://localhost:8317/v8/management/routing/model-definitions/codex
```

回應為 `{ "channel": "codex", "models": [ ... ] }`。

未知管道會傳回 `400` 與 `{ "error": "unknown channel", "channel": "..." }`。

## 可觀測性

### 應用程式記錄

- `GET /observability/logs` — 讀取記錄行。
- `DELETE /observability/logs` — 刪除輪替記錄並截斷目前的記錄。

`GET` 的查詢參數：

- `after`：Unix 時間戳記。僅傳回較新的行。
- `limit`：最大行數。有 `limit` 且沒有 `after` 時，會傳回最新的行。
- `cursor`：先前 `next-cursor` 傳回的不透明游標。

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  'http://localhost:8317/v8/management/observability/logs?limit=2'
```

```json
{
  "lines": ["2026-05-05 12:00:00 info request accepted"],
  "line-count": 1,
  "latest-timestamp": 1777982400,
  "next-cursor": "<OPAQUE_CURSOR>"
}
```

說明：

- 必須透過 `observability.logs.logging-to-file` 啟用檔案記錄。否則回應為 `400` 與 `{ "error": "logging to file disabled" }`。
- 記錄檔案不存在時，會傳回空的 `lines` 與 `line-count: 0`。
- 將 `next-cursor` 作為 `cursor` 傳回。重設回應包含 `"cursor-reset": true`。
- `DELETE` 會傳回 `{ "success": true, "message": "Logs cleared successfully", "removed": 3 }`。

### 請求錯誤記錄

- `GET /observability/logs/errors` — 列出 `error-*.log` 檔案。
- `GET /observability/logs/errors/:name` — 下載一個錯誤記錄。
- `GET /observability/logs/requests/:id` — 下載檔名以 `-<id>.log` 結尾的請求記錄。

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  http://localhost:8317/v8/management/observability/logs/errors
```

```json
{ "files": [{ "name": "error-2026-05-05.log", "size": 12345, "modified": 1777982400 }] }
```

說明：

- 啟用請求記錄時，錯誤記錄清單為空。
- `:name` 必須是已存在的 `error-*.log` 檔名，且不含路徑分隔符號。
- `:id` 不得包含路徑分隔符號。

### 用量

- `GET /observability/usage/queue?count=10` — 彈出最多 `count` 筆用量記錄。`count` 預設為 `1`，且必須是正整數。記錄會從記憶體佇列中移除。佇列為空時傳回 `[]`。
- `GET /observability/usage/api-keys` — API 金鑰憑證在記憶體中的成功與失敗統計，依供應商分組，並以 `base_url|api_key` 為鍵。

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  'http://localhost:8317/v8/management/observability/usage/queue?count=10'
```

本機 Redis RESP 用量輸出已停用。若要預期收到記錄，請先以 `observability.usage.usage-statistics-enabled` 啟用彙總。

## 憑證

這些路由管理 `oauth.auth-dir` 下的檔案與執行階段狀態。它們不會編輯 `api-keys` 群組；這些群組請使用設定路由。

### 列出、上傳與刪除

- `GET /credentials` — 列出憑證檔案與執行階段記錄。
- `POST /credentials` — 上傳一個 `.json` 憑證，可使用 multipart 欄位 `file`，或使用原始 JSON 請求體並加上 `?name=<file.json>`。
- `DELETE /credentials?name=<file.json>` — 刪除一個磁碟上的憑證，並在執行階段停用它。
- `DELETE /credentials?all=true` — 刪除磁碟上每個 `.json` 憑證。回應為 `{ "status": "ok", "deleted": 3 }`。
- `GET /credentials/download?name=<file.json>` — 下載一個磁碟上的憑證。
- `GET /credentials/models?name=<file-or-id>` — 一個憑證的模型定義：`{ "models": [ ... ] }`。

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  http://localhost:8317/v8/management/credentials
```

```json
{
  "files": [
    {
      "id": "claude-user@example.com",
      "auth_index": "a1b2c3d4e5f67890",
      "name": "claude-user@example.com.json",
      "provider": "claude",
      "status": "ready",
      "disabled": false,
      "unavailable": false,
      "runtime_only": false,
      "source": "file"
    }
  ]
}
```

說明：

- 項目依 `name` 排序。`runtime_only: true` 表示該憑證僅存在於記憶體中；這些項目無法在此下載或刪除。
- 上傳需要核心驗證管理程式。若無法使用，回應為 `503` 與 `{ "error": "core auth manager unavailable" }`。
- 上傳檔名必須以 `.json` 結尾。上傳成功會立即註冊，並傳回 `{ "status": "ok" }`。

### 狀態、欄位與重新整理

- `PATCH /credentials/status` — `{ "name": "<file-or-id>", "disabled": true }`。API 金鑰記錄會透過其排除模型設定停用。外掛虛擬子憑證無法單獨變更。
- `PATCH /credentials/fields` — `{ "name": "<file-or-id>", ...fields }`。點路徑會更新巢狀中繼資料，例如 `headers.X-Team`。`headers` 物件會與現有標頭合併；空值會移除該標頭。
- `POST /credentials/refresh` — 重新整理以檔案為基礎的 OAuth 憑證。

```bash
curl -X PATCH -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"codex-user.json","disabled":true}' \
  http://localhost:8317/v8/management/credentials/status
```

## OAuth

### 開始登入

- `GET /oauth/auth-url?provider=<provider>` — 開始供應商登入並傳回瀏覽器 URL。

供應商：`claude`、`codex`、`antigravity`、`kimi`、`kimi-ai`、`xai`、`devin`、`meta`，以及由外掛註冊的 OAuth 供應商。

```bash
curl -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  'http://localhost:8317/v8/management/oauth/auth-url?provider=claude&is_webui=true'
```

```json
{ "status": "ok", "url": "https://...", "state": "anth-1716206400" }
```

說明：

- 缺少 `provider` 時傳回 `400` 與 `{ "error": "provider is required" }`。未知供應商傳回 `404` 與 `{ "error": "provider_not_found" }`，除非有外掛處理它。
- `is_webui=true` 會為支援它的供應商重複使用管理 UI 回呼轉送程式。
- 裝置碼供應商還可能傳回 `flow`、`user_code` 與 `expires_in`。

### 輪詢與取消

- `GET /oauth/status?state=<state>` — 待處理時為 `wait`，成功後為 `ok`，或為 `error` 並帶有 `error` 字串。完成狀態會短暫保留，以便用戶端觀察到 `ok`。
- `DELETE /oauth/session?state=<state>` — 取消待處理的工作階段。回應：`{ "status": "ok", "cancelled": true }`。已取消的流程不會儲存憑證。

### 匯入

- `POST /oauth/import?provider=vertex` — 匯入 Google 服務帳號 JSON 檔案。`vertex` 是受支援的供應商。

```bash
curl -X POST -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -F 'file=@/path/to/service-account.json' \
  -F 'location=us-central1' \
  'http://localhost:8317/v8/management/oauth/import?provider=vertex'
```

```json
{
  "status": "ok",
  "auth-file": "/abs/path/auths/vertex-my-project.json",
  "project_id": "my-project",
  "email": "svc@my-project.iam.gserviceaccount.com",
  "location": "us-central1"
}
```

上傳使用 `multipart/form-data` 的 `file` 欄位。`location` 為選填，預設為 `us-central1`。

### 回呼

`GET /oauth/callback` 與 `POST /oauth/callback` 不在管理金鑰中介軟體範圍內。它們僅接受供應商與待處理工作階段相符的回呼。

- `GET` 讀取 `provider`、`state`、`code`，以及 `error` 或 `error_description`。
- `POST` 接受 `{ "provider", "redirect_url", "code", "state", "error" }`。`redirect_url` 可能攜帶回呼查詢。

```bash
curl 'http://localhost:8317/v8/management/oauth/callback?provider=codex&state=codex-...&code=AUTHORIZATION_CODE'
```

```json
{ "status": "ok" }
```

## 外掛

外掛啟用狀態與外掛擁有的設定屬於設定，不是獨立路由：

- `GET /config/plugins` 讀取外掛區段。
- `PUT` 或 `PATCH /config/plugins/configs/<plugin-id>` 會取代或合併一個外掛物件。
- 使用 `true` 或 `false` 的 `PUT /config/plugins/configs/<plugin-id>/enabled` 僅變更該旗標。它不會變更 `plugins.enabled`。

### 探索與商店

- `GET /plugins` — 已探索、已設定與已註冊的外掛，包括 `plugins_enabled`、`plugins_dir`，以及每個外掛的 id、路徑、啟用狀態、中繼資料、設定欄位與選單。
- `DELETE /plugins/:id` — 移除本機外掛檔案及其已儲存的設定。無法卸載的外掛會傳回 `409`，並可能設定 `restart_required: true`。
- `GET /plugins/store` — 商店目錄、來源錯誤、安裝狀態與可用更新。
- `POST /plugins/store/:id/install` — 下載或更新一個外掛並啟用它。ID 衝突時使用 `?source=<source-id>`。`version` 可為查詢參數或 `{ "version": "1.2.3" }`。

```bash
curl -X POST -H 'Authorization: Bearer <MANAGEMENT_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"version":"1.2.3"}' \
  'http://localhost:8317/v8/management/plugins/store/example-plugin/install?source=official'
```

```json
{
  "status": "installed",
  "source_id": "official",
  "id": "example-plugin",
  "version": "1.2.3",
  "path": "/abs/path/plugins/example-plugin.so",
  "restart_required": false
}
```

商店安裝可以下載可執行產物。啟用前請先信任商店來源。

### 外掛配額

- `GET /plugins/:id/quota?auth_index=<auth-index>`
- `POST /plugins/:id/quota`，請求體為 `{ "auth_index": "<auth-index>" }`
- `DELETE /plugins/:id/quota?auth_index=<auth-index>`

`authIndex` 也接受作為別名。缺少配額供應商時傳回 `404`。供應商失敗時傳回 `502`。v8 不會註冊舊版 `/quota/reset` 別名。

## 錯誤回應

設定與操作處理常式使用各自的錯誤字串。常見結果如下：

- `400` `{ "error": "invalid_json" }`、`{ "error": "invalid_body" }`、`{ "error": "invalid_path" }`、`{ "error": "config_must_be_object" }`、`{ "error": "cannot_delete_config" }`，或 `{ "error": "invalid_config", "message": "..." }`
- `400` `{ "error": "read_only_field", "field": "plugins/auth-revision" }`
- `401` `{ "error": "missing management key" }` 或 `{ "error": "invalid management key" }`
- `403` `{ "error": "remote management disabled" }`
- `404` `{ "error": "not_found" }`、`{ "error": "provider_not_found" }`，或 `{ "error": "auth not found" }`
- `409` 外掛卸載或需要重新啟動
- `422` `{ "error": "invalid_config", "message": "..." }`，當文件可解析但未通過設定驗證時
- `500` `{ "error": "write_failed", "message": "..." }` 或 `{ "error": "read_failed" }`
- `502` 配額供應商失敗
- `503` `{ "error": "core auth manager unavailable" }`

空的管理金鑰且沒有備用密碼時，會在這些處理常式執行前傳回 `404`。

## 說明

- 新用戶端應僅傳送 v8 路徑。檔案遷移後，舊版 `/v0/management` 更新仍會編輯有效值，但它不是新工作的合約。
- `quota-exceeded.switch-project` 與 `quota-exceeded.switch-preview-model` 沒有 v8 名稱。不要新增依賴它們的功能。
- `oauth.providers` 下的 OAuth 供應商設定不適用於 `api-keys` 群組。請將這些憑證保留在上游 API 金鑰記載的群組與金鑰欄位中。
