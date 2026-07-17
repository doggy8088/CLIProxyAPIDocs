---
outline: 'deep'
---

# 請求攔截器功能

請求攔截器功能用於在執行上游請求前改寫請求標頭或請求內容。它有兩個階段：選憑證前和選憑證後。

## 功能欄位

```json
{
  "capabilities": {
    "request_interceptor": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`RequestInterceptor`、`RequestInterceptRequest`、`RequestInterceptResponse`
- `sdk/pluginabi/types.go`：`request.intercept_before`、`request.intercept_after`
- `internal/pluginhost/adapters.go`：`InterceptRequestBeforeAuth`、`InterceptRequestAfterAuth`

範例參考：

- `internal/pluginhost/adapters_test.go`：請求攔截鏈、跳過來源外掛和錯誤處理測試
- `examples/plugin/antigravity-web-search/go/main.go`：基於目前攔截器 seam 的真實遷移範例

## 方法

| 方法 | 作用 |
| --- | --- |
| `request.intercept_before` | 在憑證選擇前改寫請求。此時 `ToFormat` 可能為空。 |
| `request.intercept_after` | 選定憑證後改寫請求。此時模型與上游格式已經明確。 |

## 請求

```json
{
  "SourceFormat": "chat-completions",
  "ToFormat": "codex",
  "Model": "gpt-5.5",
  "RequestedModel": "gpt-5.5",
  "Stream": false,
  "Headers": {},
  "Body": "base64-body",
  "Metadata": {}
}
```

## 回應

```json
{
  "Headers": {
    "X-Plugin": ["example"]
  },
  "Body": "base64-new-body",
  "ClearHeaders": ["X-Old-Header"]
}
```

語義：

- `Headers` 會覆寫同名標頭，但保留未提到的標頭。
- `Body` 非空時會取代目前的請求內容。
- `ClearHeaders` 會先刪除指定標頭，再套用 `Headers`。

## 遞迴保護

當外掛透過 `host.model.*` 發起巢狀模型請求並傳遞 `host_callback_id` 時，主機會跳過發起外掛自己的請求攔截器，避免遞迴呼叫自己。其他外掛的請求攔截器仍可處理巢狀請求。

## 開發注意

- `Metadata` 是主機上下文快照，應視為只讀。
- 選憑證前不要依賴憑證欄位；選憑證後再處理需要憑證上下文的改寫。
- 不要在請求攔截器裡直接呼叫上游模型；需要模型請求時使用 [主機回呼](./host-callbacks)。
