---
outline: 'deep'
---

# 請求正規化器功能

請求正規化器功能用於把進入執行鏈路前的請求 payload 改寫成主機後續階段更容易處理的形態。它常用於補充預設欄位、修正特定 provider payload，或實作輕量請求改寫。

## 功能欄位

```json
{
  "capabilities": {
    "request_normalizer": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`RequestNormalizer`、`RequestTransformRequest`、`PayloadResponse`
- `sdk/pluginabi/types.go`：`request.normalize`
- `internal/pluginhost/adapters.go`：`NormalizeRequest`、`callRequestNormalizer`

範例參考：

- `examples/plugin/request-normalizer/go/main.go`
- `examples/plugin/codex-service-tier/go/main.go`
- `examples/plugin/codex-service-tier/README.md`
- `examples/plugin/simple/go/main.go`：`MethodRequestNormalize`

## 方法

| 方法 | 作用 |
| --- | --- |
| `request.normalize` | 根據格式、模型和串流標記傳回新的請求內容。 |

## 請求

```json
{
  "FromFormat": "chat-completions",
  "ToFormat": "codex",
  "Model": "gpt-5.5",
  "Stream": false,
  "Body": "base64-request-body"
}
```

## 回應

```json
{
  "Body": "base64-normalized-body"
}
```

## 範例：Codex service tier

`examples/plugin/codex-service-tier` 是更接近真實用法的請求正規化範例。它讀取外掛設定中的 `fast` 欄位，在滿足以下條件時修改 Codex 請求：

- `ToFormat` 是 `codex`
- `Model` 是 `gpt-5.5`
- `fast` 為 `true`

設定範例：

```yaml
plugins:
  configs:
    codex-service-tier:
      enabled: true
      priority: 1
      fast: true
```

## 開發注意

- 請求正規化應保持小範圍、可預測，不要承擔執行器職責。
- 傳回空 `Body` 會讓主機無法套用有效的改寫；需要保持原文時傳回原始 `Body`。
- 外掛自有設定透過 `config_yaml` 進入 `plugin.register` / `plugin.reconfigure`，應在那裡解析後快取。
