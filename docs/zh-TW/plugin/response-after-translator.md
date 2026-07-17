---
outline: 'deep'
---

# 轉譯後回應正規化器功能

轉譯後回應正規化器功能會在回應已轉譯為用戶端 API 格式後進行最後改寫。它適合用於支援格式要求嚴格的用戶端、補齊欄位或進行輕量的回應後處理。

## 功能欄位

```json
{
  "capabilities": {
    "response_after_translator": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ResponseNormalizer`、`ResponseTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`response.normalize_after`
- `internal/pluginhost/adapters.go`：`NormalizeResponse` 轉譯後階段

範例參考：

- `examples/plugin/response-normalizer/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodResponseNormalizeAfter`

## 方法

| 方法 | 作用 |
| --- | --- |
| `response.normalize_after` | 在回應轉譯後傳回正規化後的用戶端回應內容。 |

## 請求

請求包含原始用戶端請求、轉譯後的上游請求和目前回應內容：

```json
{
  "FromFormat": "codex",
  "ToFormat": "chat-completions",
  "Model": "gpt-5.5",
  "Stream": false,
  "OriginalRequest": "base64-client-body",
  "TranslatedRequest": "base64-provider-request",
  "Body": "base64-translated-response"
}
```

## 回應

```json
{
  "Body": "base64-final-client-response"
}
```

## 開發注意

- 適合補齊用戶端 API 格式要求的相容欄位。
- 不要在這裡再呼叫上游或改變計費語義。
- 若要修改 HTTP 標頭，請使用[回應攔截器功能](./response-interceptor)，而非回應正規化器。
