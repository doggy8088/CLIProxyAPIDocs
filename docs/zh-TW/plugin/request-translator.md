---
outline: 'deep'
---

# 請求轉譯器功能

請求轉譯器功能會將標準請求轉譯為目標供應商的 API 格式。它位於請求執行前的 API 格式轉換階段，適合將 CLIProxyAPI 已正規化的請求內容轉譯為上游所需的 payload。

## 功能欄位

```json
{
  "capabilities": {
    "request_translator": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`RequestTranslator`、`RequestTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`request.translate`
- `internal/pluginhost/adapters.go`：`TranslateRequest`、`callRequestTranslator`

範例參考：

- `examples/plugin/request-translator/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodRequestTranslate`

## 方法

| 方法 | 作用 |
| --- | --- |
| `request.translate` | 將 `Body` 從 `FromFormat` 轉譯至 `ToFormat`。 |

## 請求

```json
{
  "FromFormat": "chat-completions",
  "ToFormat": "anthropic",
  "Model": "claude-sonnet",
  "Stream": false,
  "Body": "base64-request-body"
}
```

## 回應

```json
{
  "Body": "base64-translated-body"
}
```

## 與請求正規化的區別

- [請求正規化器功能](./request-normalizer) 負責把提供者或特殊入口請求正規化到主機可理解的標準格式。
- 請求轉譯器功能負責將標準格式轉譯為目標上游 API 格式。

## 開發注意

- 只處理自己明確支援的格式組合；不能處理時傳回錯誤或不要宣告該功能。
- `Body` 必須是完整有效的目標 API 格式 payload。
- 不要在轉譯器中選擇憑證或傳送上游 HTTP 請求；這些工作屬於排程器和執行器階段。
