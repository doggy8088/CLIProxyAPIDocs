---
outline: 'deep'
---

# Thinking 套用器功能

Thinking 套用器功能用於把主機已經解析、正規化並驗證後的 thinking 設定寫入 provider payload。它保持「標準 thinking 設定 → provider 專屬欄位」的架構邊界。

## 功能欄位

```json
{
  "capabilities": {
    "thinking_applier": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ThinkingApplier`、`ThinkingApplyRequest`、`ThinkingConfig`
- `sdk/pluginabi/types.go`：`thinking.identifier`、`thinking.apply`
- `internal/pluginhost/adapters.go`：Thinking applier 註冊和呼叫
- `internal/thinking/`：主機 thinking 解析、正規化和驗證流程

範例參考：

- `examples/plugin/thinking/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodThinkingIdentifier`、`MethodThinkingApply`

## 方法

| 方法 | 作用 |
| --- | --- |
| `thinking.identifier` | 傳回該外掛處理的 provider 識別碼。 |
| `thinking.apply` | 把標準 thinking 設定套用至供應商 payload。 |

## 請求

```json
{
  "Provider": "plugin-example",
  "Model": {
    "ID": "plugin-example-model",
    "Thinking": {
      "Min": 0,
      "Max": 32768,
      "ZeroAllowed": true,
      "DynamicAllowed": true,
      "Levels": ["low", "medium", "high"]
    }
  },
  "Config": {
    "Mode": "budget",
    "Budget": 1024,
    "Level": ""
  },
  "Body": "base64-provider-payload"
}
```

`Config` 已經是主機正規化後的設定，外掛不需要重新解析 suffix 或請求內容裡的原始 thinking 輸入。

## 回應

```json
{
  "Body": "base64-provider-payload-with-thinking"
}
```

## 開發注意

- 外掛只處理自己 `thinking.identifier` 傳回的 provider。
- 不要繞過主機 thinking 驗證；外掛應假設 `Config` 已經是標準值。
- 不要在 Thinking 套用器功能中進行請求轉譯、憑證選擇或上游執行。
