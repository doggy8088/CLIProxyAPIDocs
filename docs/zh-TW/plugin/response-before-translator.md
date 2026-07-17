---
outline: 'deep'
---

# 轉譯前回應正規化器功能

轉譯前回應正規化器功能會在主機的原生回應轉譯之前改寫上游回應。它適合修正上游傳回的供應商原生 payload，再交給主機或外掛回應轉譯器處理。

## 功能欄位

```json
{
  "capabilities": {
    "response_before_translator": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ResponseNormalizer`、`ResponseTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`response.normalize_before`
- `internal/pluginhost/adapters.go`：`NormalizeResponse` 轉譯前階段

範例參考：

- `examples/plugin/response-normalizer/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodResponseNormalizeBefore`

## 方法

| 方法 | 作用 |
| --- | --- |
| `response.normalize_before` | 在回應轉譯前傳回正規化後的回應內容。 |

## 請求與回應

請求使用 `ResponseTransformRequest`，回應使用 `PayloadResponse`：

```json
{
  "Body": "base64-normalized-provider-response"
}
```

## 與轉譯後回應正規化器的差異

- `response_before_translator` 處理 provider-native 回應。
- [轉譯後回應正規化器功能](./response-after-translator)會處理已轉譯為用戶端 API 格式的回應。

## 開發注意

- 適合修正上游欄位缺失、相容非標準 provider 回應。
- 除非目前階段的 `ToFormat` 原本就是用戶端格式，否則不要輸出用戶端 API 格式。
- 若需同時支援轉譯前與轉譯後階段，可同時宣告這兩項功能。
