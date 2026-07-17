# 設定選項

以下預設值與 `config.example.yaml` 保持同步。

## 基礎

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `host` | string | `""` | 繫結位址；`""` 監聽所有 IPv4/IPv6；用 `127.0.0.1` 僅限本機。 |
| `port` | integer | `8317` | 伺服器監聽連接埠。 |
| `tls.enable` | boolean | `false` | 是否啟用 HTTPS。 |
| `tls.cert` | string | `""` | TLS 憑證路徑。 |
| `tls.key` | string | `""` | TLS 私鑰路徑。 |
| `auth-dir` | string | `"~/.cli-proxy-api"` | 身分憑證目錄，支援 `~`。 |
| `api-keys` | string[] | `[]` | 內建 API 金鑰清單。 |
| `debug` | boolean | `false` | 除錯記錄。 |
| `commercial-mode` | boolean | `false` | 關閉高開銷中介軟體以降低記憶體。 |
| `logging-to-file` | boolean | `false` | 寫入滾動記錄檔而非 stdout。 |
| `logs-max-total-size-mb` | integer | `0` | 記錄目錄大小上限，0 表示不限制。 |
| `usage-statistics-enabled` | boolean | `false` | 是否啟用記憶體用量統計。 |
| `proxy-url` | string | `""` | 全域代理，支援 socks5/http/https。 |
| `force-model-prefix` | boolean | `false` | 無字首的模型請求僅使用無字首憑證。 |
| `request-retry` | integer | `3` | 403/408/500/502/503/504 時的重試次數。 |
| `max-retry-interval` | integer | `30` | 冷卻憑證等待秒數上限，超出即觸發重試。 |
| `disable-image-generation` | boolean \| `"chat"` | `false` | 控制內建 `image_generation` 工具的插入與可用性：`true` 時完全停用（`/v1/images/generations` 與 `/v1/images/edits` 也會傳回 404）；`"chat"` 時只停用非 images 端點的插入，images 端點仍可使用。 |
| `routing.strategy` | string | `"round-robin"` | 多匹配憑證的選擇策略：`round-robin` 或 `fill-first`。 |
| `routing.session-affinity` | boolean | `false` | 是否啟用工作階段黏著性路由。工作階段 ID 取自 `metadata.user_id`（Claude Code）、`X-Session-ID`、`Session_id`（Codex）、`X-Client-Request-Id`（PI）、`conversation_id` 或訊息雜湊。 |
| `routing.session-affinity-ttl` | string | `"1h"` | 會話到憑證繫結的保留時長（TTL）。 |
| `ws-auth` | boolean | `false` | 是否為 `/v1/ws` 啟用身分驗證。 |
| `nonstream-keepalive-interval` | integer | `0` | 非 SSE 流每隔 N 秒傳送空行防止空閒逾時；0 停用。 |
| `codex-instructions-enabled` | boolean | `false` | 是否為 Codex API 請求啟用官方 Codex 指令注入。 |
| `streaming.keepalive-seconds` | integer | `0` | SSE 保持連線間隔；小於或等於 0 時停用。 |
| `streaming.bootstrap-retries` | integer | `0` | 首位元組前的安全重試次數。 |

## 管理 API

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `remote-management.allow-remote` | boolean | `false` | 是否允許非 localhost 存取管理介面。 |
| `remote-management.secret-key` | string | `""` | 管理金鑰；明文會在啟動時雜湊；留空時所有管理路由均傳回 404。 |
| `remote-management.disable-control-panel` | boolean | `false` | 設為 `true` 時停用內建管理面板資源與路由。 |
| `remote-management.panel-github-repository` | string | `"https://github.com/router-for-me/Cli-Proxy-API-Management-Center"` | 管理面板資產的儲存庫或 Releases API 位址。 |

## 配額與路由

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `quota-exceeded.switch-project` | boolean | `true` | 配額超限時自動切換專案。 |
| `quota-exceeded.switch-preview-model` | boolean | `true` | 配額超限時自動切換預覽模型。 |
| `quota-exceeded.antigravity-credits` | boolean | `true` | Claude 模型 credits 備援：當所有 free-tier 憑證耗盡（429/503）時，使用帶 Google One AI credits 的憑證進行最後備援重試。 |

## 供應商憑證（均為陣列，未設定時預設 `[]`）

### Gemini

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `gemini-api-key.*.api-key` | string | `""` | API 金鑰。 |
| `gemini-api-key.*.prefix` | string | `""` | 可選字首，需以 `prefix/model` 存取。 |
| `gemini-api-key.*.base-url` | string | `"https://generativelanguage.googleapis.com"` | 自訂端點。 |
| `gemini-api-key.*.headers` | object | `{}` | 僅對該端點附加的自訂請求標頭。 |
| `gemini-api-key.*.proxy-url` | string | `""` | 覆蓋全域代理。 |
| `gemini-api-key.*.models.*.name` | string | `""` | 上游模型名。 |
| `gemini-api-key.*.models.*.alias` | string | `""` | 使用者端別名。 |
| `gemini-api-key.*.excluded-models` | string[] | `[]` | 排除匹配的模型（支援萬用字元）。 |

### Codex

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `codex-api-key.*.api-key` | string | `""` | API 金鑰。 |
| `codex-api-key.*.prefix` | string | `""` | 可選字首。 |
| `codex-api-key.*.base-url` | string | `""` | 自訂 Codex 端點。 |
| `codex-api-key.*.headers` | object | `{}` | 自訂請求標頭。 |
| `codex-api-key.*.proxy-url` | string | `""` | 覆蓋全域代理。 |
| `codex-api-key.*.models.*.name` | string | `""` | 上游模型名。 |
| `codex-api-key.*.models.*.alias` | string | `""` | 使用者端別名。 |
| `codex-api-key.*.excluded-models` | string[] | `[]` | 排除模型（支援萬用字元）。 |

### Claude

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `claude-api-key.*.api-key` | string | `""` | API 金鑰。 |
| `claude-api-key.*.prefix` | string | `""` | 可選字首。 |
| `claude-api-key.*.base-url` | string | `""` | 自訂 Claude 端點。 |
| `claude-api-key.*.headers` | object | `{}` | 自訂請求標頭。 |
| `claude-api-key.*.proxy-url` | string | `""` | 覆蓋全域代理。 |
| `claude-api-key.*.models.*.name` | string | `""` | 上游模型名。 |
| `claude-api-key.*.models.*.alias` | string | `""` | 使用者端別名。 |
| `claude-api-key.*.excluded-models` | string[] | `[]` | 排除模型（支援萬用字元）。 |
| `claude-api-key.*.cloak.mode` | string | `"auto"` | 偽裝模式：`auto`（僅非 Claude Code）、`always`、`never`。 |
| `claude-api-key.*.cloak.strict-mode` | boolean | `false` | `true` 時刪除使用者系統訊息，僅保留 Claude Code 提示。 |
| `claude-api-key.*.cloak.sensitive-words` | string[] | `[]` | 需用零寬字元混淆的敏感詞。 |

### OpenAI 相容供應商

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `openai-compatibility.*.name` | string | `""` | 供應商名稱（用於 UA 等）。 |
| `openai-compatibility.*.prefix` | string | `""` | 可選字首。 |
| `openai-compatibility.*.disabled` | boolean | `false` | 停用該供應商（無需刪除設定），路由/選鑰會跳過。 |
| `openai-compatibility.*.base-url` | string | `""` | 供應商基礎 URL。 |
| `openai-compatibility.*.headers` | object | `{}` | 額外請求標頭。 |
| `openai-compatibility.*.api-key-entries.*.api-key` | string | `""` | API Key。 |
| `openai-compatibility.*.api-key-entries.*.proxy-url` | string | `""` | 針對該金鑰的代理。 |
| `openai-compatibility.*.models.*.name` | string | `""` | 上游模型名。 |
| `openai-compatibility.*.models.*.alias` | string | `""` | 使用者端別名。 |

### Vertex

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `vertex-api-key.*.api-key` | string | `""` | `x-goog-api-key` 值。 |
| `vertex-api-key.*.prefix` | string | `""` | 可選字首。 |
| `vertex-api-key.*.base-url` | string | `""` | Vertex 相容端點。 |
| `vertex-api-key.*.proxy-url` | string | `""` | 針對該金鑰的代理。 |
| `vertex-api-key.*.headers` | object | `{}` | 額外請求標頭。 |
| `vertex-api-key.*.models.*.name` | string | `""` | 上游模型名。 |
| `vertex-api-key.*.models.*.alias` | string | `""` | 使用者端別名。 |

## OAuth 模型別名

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `oauth-model-alias` | object | `{}` | 依供應商管道為模型重新命名（vertex、aistudio、antigravity、claude、codex）。 |
| `oauth-model-alias.*.*.fork` | boolean | `false` | 為 `true` 時保留原名並同時新增別名作為額外模型。 |
| `oauth-excluded-models` | object | `{}` | 按管道排除模型，支援萬用字元。 |

## Payload 規則

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `payload.default[].models[].name` | string | `""` | 符合的模型名稱（支援萬用字元）。 |
| `payload.default[].models[].protocol` | string | `""` | 限定 API 格式：`openai`/`gemini`/`claude`/`codex`/`antigravity`。 |
| `payload.default[].params` | object | `{}` | 預設時寫入的 JSON 路徑 → 值。 |
| `payload.default-raw[].models[].name` | string | `""` | 匹配的模型名（可通配）。 |
| `payload.default-raw[].models[].protocol` | string | `""` | 限定協議。 |
| `payload.default-raw[].params` | object | `{}` | 預設時寫入的原始 JSON 路徑 → 值（必須是有效 JSON）。 |
| `payload.override[].models[].name` | string | `""` | 匹配的模型名（可通配）。 |
| `payload.override[].models[].protocol` | string | `""` | 限定協議。 |
| `payload.override[].params` | object | `{}` | 總是覆蓋的 JSON 路徑 → 值。 |
| `payload.override-raw[].models[].name` | string | `""` | 匹配的模型名（可通配）。 |
| `payload.override-raw[].models[].protocol` | string | `""` | 限定協議。 |
| `payload.override-raw[].params` | object | `{}` | 總是覆蓋的原始 JSON 路徑 → 值（必須是有效 JSON）。 |
| `payload.filter[].models[].name` | string | `""` | 匹配的模型名（可通配）。 |
| `payload.filter[].models[].protocol` | string | `""` | 限定協議。 |
| `payload.filter[].params` | string[] | `[]` | 要刪除的 JSON 路徑清單。 |
