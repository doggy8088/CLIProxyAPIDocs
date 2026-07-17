# 基本設定

## 設定檔

伺服器預設使用專案根目錄的 YAML 設定檔（`config.yaml`）。可透過 `--config` 指定其他路徑：

```bash
./cli-proxy-api --config /path/to/your/config.yaml
```

> macOS 透過 Homebrew 安裝並以 `brew services` 執行時，預設讀取 `$(brew --prefix)/etc/cliproxyapi.conf`（Apple Silicon 常見為 `/opt/homebrew/etc/cliproxyapi.conf`，Intel 常見為 `/usr/local/etc/cliproxyapi.conf`）。
> 若希望沿用 `~/.cli-proxy-api/config.yaml`，可在預設路徑建立指向該檔案的符號連結。

### 設定檔範例

```yaml
# 伺服器繫結主機/介面，預設空字串同時繫結 IPv4/IPv6。
# 使用 "127.0.0.1" 或 "localhost" 可限制僅本機存取。
host: ""

# 伺服器連接埠
port: 8317

# TLS 設定：啟用後使用指定的憑證與私鑰監聽 HTTPS。
tls:
  enable: false
  cert: ""
  key: ""

# 管理 API 設定
remote-management:
  # 是否允許遠端（非 localhost）存取管理介面。
  # 為 false 時僅允許 localhost，仍需管理金鑰。
  allow-remote: false

  # 管理金鑰。若填寫明文，啟動時會自動雜湊後生效。
  # 所有管理請求（包括本機）都需要該金鑰。
  # 留空則完全停用管理 API（所有 /v0/management 路由傳回 404）。
  secret-key: ""

  # 為 true 時停用內建管理面板資源下載與路由。
  disable-control-panel: false

  # 管理面板的 GitHub 儲存庫，可填寫儲存庫 URL 或 Releases API URL。
  panel-github-repository: "https://github.com/router-for-me/Cli-Proxy-API-Management-Center"

# 憑證目錄（支援 ~ 展開為主目錄）
auth-dir: "~/.cli-proxy-api"

# 用於請求驗證的 API 金鑰
api-keys:
  - "your-api-key-1"
  - "your-api-key-2"
  - "your-api-key-3"

# 是否啟用除錯記錄
debug: false

# 為 true 時停用高開銷 HTTP 中介軟體以降低高併發下的記憶體佔用
commercial-mode: false

# 為 true 時將應用程式記錄寫入滾動檔案而非 stdout
logging-to-file: false

# 記錄目錄的最大總大小（MB）；超過後會刪除最舊的記錄。0 表示不限制。
logs-max-total-size-mb: 0

# 為 false 時停用記憶體用量統計聚合
usage-statistics-enabled: false

# 代理位址。支援 socks5/http/https，例如 socks5://user:pass@192.168.1.1:1080/
proxy-url: ""

# 為 true 時，無字首模型請求只會匹配無字首憑證（除非字首與模型名相同）。
force-model-prefix: false

# 請求重試次數；當 HTTP 狀態碼為 403/408/500/502/503/504 時重試。
request-retry: 3

# 冷卻中的憑證等待的最長時間（秒），超過則觸發重試。
max-retry-interval: 30

# disable-image-generation 支援：false（預設）、true、或 "chat"。
# - true：完全停用 image_generation（同時 /v1/images/generations 與 /v1/images/edits 傳回 404）。
# - "chat"：僅停用非 images 端點的 image_generation 插入，但保留 /v1/images/generations 與 /v1/images/edits。
disable-image-generation: false

# 配額超限時的處理
quota-exceeded:
  switch-project: true # 配額超限時是否自動切換其他專案
  switch-preview-model: true # 配額超限時是否自動切換預覽模型
  antigravity-credits: true # Claude credits 備援：當所有 free-tier 憑證耗盡（429/503）時，使用帶 Google One AI credits 的憑證進行最後備援重試

# 多憑證匹配時的路由策略
routing:
  strategy: "round-robin" # 循環選擇（預設）或 fill-first
  # 為所有用戶端啟用工作階段黏著性路由。
  # 工作階段 ID 來源：metadata.user_id（Claude Code 工作階段格式）、
  # X-Session-ID、Session_id（Codex）、
  # X-Client-Request-Id（PI）、conversation_id，或前幾則訊息的雜湊。
  # 當繫結的憑證不可用時，會自動容錯移轉。
  session-affinity: false # 預設：false
  # 工作階段繫結的保留時間。預設：1h
  session-affinity-ttl: "1h"

# 是否為 WebSocket API (/v1/ws) 啟用身分驗證
ws-auth: false

# 當 > 0 時，為非串流回應每隔 N 秒傳送空行以防止空閒逾時
nonstream-keepalive-interval: 0

# 當為 true 時，為 Codex API 請求插入官方 Codex 指令
# 當為 false（預設）時，CodexInstructionsForModel 立即傳回而不修改
codex-instructions-enabled: false

# 串流傳輸行為（SSE keep-alive 與安全啟動重試）
streaming:
  keepalive-seconds: 15   # 預設：0（停用）；小於或等於 0 時關閉 keep-alive。
  bootstrap-retries: 1    # 預設：0（停用）；首位元組前的重試次數。

# Gemini API 金鑰
gemini-api-key:
  - api-key: "AIzaSy...01"
    prefix: "test" # 可選：需要以 "test/gemini-3-pro-preview" 存取
    base-url: "https://generativelanguage.googleapis.com"
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080"
    models:
      - name: "gemini-2.5-flash" # 上游模型名
        alias: "gemini-flash"    # 用戶端別名
    excluded-models:
      - "gemini-2.5-pro"     # 精確排除
      - "gemini-2.5-*"       # 字首萬用字元
      - "*-preview"          # 字尾萬用字元
      - "*flash*"            # 包含字串的萬用字元
  - api-key: "AIzaSy...02"

# Codex API 金鑰
codex-api-key:
  - api-key: "sk-atSM..."
    prefix: "test" # 可選：需以 "test/gpt-5-codex" 存取
    base-url: "https://www.example.com" # 自訂 Codex 端點
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080" # 可選：單獨代理
    models:
      - name: "gpt-5-codex"   # 上游模型名
        alias: "codex-latest" # 用戶端別名
    excluded-models:
      - "gpt-5.1"         # 精確排除
      - "gpt-5-*"         # 字首萬用字元
      - "*-mini"          # 字尾萬用字元
      - "*codex*"         # 包含字串的萬用字元

# Claude API 金鑰
claude-api-key:
  - api-key: "sk-atSM..." # 使用官方 Claude API 時無需 base-url
  - api-key: "sk-atSM..."
    prefix: "test" # 可選：需以 "test/claude-sonnet-latest" 存取
    base-url: "https://www.example.com" # 自訂 Claude 端點
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080" # 可選：單獨代理
    models:
      - name: "claude-3-5-sonnet-20241022" # 上游模型名
        alias: "claude-sonnet-latest"      # 用戶端別名
    excluded-models:
      - "claude-opus-4-5-20251101" # 精確排除
      - "claude-3-*"               # 字首萬用字元
      - "*-thinking"               # 字尾萬用字元
      - "*haiku*"                  # 包含字串的萬用字元
    cloak:                         # 可選：為非 Claude Code 用戶端進行請求偽裝
      mode: "auto"                 # "auto"（預設）：僅當用戶端不是 Claude Code 時偽裝
                                   # "always"：一律套用偽裝
                                   # "never"：永不套用偽裝
      strict-mode: false           # false（預設）：將 Claude Code 提示加到使用者系統訊息之前
                                   # true：刪除所有使用者系統訊息，只保留 Claude Code 提示
      sensitive-words:             # 可選：用零寬字元混淆的詞彙
        - "API"
        - "proxy"

# OpenAI 相容供應商
openai-compatibility:
  - name: "openrouter" # 供應商名稱，用於 UA 等
    disabled: false # 可選：設為 true 則停用該供應商而無需刪除
    prefix: "test" # 可選：需以 "test/kimi-k2" 存取
    base-url: "https://openrouter.ai/api/v1" # 供應商基礎 URL
    headers:
      X-Custom-Header: "custom-value"
    api-key-entries:
      - api-key: "sk-or-v1-...b780"
        proxy-url: "socks5://proxy.example.com:1080" # 可選：單獨代理
      - api-key: "sk-or-v1-...b781" # 無代理
    models: # 供應商支援的模型
      - name: "moonshotai/kimi-k2:free" # 上游模型名
        alias: "kimi-k2" # 用戶端別名

# Vertex API 金鑰（Vertex 相容端點，使用 API key + base URL）
vertex-api-key:
  - api-key: "vk-123..."                        # x-goog-api-key 標頭
    prefix: "test"                              # 可選字首
    base-url: "https://example.com/api"         # 例如 https://zenmux.ai/api
    proxy-url: "socks5://proxy.example.com:1080" # 可選單獨代理
    headers:
      X-Custom-Header: "custom-value"
    models:                                     # 可選：別名到上游模型
      - name: "gemini-2.5-flash"                # 上游模型名
        alias: "vertex-flash"                   # 用戶端別名
      - name: "gemini-2.5-pro"
        alias: "vertex-pro"

# 全域 OAuth 模型名稱別名（依供應商管道）
# 這些別名同時用於模型清單和請求路由的模型 ID 重新命名。
# 支援下列供應商管道：vertex、aistudio、antigravity、claude、codex。
# 注意：別名不適用於 gemini-api-key、codex-api-key、claude-api-key、openai-compatibility 或 vertex-api-key。
# 同一個名稱可搭配不同別名重複設定，以公開多個用戶端模型名稱。
oauth-model-alias:
  antigravity:
    - name: "rev19-uic3-1p"
      alias: "gemini-2.5-computer-use-preview-10-2025"
    - name: "gemini-3-pro-image"
      alias: "gemini-3-pro-image-preview"
    - name: "gemini-3-pro-high"
      alias: "gemini-3-pro-preview"
    - name: "gemini-3-flash"
      alias: "gemini-3-flash-preview"
    - name: "claude-sonnet-4-5"
      alias: "gemini-claude-sonnet-4-5"
    - name: "claude-sonnet-4-5-thinking"
      alias: "gemini-claude-sonnet-4-5-thinking"
    - name: "claude-opus-4-5-thinking"
      alias: "gemini-claude-opus-4-5-thinking"
#   vertex:
#     - name: "gemini-2.5-pro"
#       alias: "g2.5p"
#   aistudio:
#     - name: "gemini-2.5-pro"
#       alias: "g2.5p"
#   claude:
#     - name: "claude-sonnet-4-5-20250929"
#       alias: "cs4.5"
#   codex:
#     - name: "gpt-5"
#       alias: "g5"

# OAuth 供應商的模型排除清單
oauth-excluded-models:
  vertex:
    - "gemini-3-pro-preview"
  aistudio:
    - "gemini-3-pro-preview"
  antigravity:
    - "gemini-3-pro-preview"
  claude:
    - "claude-3-5-haiku-20241022"
  codex:
    - "gpt-5-codex-mini"

# 選用的 payload 設定
payload:
  default: # 預設規則僅在 payload 中缺少參數時設定
    - models:
        - name: "gemini-2.5-pro" # 支援萬用字元（如 "gemini-*"）
          protocol: "gemini" # 將規則限制於特定 API 格式，選項：openai、gemini、claude、codex、antigravity
      params: # JSON 路徑（gjson/sjson 語法）-> 值
        "generationConfig.thinkingConfig.thinkingBudget": 32768
  default-raw: # 預設原始規則在缺少時使用原始 JSON 設定參數（必須是有效的 JSON）
    - models:
        - name: "gemini-2.5-pro" # 支援萬用字元（如 "gemini-*"）
          protocol: "gemini" # 將規則限制於特定 API 格式，選項：openai、gemini、claude、codex、antigravity
      params: # JSON 路徑（gjson/sjson 語法）-> 原始 JSON 值（字串按原樣使用，必須是有效的 JSON）
        "generationConfig.responseJsonSchema": "{\"type\":\"object\",\"properties\":{\"answer\":{\"type\":\"string\"}}}"
  override: # 覆寫規則一律設定參數，取代任何現有值
    - models:
        - name: "gpt-*" # 支援萬用字元（如 "gpt-*"）
          protocol: "codex" # 將規則限制於特定 API 格式，選項：openai、gemini、claude、codex、antigravity
      params: # JSON 路徑（gjson/sjson 語法）-> 值
        "reasoning.effort": "high"
  override-raw: # 原始覆寫規則一律使用原始 JSON 設定參數（必須是有效的 JSON）
    - models:
        - name: "gpt-*" # 支援萬用字元（如 "gpt-*"）
          protocol: "codex" # 將規則限制於特定 API 格式，選項：openai、gemini、claude、codex、antigravity
      params: # JSON 路徑（gjson/sjson 語法）-> 原始 JSON 值（字串按原樣使用，必須是有效的 JSON）
        "response_format": "{\"type\":\"json_schema\",\"json_schema\":{\"name\":\"answer\",\"schema\":{\"type\":\"object\"}}}"
  filter: # 過濾規則從 payload 中刪除指定的參數
    - models:
        - name: "gemini-2.5-pro" # 支援萬用字元（如 "gemini-*"）
          protocol: "gemini" # 將規則限制於特定 API 格式，選項：openai、gemini、claude、codex、antigravity
      params: # 要從 payload 中刪除的 JSON 路徑（gjson/sjson 語法）
        - "generationConfig.thinkingConfig.thinkingBudget"
        - "generationConfig.responseJsonSchema"
```
