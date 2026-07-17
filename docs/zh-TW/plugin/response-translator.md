---
outline: 'deep'
---

# 回應轉譯器功能

回應轉譯器功能會將標準回應轉譯回用戶端要求的目標 API 格式。它與[請求轉譯器功能](./request-translator)相對應，執行時機是在上游傳回回應之後、交給用戶端之前。

## 功能欄位

```json
{
  "capabilities": {
    "response_translator": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ResponseTranslator`、`ResponseTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`response.translate`
- `internal/pluginhost/adapters.go`：`TranslateResponse`、`callResponseTranslator`

範例參考：

- `examples/plugin/response-translator/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodResponseTranslate`

## 方法

| 方法 | 作用 |
| --- | --- |
| `response.translate` | 將回應 `Body` 從 `FromFormat` 轉譯至 `ToFormat`。 |

## 請求

```json
{
  "FromFormat": "codex",
  "ToFormat": "chat-completions",
  "Model": "gpt-5.5",
  "Stream": false,
  "OriginalRequest": "base64-client-body",
  "TranslatedRequest": "base64-provider-request",
  "Body": "base64-upstream-response"
}
```

## 回應

```json
{
  "Body": "base64-client-response"
}
```

## 開發注意

- `OriginalRequest` 是用戶端原始請求，`TranslatedRequest` 是發給上游的請求，可用於回應格式補全。
- 回應轉譯器應輸出用戶端 API 格式所需的完整回應。
- 能否轉譯串流回應取決於主機執行器與格式功能；外掛應明確測試串流情境。
