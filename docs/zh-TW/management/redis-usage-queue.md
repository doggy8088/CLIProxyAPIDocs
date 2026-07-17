---
outline: 'deep'
---

# Redis 用量佇列（RESP）

CLIProxyAPI 會在 HTTP API 使用的同一個 TCP 連接埠（預設為 `8317`）上提供精簡的 Redis RESP 介面。外部收集程式可透過此介面取得 JSON 格式的**近期單次請求用量記錄**，不必解析記錄檔。

## 可用性

- RESP 介面僅在**啟用管理功能**時可用，啟用條件與 `/v0/management` 相同；若未啟用，RESP 連線會立即關閉。
- 與 HTTP/HTTPS 複用同一個監聽器；如果伺服器端啟用了 TLS，RESP 也使用相同的 TLS 監聽器。

## 身分驗證

- 使用 **Management key** 進行身分驗證，金鑰與 `/v0/management` 相同。
- 支援形式：
  - `AUTH <password>`
  - `AUTH <username> <password>`（會忽略使用者名稱，僅供相容用途）
- 與 Management API 共用 IP 封鎖政策：**連續失敗 5 次**會觸發暫時封鎖。

## 啟用用量發布

佇列只有在啟用用量發布時才會寫入記錄：

- 設定檔：設定 `usage-statistics-enabled: true` 並重啟/熱載入
- 或透過 Management API：`PUT /usage-statistics-enabled`，請求體 `{ "value": true }`

## 支援的命令

這**不是**完整的 Redis 服務，只實作下列命令：

- `AUTH`
- `LPOP <key> [count]`
- `RPOP <key> [count]`
- `SUBSCRIBE usage`

說明：

- `<key>` 目前會被忽略；建議統一使用 `queue` 便於閱讀。
- 不帶 `count` 時，`LPOP`/`RPOP` 傳回單個 Bulk String（JSON），佇列為空時傳回 `nil`。
- 帶 `count` 時傳回 Bulk String 陣列；佇列為空時傳回空陣列。
- 資料在記憶體中的保留時間由 `redis-usage-queue-retention-seconds` 控制（單位為秒，預設值為 `60`，最大值為 `3600`）。若要盡量避免遺失資料，請提高輪詢頻率。
- `SUBSCRIBE usage` 使用 Redis pub/sub 回應格式。只要至少有一個使用者端訂閱，新的 usage 記錄會廣播給所有已訂閱使用者端，並且不會寫入 FIFO 佇列；這些記錄之後無法再透過 `LPOP`/`RPOP` 或 Management usage 佇列介面查詢到。
- 如果目前沒有使用者端訂閱，新的 usage 記錄仍會按原邏輯進入 FIFO 佇列。
- 訂閱模式下支援 `PING`、`UNSUBSCRIBE`、`QUIT` 做基礎連線控制。

## 範例

使用 `redis-cli`：

```bash
# 彈出一條（直接輸出 JSON）
redis-cli -h 127.0.0.1 -p 8317 -a "<MANAGEMENT_KEY>" --no-auth-warning --raw LPOP queue

# 最多彈出 50 條
redis-cli -h 127.0.0.1 -p 8317 -a "<MANAGEMENT_KEY>" --no-auth-warning --raw RPOP queue 50

# 訂閱即時 usage 記錄
redis-cli -h 127.0.0.1 -p 8317 -a "<MANAGEMENT_KEY>" --no-auth-warning --raw SUBSCRIBE usage
```

## Payload 結構

每條佇列元素為一個 JSON 物件，欄位如下：

- `timestamp`（RFC 3339 時間字串）
- `latency_ms`（整數）
- `source`（字串）
- `auth_index`（字串）
- `tokens`：
  - `input_tokens`（整數）
  - `output_tokens`（整數）
  - `reasoning_tokens`（整數）
  - `cached_tokens`（整數）
  - `total_tokens`（整數）
- `failed`（布林值）
- `provider`（字串）
- `model`（字串，實際用於執行的模型名稱）
- `alias`（字串，使用者端請求的模型名稱）
- `endpoint`（字串，例如 `POST /v1/chat/completions`）
- `auth_type`（字串）
- `api_key`（字串）
- `request_id`（字串）
- `response_headers`（選用物件；上游回應標頭，格式為 `header-name: string[]`）

範例：

```json
{
  "timestamp": "2026-04-25T00:00:00Z",
  "latency_ms": 1500,
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
  "alias": "client-gpt",
  "endpoint": "POST /v1/chat/completions",
  "auth_type": "apikey",
  "api_key": "test-key",
  "request_id": "ctx-request-id",
  "response_headers": {
    "X-Upstream-Request-Id": ["upstream-req-1"],
    "Retry-After": ["30"]
  }
}
```
