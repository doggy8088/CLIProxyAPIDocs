---
outline: 'deep'
---

# 用量觀察器功能

用量觀察器功能用於在請求完成後接收用量、延遲、失敗和計費相關資訊。它適合串接外部統計、審計、計費或監控系統。

## 功能欄位

```json
{
  "capabilities": {
    "usage_plugin": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`UsagePlugin`、`UsageRecord`、`UsageDetail`、`UsageFailure`
- `sdk/pluginabi/types.go`：`usage.handle`
- `internal/pluginhost/adapters.go`：`RegisterUsagePlugins`、`HandleUsage`

範例參考：

- `examples/plugin/usage/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodUsageHandle`

## 方法

| 方法 | 作用 |
| --- | --- |
| `usage.handle` | 接收一次完成請求的用量記錄。 |

## 記錄內容

`UsageRecord` 包含：

```json
{
  "Provider": "codex",
  "ExecutorType": "codex",
  "Model": "gpt-5.5",
  "Alias": "gpt-5.5",
  "APIKey": "client-key-id",
  "AuthID": "auth-1",
  "AuthIndex": "0",
  "AuthType": "oauth",
  "Source": "openai",
  "ReasoningEffort": "high",
  "ServiceTier": "priority",
  "RequestedAt": "2026-06-15T12:00:00Z",
  "Latency": 1234567890,
  "TTFT": 120000000,
  "Failed": false,
  "Detail": {
    "InputTokens": 10,
    "OutputTokens": 20,
    "ReasoningTokens": 0,
    "CachedTokens": 0,
    "TotalTokens": 30
  },
  "ResponseHeaders": {}
}
```

失敗請求會帶有 `Failed: true` 和 `Failure`：

```json
{
  "Failure": {
    "StatusCode": 429,
    "Body": "rate limited"
  }
}
```

## 開發注意

- 用量外掛應快速傳回，避免阻塞請求完成路徑。
- 如果要寫外部系統，建議內部做緩衝或非同步傳送。
- 不要洩露用戶端 API key、上游 token 或完整敏感回應內容。
- 用量觀察是旁路功能，不應改變請求或回應。
