# 設定選項

預設值與可用欄位依循 `config.example.yaml` 的 v8 結構。

v8 檔案請將 `config-version` 設為 `8`。既有的舊版檔案與 `/v0/management` 請求仍可使用。當 v8 欄位與其舊版寫法同時存在時，以 v8 的值為準，包括 `false`、`0` 與空集合，且舊版欄位會在載入或儲存時移除。僅存在於舊版的欄位會保留原處，直到透過 `/v8/management` 成功寫入設定為止。僅設定 `config-version: 8` 或讀取設定，本身並不會遷移檔案。v8 管理寫入會拒絕舊版欄位名稱與未知的根章節。

根層級的 `api-keys` 對應關係保留給上游供應商群組使用。原先放在根層級 `api-keys` 清單中的用戶端金鑰，現在改為 `access.api-keys`。這兩種含義不能共用同一個 YAML 鍵。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `config-version` | integer | — | 存在時必須為 `8`。 |

## 伺服器

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `server.host` | string | `""` | 繫結位址。留空時監聽所有 IPv4 與 IPv6 介面。使用 `127.0.0.1` 或 `localhost` 僅限本機存取。 |
| `server.port` | integer | `8317` | 伺服器連接埠。`0` 或負值也會回退為 `8317`。 |
| `server.trusted-proxies` | string[] | `[]` | 允許提供轉送用戶端 IP 標頭的 IP 或 CIDR。留空時不信任任何來源。變更後需重新啟動。 |
| `server.tls.enable` | boolean | `false` | 啟用 HTTPS。 |
| `server.tls.cert` / `server.tls.key` | string | `""` | TLS 憑證與私鑰路徑。 |
| `server.commercial-mode` | boolean | `false` | 停用高開銷的請求記錄與中介軟體，以降低記憶體用量。 |
| `server.discovery.enabled` | boolean | `false` | 透過 mDNS / DNS-SD 廣播 `_ai-gateway._tcp`。Docker 必須使用 host 網路；鏈路本機多點傳送無法跨越預設橋接網路。 |
| `server.discovery.service-name` | string | `""` | 可選的名稱前綴。廣播名稱為 `CPA-<ShortID>` 或 `<name>-<ShortID>`。 |
| `server.discovery.service-type` | string | `"_ai-gateway._tcp"` | DNS-SD 服務類型。 |
| `server.discovery.subtypes` | string[] | chat, responses, messages, generate-content, interactions | API 通訊協定子類型。每個值都包含開頭的底線，例如 `_responses`。 |
| `server.discovery.interfaces.include` / `exclude` | string[] | `[]` | 介面允許清單與額外的排除模式。include 清單留空時會自動偵測實體介面。 |
| `server.discovery.auth-required` | boolean | `true` | 廣播用戶端必須進行身分驗證。 |
| `server.discovery.advertise-management` | boolean | `false` | 廣播管理功能可用。 |

## 管理 API

`secret-key` 留空時會停用 `/v0/management` 與 `/v8/management`（404）。localhost 存取仍需該金鑰。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `management.allow-remote` | boolean | `false` | 允許非 localhost 的管理存取。 |
| `management.secret-key` | string | `""` | 管理金鑰。明文會在啟動時雜湊。 |
| `management.disable-control-panel` | boolean | `false` | 停用隨附的管理面板資源與路由。 |
| `management.disable-auto-update-panel` | boolean | `false` | 停用面板的定期背景更新。面板缺失時，首次存取仍會抓取。 |
| `management.base-url` | string | `http://127.0.0.1:<port>` | `cliproxyapi --tui` 使用的遠端管理基礎 URL。`--management-base-url` 會覆寫它。 |
| `management.panel-github-repository` | string | `"https://github.com/router-for-me/Cli-Proxy-API-Management-Center"` | 管理面板套件的儲存庫或 releases API URL。 |

## 存取

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `access.api-keys` | string[] | `[]` | 此代理接受的用戶端金鑰。這些不是上游供應商金鑰。 |

## 路由

`routing.strategy` 接受 `round-robin`（預設）、`weighted-round-robin` 或 `fill-first`。`weightedroundrobin`、`wrr`、`fillfirst` 與 `ff` 為別名。

加權輪詢使用每個憑證的整數 `weight`。省略時為 `1`，最大值為 `1,000,000`，非正數的權重會在此策略生效期間排除該憑證。OAuth 或檔案憑證請將數值型 `weight` 放在 auth JSON 的頂層。

已建立的工作階段繫結優先於憑證優先順序。優先順序仍決定冷繫結、沒有工作階段的請求，以及故障轉移後的重新繫結。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `routing.strategy` | string | `"round-robin"` | 憑證選取策略。 |
| `routing.session-affinity` | boolean | `false` | 將工作階段繫結至憑證。優先採用 Claude Code、Codex、OpenCode 與 pi 的明確工作階段標頭，其次是 `prompt_cache_key`、Responses 對話 ID、舊版請求主體 ID、執行或衍生的工作階段身分，以及第一則訊息的雜湊。故障轉移保持啟用。 |
| `routing.session-affinity-ttl` | string | `"1h"` | 工作階段至憑證繫結的 TTL。低於一秒的值會提高為一秒。 |
| `routing.session-affinity-subagents` | boolean | `true` | 帶有父系參照的子工作階段，會在 Claude、Codex、Antigravity 與 Gemini 之間重用父系的憑證。`false` 時會以備援選取器分散它們。工作階段黏著性關閉時忽略此設定。 |
| `routing.force-model-prefix` | boolean | `false` | 無前綴的模型請求僅使用無前綴的憑證，前綴與模型名稱相同時除外。 |
| `routing.retry.request-retry` | integer | `3` | 第 0 輪之後的額外憑證輪次。第 `r` 輪僅接納有效值至少為 `r` 的憑證。適用於 HTTP 403、408、429、500、502、503 與 504。 |
| `routing.retry.max-retry-credentials` | integer | `0` | 每輪在輪次篩選後嘗試的不同憑證數。`0` 表示嘗試所有符合資格的憑證。被跳過的憑證仍會隨全域輪次一起老化。 |
| `routing.retry.max-retry-interval` | integer | `30` | 輪次之間等待冷卻的最長秒數。`0` 或更低時永不等待。它不會停用同輪故障轉移或立即進行的輪次。 |
| `routing.cooldown.disable-cooling` | boolean | `false` | 全域停用憑證與模型冷卻。憑證或供應商層級有給值時會覆寫它。 |
| `routing.cooldown.save-cooldown-status` | boolean | `false` | 將冷卻狀態以 `.cds` 檔案持久保存於憑證檔案旁。 |
| `routing.cooldown.transient-error-cooldown-seconds` | integer | `0` | 暫時性 408、500、502、503、504 與 520–526 錯誤的冷卻時間。`0` 使用舊版的 60 秒。`-1` 停用它。 |

每個憑證的 `request-retry`：明確的非負值優先，`0` 僅接納第 0 輪，省略或負值則繼承 `routing.retry.request-retry`。

## 請求

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `requests.proxy-url` | string | `""` | 全域對外代理（`socks5`、`http` 或 `https`）。 |
| `requests.passthrough-headers` | boolean | `false` | 將篩選過的上游回應標頭轉送給用戶端。 |
| `requests.nonstream-keepalive-interval` | integer | `0` | 為非串流回應每 N 秒送出空行。`0` 停用它。 |
| `requests.streaming.keepalive-seconds` | integer | `0` | SSE 保持連線間隔。值 `<= 0` 時停用。 |
| `requests.streaming.bootstrap-retries` | integer | `0` | 送出第一個位元組前的安全串流重試次數。 |
| `requests.streaming.send-keepalive-before-ft` | boolean | `false` | 當 `keepalive-seconds > 0` 時，在第一個 token 到達前送出 SSE 保持連線訊號。 |

每個條目的 `proxy-url` 接受 `direct` 或 `none`，以同時繞過此代理與環境代理。以 `$` 開頭的標頭值會複製該用戶端請求標頭，用戶端未送出該標頭時則省略。

Payload 規則位於 `requests.payload`。請參閱 [Payload 規則](#payload-規則)。

## 多媒體

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `multimedia.disable-image-generation` | boolean \| `"chat"` \| `"passthrough"` | `false` | `true` 停用圖片生成，並使 `/v1/images/*` 傳回 404。`"chat"` 僅在圖片端點之外停用注入。`"passthrough"` 讓非圖片用戶端 payload 保持不變，在圖片端點上的行為與 `"chat"` 相同。 |
| `multimedia.gpt-image-2-base-model` | string | `"gpt-5.4-mini"` | 舊版託管圖片生成路徑的基礎模型。必須以 `gpt-` 開頭。無效值會使用預設值。 |
| `multimedia.video-result-auth-cache-ttl` | string | `"3h"` | 來自 `/openai/v1/videos` 與 xAI 影片建立的影片 ID，與建立它的憑證保持繫結的時長。 |

## 可觀測性

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `observability.logs.debug` | boolean | `false` | 啟用除錯記錄。 |
| `observability.logs.request-log` | boolean | `false` | 記錄代理的請求與回應。管理請求除外。 |
| `observability.logs.logging-to-file` | boolean | `false` | 寫入輪替的應用程式記錄，而非 stdout。 |
| `observability.logs.logs-max-total-size-mb` | integer | `0` | 記錄目錄總大小上限（MB）。`0` 停用此限制。 |
| `observability.logs.error-logs-max-files` | integer | `10` | 請求記錄停用時保留的錯誤記錄檔案數。`0` 停用清理。 |
| `observability.usage.usage-statistics-enabled` | boolean | `false` | 啟用記憶體內用量彙總。 |
| `observability.usage.redis-usage-queue-retention-seconds` | integer | `60` | 用量佇列項目在記憶體中為 Management API 保留的秒數。最大值 `3600`。本機 Redis RESP 用量輸出已停用。 |
| `observability.pprof.enable` | boolean | `false` | 啟用 pprof HTTP 除錯伺服器。 |
| `observability.pprof.addr` | string | `"127.0.0.1:8316"` | pprof 繫結位址。請保持在本機。 |

## 外掛

受信任的行程內外掛預設停用。`plugins.configs.<plugin-id>.enabled` 不會改變 `plugins.enabled`。`plugins.auth-revision` 是 Home 擁有的中繼資料，不是一般設定。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `plugins.enabled` | boolean | `false` | 啟用動態外掛。 |
| `plugins.dir` | string | `"plugins"` | 外掛探索目錄。 |
| `plugins.store-sources` | string[] | `[]` | 額外的外掛商店註冊表 URL。官方註冊表永遠包含在內。 |
| `plugins.store-auth[].match` | string | `""` | 一條驗證規則的 URL 前綴。HTTP 需要 `allow-insecure: true`。 |
| `plugins.store-auth[].apply-to` | string[] | `[]` | 請求種類：`registry`、`metadata` 和／或 `artifact`。 |
| `plugins.store-auth[].type` | string | `""` | `none`、`bearer`、`basic`、`header` 或 `github-token`。 |
| `plugins.store-auth[].token-env` | string | `""` | 存放 bearer、GitHub 或其他權杖的環境變數。 |
| `plugins.store-auth[].username-env` / `password-env` | string | `""` | 基本驗證用的環境變數。 |
| `plugins.store-auth[].header-name` / `header-value-env` | string | `""` | 標頭名稱，以及存放其值的環境變數。 |
| `plugins.store-auth[].allow-insecure` | boolean | `false` | 在支援時允許不安全的驗證設定。 |
| `plugins.configs.<plugin-id>.enabled` | boolean | `false` | 啟用一個外掛實例。 |
| `plugins.configs.<plugin-id>.priority` | integer | `0` | 外掛啟動與路由優先順序。 |

外掛實例下的其他鍵會為該外掛保留。

## OAuth 與檔案憑證

`oauth.providers` 下的設定適用於 OAuth 與檔案型憑證。它們不適用於 `api-keys` 群組。權杖資料保留在憑證儲存區中。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `oauth.auth-dir` | string | `"~/.cli-proxy-api"` | 憑證目錄。支援 `~`。 |
| `oauth.auth-auto-refresh-workers` | integer | `16` | OAuth 與檔案認證的重新整理背景工作數。值 `<= 0` 時保持預設值。 |
| `oauth.model-alias` | object | `{}` | 依管道區分的模型別名：`vertex`、`aistudio`、`antigravity`、`claude`、`codex`、`kimi`、`xai`、`meta`，或 OAuth 外掛供應商鍵。不套用到 `api-keys` 群組。 |
| `oauth.model-alias.*.*.name` / `alias` | string | `""` | 上游模型 ID 與用戶端可見 ID。同一個名稱可以以不同別名重複出現。 |
| `oauth.model-alias.*.*.fork` | boolean | `false` | 保留上游模型，並同時公開別名。 |
| `oauth.model-alias.*.*.display-name` | string | `""` | 別名的目錄標籤。 |
| `oauth.model-alias.*.*.force-mapping` | boolean | `false` | 在上游回應的模型欄位中傳回用戶端可見的別名。 |
| `oauth.excluded-models` | object | `{}` | 依相同管道排除的模型。支援萬用字元。 |
| `oauth.request-scoped-errors` | object | `{}` | 依管道區分的自訂上游錯誤規則。 |
| `oauth.request-scoped-errors.*.[].status` | integer | — | 要比對的 HTTP 狀態。 |
| `oauth.request-scoped-errors.*.[].match` | string[] | `[]` | 主體子字串。比對區分大小寫。 |
| `oauth.request-scoped-errors.*.[].match-regexr` | string[] | `[]` | 針對主體比對的正規表示式。 |
| `oauth.request-scoped-errors.*.[].action` | string | — | `stop`、`stop-and-cooldown`、`continue` 或 `continue-and-cooldown`。 |

請求範圍規則若缺少狀態，或沒有任何 `match` 或 `match-regexr` 模式，會被忽略。

auth JSON 中個別憑證的 `model_aliases` 陣列僅適用於該憑證，並覆寫具有相同用戶端可見名稱的全域別名。舊版 `model-aliases` 會在載入時正規化。

### AI Studio

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `oauth.providers.aistudio.ws-auth` | boolean | `true` | 要求 `/v1/ws` 進行身分驗證。 |

### Codex

這些欄位不適用於 `api-keys.codex`。API 金鑰偽裝使用 `keys[].disable-codex-cloaking`。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `oauth.providers.codex.response-steering` | boolean | `false` | 實驗性全雙工 Responses WebSocket steering。一個 socket 固定在一個帳號與模型上，已接受的輸入不會重播。 |
| `oauth.providers.codex.disable-codex-cloaking` | boolean | `false` | 不在 HTTP、SSE 或 WebSocket 請求上強制使用官方 Codex User-Agent 與 Originator 標頭。 |
| `oauth.providers.codex.stream-bootstrap-buffering` | boolean | `false` | 暫存握手、心跳與空的 `*.added` 訊框，直到第一個生成事件為止，讓串流內的過載或速率限制失敗能在回應標頭送出前故障轉移。上限為 48 個訊框與 1 MiB，不以時間為界。 |
| `oauth.providers.codex.stream-bootstrap-timeout` | string | `"0"` | 可選的時間上限，例如 `"20s"`。`0`、`0s`、`none`、`unlimited`、`disabled`、`off` 與 `never` 表示無上限。這不會中止上游連線。 |
| `oauth.providers.codex.optimize-multi-agent-v2` | boolean | `false` | 優化 Codex Desktop、`codex-tui` 與 `codex_cli_rs` 的 multi-agent v2 請求。不適用於 API 金鑰憑證。 |
| `oauth.providers.codex.orphan-delegation-compatibility` | boolean | `false` | 當 `X-Openai-Subagent` 為 `collab_spawn` 時，將來自 `codex_app/create_thread` 與 `codex_app/send_message_to_thread` 的孤立 `function_call_output` 項目轉換為使用者訊息。 |
| `oauth.providers.codex.model-level-cooling` | boolean | `false` | 將 Codex `usage_limit_reached` 冷卻限定在所請求的模型。 |
| `oauth.providers.codex.header-defaults.user-agent` | string | `""` | 用戶端省略時，HTTP 與 WebSocket OAuth 請求的備援 User-Agent。 |
| `oauth.providers.codex.header-defaults.beta-features` | string | `""` | 僅供 WebSocket OAuth 請求的備援 beta 功能。 |
| `oauth.providers.codex.live-media-relay.enabled` | boolean | `false` | 在此行程中轉送 Codex Live WebRTC 音訊與 DataChannel 流量。需要入站 UDP。 |
| `oauth.providers.codex.live-media-relay.max-sessions` | integer | `32` | 同時進行的媒體工作階段上限。`0` 使用 32。 |
| `oauth.providers.codex.live-media-relay.disable-private-remote-ips` | boolean | `false` | 拒絕指向私有、回環、鏈路本機或未指定 IP 的下游 SDP candidate。 |
| `oauth.providers.codex.live-media-relay.public-ip` | string | `""` | 在 1:1 NAT 後方廣播的公用位址。 |
| `oauth.providers.codex.live-media-relay.udp-port-min` / `udp-port-max` | integer | `0` | 可選的 UDP 範圍。兩者都要設定，且每個工作階段至少兩個連接埠。 |
| `oauth.providers.codex.live-media-relay.ice-servers[].urls` | string[] | `[]` | STUN 或 TURN URL。 |
| `oauth.providers.codex.live-media-relay.ice-servers[].username` / `credential` | string | `""` | TURN 憑證。它們永遠不會由 JSON 設定 API 傳回。 |

使用 `http`、`https`、`socks5` 或 `socks5h` 代理時，面向 OpenAI 的媒體連線會被強制透過已驗證的 ICE-TCP，且不會回退到 UDP 或直接連線。面向 Codex Desktop 的連線保持直接連線。舊版名稱 `allow-private-remote-ips` 是 `disable-private-remote-ips` 的反義，僅會由 v8 遷移或儲存改寫。

### Claude

`disable-claude-cloak-mode` 僅影響 OAuth 憑證。API 金鑰使用 `api-keys.claude[].keys[].cloak`。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `oauth.providers.claude.model-level-cooling` | boolean | `false` | 將配額冷卻限定在所請求的模型，而非整個憑證。 |
| `oauth.providers.claude.disable-claude-cloak-mode` | boolean | `false` | 原樣傳遞原始 system prompt。憑證的 `cloak_mode` 可以覆寫它。`false` 保持依用戶端而定的 `auto` 行為。 |
| `oauth.providers.claude.claude-code.disable-cloaking-model-list` | boolean | `false` | 在 Anthropic 模型清單回應中傳回原始模型 ID，而非偽裝後的 ID。 |
| `oauth.providers.claude.header-defaults.user-agent` | string | `""` | 當用戶端未經確認，或不在設定的主／次版本線內時，使用的實測 Claude Code CLI 基線。 |
| `oauth.providers.claude.header-defaults.package-version` / `runtime-version` | string | `""` | 該基線中的套件版本與執行階段版本。 |
| `oauth.providers.claude.header-defaults.os` / `arch` | string | `""` | 由執行階段衍生，除非裝置設定檔穩定化將它們固定。 |
| `oauth.providers.claude.header-defaults.timeout` | string | `""` | 備援逾時標頭。 |
| `oauth.providers.claude.header-defaults.timezone` | string | `""` | 偽裝 `currentDate` 用的備援 IANA 時區。憑證 JSON 的 `timezone` 優先。 |
| `oauth.providers.claude.header-defaults.stabilize-device-profile` | boolean | `false` | 為每個憑證將作業系統與架構固定為此基線。 |

### Antigravity、xAI 與 Devin

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `oauth.providers.antigravity.antigravity-credits` | boolean | `true` | Claude 的最後備援：free-tier 憑證耗盡（429/503）後，改用具有 Google One AI credits 的憑證重試。 |
| `oauth.providers.antigravity.signature-cache-enabled` | boolean | `true` | 優先使用並驗證快取的思考區塊簽章。`false` 使用繞過模式。 |
| `oauth.providers.antigravity.signature-bypass-strict` | boolean | `false` | 在繞過模式中，驗證完整的 Claude protobuf 簽章，而非僅基本格式。 |
| `oauth.providers.antigravity.sensitive-words` | string[] | `[]` | 要在 system instructions 中以零寬字元混淆的詞彙。 |
| `oauth.providers.antigravity.connection-pool.enabled` | boolean | `false` | 啟用上游 HTTP 連線集區。 |
| `oauth.providers.antigravity.connection-pool.idle-conn-timeout` | string | `"30s"` | 閒置保持連線逾時，上限為 210 秒。 |
| `oauth.providers.antigravity.connection-pool.max-idle-conns-per-host` | integer | `2` | 每個憑證對每個主機的最大閒置連線數。 |
| `oauth.providers.xai.inject-x-search` | boolean | `false` | 當請求未宣告原生 `x_search` 工具時注入它，適用時也包括 `tool_choice.allowed_tools`。 |
| `oauth.providers.devin.sensitive-words` | string[] | `[]` | 要在 Devin system instructions 與 prompt 中以零寬字元混淆的詞彙。 |

## 上游 API 金鑰

`api-keys.<provider>` 是群組清單。每個群組有一個 `name`、一個 `base-url`、共用設定，以及一個 `keys` 清單。另一個端點請新增另一個群組。`base-url` 屬於群組，不屬於金鑰。

群組共用欄位為 `priority`、`prefix`、`proxy-url`、`headers`、`models`、`excluded-models`、`disable-cooling`、`request-retry` 與 `request-scoped-errors`。金鑰欄位缺失或為 `null` 時，先繼承群組值，再使用執行階段備援值。在欄位支援的情況下，明確的 `false`、`0`、空字串與空集合會覆寫繼承值。Map 與清單的覆寫會整體取代繼承值。`weight` 屬於每個金鑰。金鑰的 `proxy-url` 留空時會回退到 `requests.proxy-url`。

`priority` 預設為 `0`；值越高越優先。省略的 `weight` 預設為 `1`。

### 共用欄位

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `api-keys.<provider>[].name` | string | — | 群組名稱。 |
| `api-keys.<provider>[].base-url` | string | provider-specific | 群組中每個金鑰共用的端點。 |
| `api-keys.<provider>[].priority` | integer | `0` | 選取優先順序。 |
| `api-keys.<provider>[].prefix` | string | `""` | 可選的模型前綴。用戶端以 `prefix/model` 呼叫。 |
| `api-keys.<provider>[].disable-cooling` | boolean | inherit | 存在時覆寫 `routing.cooldown.disable-cooling`。 |
| `api-keys.<provider>[].request-retry` | integer | inherit | 每個群組的重試覆寫。請參閱上方的路由重試。 |
| `api-keys.<provider>[].request-scoped-errors[]` | object[] | `[]` | 與 `oauth.request-scoped-errors` 相同的 `status`、`match`、`match-regexr` 與 `action` 欄位。規則需要一個狀態與至少一個模式。Vertex 不支援此欄位。 |
| `api-keys.<provider>[].headers` | object | `{}` | 額外的請求標頭。 |
| `api-keys.<provider>[].proxy-url` | string | `""` | 群組代理覆寫。 |
| `api-keys.<provider>[].excluded-models` | string[] | `[]` | 排除的模型。支援 `*`、前綴、後綴與子字串萬用字元。 |
| `api-keys.<provider>[].keys[].api-key` | string | `""` | 上游 API 金鑰。 |
| `api-keys.<provider>[].keys[].weight` | integer | `1` | 加權輪詢份額。最大值 `1,000,000`。非正數會在該策略生效期間排除此金鑰。 |
| `api-keys.<provider>[].models[].name` / `alias` | string | `""` | 上游模型名稱與用戶端別名。 |
| `api-keys.<provider>[].models[].display-name` | string | `""` | 目錄標籤。 |
| `api-keys.<provider>[].models[].max-context-length` | integer | `0` | 覆寫向 Codex 用戶端廣播的內容視窗。Vertex 不使用。 |
| `api-keys.<provider>[].models[].force-mapping` | boolean | `false` | 將上游回應的模型欄位改寫為別名。 |
| `api-keys.<provider>[].models[].is-compat` | boolean | `false` | 為相容的上游保留空簽章的思考區塊。Codex 在同時開啟 `optimize-multi-agent-v2` 時，用它進行可攜的 multi-agent `agent_message` 轉換。Vertex 不使用。 |
| `api-keys.<provider>[].models[].thinking.levels` | string[] | provider-specific | 離散的推理等級。 |
| `api-keys.<provider>[].models[].thinking.min` / `max` | integer | — | 當模型以預算而非等級為基礎時的預算範圍。 |
| `api-keys.<provider>[].models[].thinking.zero-allowed` / `dynamic-allowed` | boolean | `false` | 允許預算 `0` 或動態預算 `-1`。 |

相同的金鑰欄位可以覆寫共用群組欄位。金鑰不得重複 `base-url`。

### Gemini 與 Interactions

`api-keys.gemini` 與 `api-keys.interactions` 使用共用欄位。Interactions 金鑰僅用於直接執行 `/v1beta/interactions`。當用戶端透過 interactions API 進入時，Gemini 金鑰仍會處理 `generateContent`。

預設基礎 URL 為 `https://generativelanguage.googleapis.com`。API 金鑰與基礎 URL 皆為空的條目會被移除，重複的 Gemini 條目也會被移除。

### Vertex

`api-keys.vertex` 使用共用欄位，但不包括 `request-scoped-errors`、`max-context-length` 與 `is-compat`。`base-url` 為可選，省略時回退到 Google Vertex。API 金鑰以 `x-goog-api-key` 送出。沒有 API 金鑰的條目會被移除。模型對應需要同時有 `name` 與 `alias`。

### Codex

`api-keys.codex` 使用共用欄位。沒有 `base-url` 的群組會被捨棄。OAuth Codex 供應商選項不適用於此處。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `api-keys.codex[].keys[].websockets` | boolean | `false` | 使用上游 Responses API WebSocket 傳輸。 |
| `api-keys.codex[].keys[].alpha-search` | boolean | `false` | 允許此金鑰在 `base-url` + `/alpha/search` 提供 `/v1/alpha/search`。 |
| `api-keys.codex[].keys[].disable-codex-cloaking` | boolean | `false` | `true` 停用此金鑰的偽裝。省略時不繼承 `oauth.providers.codex.disable-codex-cloaking`。 |
| `api-keys.codex[].models[].support-configuration-update` | boolean | `false` | 為此 API 金鑰模型啟用 `configuration_update`。 |

### Claude

`api-keys.claude` 使用共用欄位。官方 Claude API 的 `base-url` 可以留空。OAuth 偽裝與標頭預設值不適用於這些金鑰。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `api-keys.claude[].keys[].rebuild-mid-system-message` | boolean | `false` | 將角色為 `system` 的訊息移到 Claude 的頂層 system 欄位。 |
| `api-keys.claude[].keys[].cloak.mode` | string | `"auto"` | `auto` 偽裝未確認的用戶端，`always` 偽裝每個未確認的用戶端，`never` 停用偽裝。已確認的原生 Claude Code 保持透通傳遞。 |
| `api-keys.claude[].keys[].cloak.strict-mode` | boolean | `false` | `true` 移除呼叫端 prompt，僅保留 Claude Code 計費與身分區塊。 |
| `api-keys.claude[].keys[].cloak.sensitive-words` | string[] | `[]` | 要以零寬字元混淆的詞彙。 |
| `api-keys.claude[].keys[].cloak.cache-user-id` | boolean | `false` | 為此 API 金鑰重用快取的 `user_id`。 |
| `api-keys.claude[].keys[].fingerprint-profile` | string | `""` | 留空時保留呼叫端指紋。`claude-code-cli` 選擇 Claude Code CLI Messages 形態。`oauth-cli` 是舊版別名。 |
| `api-keys.claude[].keys[].experimental-cch-signing` | boolean | `false` | 已淘汰的相容性欄位。真正的 Claude OAuth 會自動產生 CCH，且 `claude-code-cli` 設定檔僅在 `api.anthropic.com` 上產生。 |

委派的 OAuth 檔案在 auth JSON 中使用 `fingerprint_profile`。舊版 `fingerprint-profile` 會在載入時正規化。`count_tokens` 保持原生的 model、messages 與 tools 形態。CCH 簽署遵循原生閘門：僅 `api.anthropic.com` 與 Vertex。

### xAI

`api-keys.xai` 使用原生 xAI 執行器與共用欄位。沒有 `base-url` 的群組會被捨棄。常用端點為 `https://api.x.ai/v1`。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `api-keys.xai[].keys[].websockets` | boolean | `false` | 為下游 WebSocket 請求使用 xAI 上游 WebSocket 傳輸。 |

xAI 金鑰的 `alpha-search` 會被強制關閉。

### Meta

`api-keys.meta` 使用原生 Meta 執行器。空的 `base-url` 會變成 `https://api.meta.ai/v1`。API 金鑰為空，或金鑰以 `dca:` 開頭的條目會被移除；DCA 權杖應放在 OAuth 儲存區中。

### OpenAI 相容性

`api-keys.openai-compatibility` 將供應商設定保留在群組上。它的 `keys` 條目僅為 API 金鑰記錄，並取代舊版 `api-key-entries` 欄位。沒有 `base-url` 的群組會被捨棄。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `api-keys.openai-compatibility[].name` | string | `""` | 供應商識別碼，包括它在使用者代理程式中的用途。 |
| `api-keys.openai-compatibility[].disabled` | boolean | `false` | 停用此供應商而不移除它。 |
| `api-keys.openai-compatibility[].support-prompt-cache-key` | boolean | `false` | 為來自所有輸入通訊協定的請求衍生 `prompt_cache_key`。 |
| `api-keys.openai-compatibility[].keys[].api-key` / `proxy-url` / `weight` | mixed | — | 金鑰、可選代理與加權輪詢權重。 |
| `api-keys.openai-compatibility[].models[].image` | boolean | `false` | 允許模型用於 `/v1/images/generations` 與 `/v1/images/edits`。這不宣告 chat 或 responses 的圖片輸入。 |
| `api-keys.openai-compatibility[].models[].input-modalities` / `output-modalities` | string[] | `[]` | 宣告的輸入或輸出能力，例如 `text` 與 `image`。 |
| `api-keys.openai-compatibility[].models[].use-max-completion-tokens` | boolean | `false` | 送出 `max_completion_tokens` 而非 `max_tokens`。 |
| `api-keys.openai-compatibility[].models[].thinking.levels` | string[] | `["low", "medium", "high"]` | 省略 `thinking` 時使用。未宣告的較高等級，例如 `max` 或 `xhigh`，會被箝制為 `high`。 |

重複同一個別名會建立內部上游集區。用戶端只看到一個別名。請求在這些上游名稱之間輪詢，若所選上游在產生輸出前失敗，則繼續使用下一個名稱。

## Payload 規則

`requests.payload.default`、`default-raw`、`override`、`override-raw` 與 `filter` 是規則陣列。`default*` 僅寫入缺失的值，`override*` 永遠寫入，`filter` 移除路徑。`*-raw` 的值必須是有效的 JSON，並以原始 JSON 插入。

| 參數 | 型別 | 預設值 | 描述 |
| --- | --- | --- | --- |
| `requests.payload.<rule>[].models[].name` | string | `""` | 模型名稱或萬用字元。 |
| `requests.payload.<rule>[].models[].protocol` | string | `""` | 目標通訊協定：`openai`、`gemini`、`claude`、`codex` 或 `antigravity`。 |
| `requests.payload.<rule>[].models[].from-protocol` | string | `""` | 來源通訊協定：`openai`、`responses`、`gemini` 或 `claude`。`openai-response`、`openai-responses` 與 `response` 會正規化為 `responses`。 |
| `requests.payload.<rule>[].models[].headers` | object | `{}` | 必要的請求標頭模式。值支援 `*`。 |
| `requests.payload.<rule>[].models[].match` / `not-match` | object[] | `[]` | 必須等於，或不得等於所設定值的 JSON 路徑條件。 |
| `requests.payload.<rule>[].models[].exist` / `not-exist` | string[] | `[]` | 必須存在且非 null，或必須缺失或為 null 的 JSON 路徑。 |
| `requests.payload.default[].params` / `override[].params` | object | `{}` | JSON 路徑對應值。 |
| `requests.payload.default-raw[].params` / `override-raw[].params` | object | `{}` | JSON 路徑對應原始 JSON。 |
| `requests.payload.filter[].params` | string[] | `[]` | 要移除的 JSON 路徑。 |

## 舊版佈局

舊版檔案在 v8 成功寫入前持續有效。若要在混合檔案中再次使用舊版欄位，請先移除對應的 v8 欄位。

| 舊版 | v8 |
| --- | --- |
| `host`, `port`, `trusted-proxies`, `tls`, `commercial-mode`, `discovery` | `server.*` |
| `remote-management` | `management` |
| `api-keys` 字串清單 | `access.api-keys` |
| `credential-concurrency`, `credential-in-flight` | `credentials.concurrency`, `credentials.in-flight` |
| `force-model-prefix` | `routing.force-model-prefix` |
| `request-retry`, `max-retry-credentials`, `max-retry-interval` | `routing.retry.*` |
| `disable-cooling`, `save-cooldown-status`, `transient-error-cooldown-seconds` | `routing.cooldown.*` |
| `proxy-url`, `passthrough-headers`, `nonstream-keepalive-interval`, `streaming`, `payload` | `requests.*` |
| `auth-dir`, `auth-auto-refresh-workers` | `oauth.auth-dir`, `oauth.auth-auto-refresh-workers` |
| `oauth-model-alias`, `oauth-excluded-models`, `oauth-request-scoped-errors` | `oauth.model-alias`, `oauth.excluded-models`, `oauth.request-scoped-errors` |
| `ws-auth` | `oauth.providers.aistudio.ws-auth` |
| `codex`, `codex-header-defaults` | `oauth.providers.codex`，包含 `header-defaults` |
| `claude`, `claude-code`, `disable-claude-cloak-mode`, `claude-header-defaults` | `oauth.providers.claude` |
| `antigravity`, `antigravity-signature-cache-enabled`, `antigravity-signature-bypass-strict` | `oauth.providers.antigravity` |
| `quota-exceeded.antigravity-credits` | `oauth.providers.antigravity.antigravity-credits` |
| `xai`, `devin` | `oauth.providers.xai`, `oauth.providers.devin` |
| `disable-image-generation`, `gpt-image-2-base-model`, `video-result-auth-cache-ttl` | `multimedia.*` |
| `debug`, `logging-to-file`, `logs-max-total-size-mb`, `error-logs-max-files`, `request-log` | `observability.logs.*` |
| `usage-statistics-enabled`, `redis-usage-queue-retention-seconds` | `observability.usage.*` |
| `pprof` | `observability.pprof` |
| `gemini-api-key`, `interactions-api-key`, `vertex-api-key`, `codex-api-key`, `claude-api-key`, `xai-api-key`, `meta-api-key` | 帶有 `keys` 清單的 `api-keys.<provider>` 群組 |
| `openai-compatibility` 與 `api-key-entries` | `api-keys.openai-compatibility` 與 `keys` |

`credentials.concurrency` 與 `credentials.in-flight` 是 Home 管理的契約。在 Home 模式下，合成的 Home 設定優先，本機值會被忽略。

`quota-exceeded.switch-project` 與 `quota-exceeded.switch-preview-model` 沒有 v8 對應欄位。它們在舊版檔案中與透過 `/v0/management` 仍可讀取與編輯，但會從 v8 範本中省略。
