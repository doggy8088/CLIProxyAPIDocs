---
outline: 'deep'
---

# 回應攔截器功能

回應攔截器功能用於在成功的非串流 HTTP 執行回應傳回給用戶端前，改寫回應標頭或回應內容。

## 功能欄位

```json
{
  "capabilities": {
    "response_interceptor": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ResponseInterceptor`、`ResponseInterceptRequest`、`ResponseInterceptResponse`
- `sdk/pluginabi/types.go`：`response.intercept_after`
- `internal/pluginhost/adapters.go`：`InterceptResponse`

範例參考：

- `internal/pluginhost/adapters_test.go`：回應攔截鏈、header 清理和錯誤處理測試
- `examples/plugin/antigravity-web-search/go/main.go`：基於回應攔截的真實遷移範例

## 方法

| 方法 | 作用 |
| --- | --- |
| `response.intercept_after` | 改寫成功的非串流回應。 |

## 請求

```json
{
  "SourceFormat": "chat-completions",
  "Model": "gpt-5.5",
  "RequestedModel": "gpt-5.5",
  "Stream": false,
  "RequestHeaders": {},
  "ResponseHeaders": {},
  "OriginalRequest": "base64-client-body",
  "RequestBody": "base64-upstream-request",
  "Body": "base64-response-body",
  "StatusCode": 200,
  "Metadata": {}
}
```

## 回應

```json
{
  "Headers": {
    "X-Plugin": ["example"]
  },
  "Body": "base64-new-response-body",
  "ClearHeaders": ["X-Old-Header"]
}
```

## 開發注意

- 只處理成功的非串流回應；串流回應使用 [串流回應攔截器功能](./response-stream-interceptor)。
- `Headers` 會覆寫同名回應標頭，但保留未提到的標頭。
- `Body` 非空時替換回應內容。
- 透過 `host_callback_id` 發起的主機模型回呼會跳過來源外掛自己的回應攔截器。
