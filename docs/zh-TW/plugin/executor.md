---
outline: 'deep'
---

# 執行器功能

執行器功能用於實際向上游提供者或本機後端傳送模型請求。它是最接近「上游介面卡」的功能。

## 功能欄位

```json
{
  "capabilities": {
    "executor": true,
    "executor_model_scope": "both",
    "executor_input_formats": ["chat-completions"],
    "executor_output_formats": ["chat-completions"]
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ProviderExecutor`、`ExecutorRequest`、`ExecutorResponse`、`ExecutorStreamResponse`、`ExecutorHTTPRequest`
- `sdk/pluginabi/types.go`：`executor.identifier`、`executor.execute`、`executor.execute_stream`、`executor.count_tokens`、`executor.http_request`
- `internal/pluginhost/adapters.go`：執行器註冊、API 格式選擇和執行橋接

範例參考：

- `examples/plugin/executor/go/main.go`
- `examples/plugin/protocol-format/go/main.go`
- `examples/plugin/simple/go/main.go`：執行器相關方法

## 方法

| 方法 | 作用 |
| --- | --- |
| `executor.identifier` | 傳回該執行器負責的 provider 識別碼。 |
| `executor.execute` | 執行非串流模型請求。 |
| `executor.execute_stream` | 執行串流模型請求。 |
| `executor.count_tokens` | 處理 token 計數請求。 |
| `executor.http_request` | 執行器自有 HTTP 請求入口。 |

## API 格式

`executor_input_formats` 宣告執行器可直接接收的請求 API 格式，`executor_output_formats` 宣告執行器直接輸出的回應 API 格式。

常用值：

- `chat-completions`
- `responses`
- `anthropic`

`examples/plugin/protocol-format` 示範了輸入 `chat-completions`、輸出 `responses` 的宣告方式。

## 模型作用域

`executor_model_scope` 控制執行器與模型註冊路徑的關係：

| 值 | 說明 |
| --- | --- |
| `static` | 執行器只服務靜態模型。 |
| `oauth` | 執行器只服務 OAuth/憑證繫結模型。 |
| `both` | 同時服務靜態模型和憑證繫結模型。 |

空值按 `both` 處理。

## ExecutorRequest

執行請求包含：

```json
{
  "AuthID": "auth-1",
  "AuthProvider": "plugin-example",
  "Model": "plugin-example-model",
  "Format": "chat-completions",
  "Stream": false,
  "Headers": {},
  "Query": {},
  "OriginalRequest": "base64-client-body",
  "SourceFormat": "chat-completions",
  "Payload": "base64-provider-payload",
  "StorageJSON": "base64-auth-json",
  "AuthMetadata": {},
  "AuthAttributes": {}
}
```

外掛向上游傳送 HTTP 請求時應使用主機提供的 HTTP 用戶端，也就是透過 `host.http.*` 完成請求。這樣請求記錄、代理、傳輸策略和憑證上下文仍在主機控制下。

## 回應

非串流回應：

```json
{
  "Payload": "base64-response-body",
  "Headers": {
    "content-type": ["application/json"]
  },
  "Metadata": {}
}
```

串流回應會傳回 `Headers` 與 chunk 串流。C ABI 範例會將有限數量的 chunk 放入回應陣列，再由主機轉換為內部串流。

## 開發注意

- 執行器必須宣告至少一個輸入格式和輸出格式。
- `Payload` 是已經按目標 API 格式轉譯後的請求內容；不要重新猜測用戶端原始 API 格式。
- 需要重複使用主機模型路由時，不要寫執行器，改用 [主機回呼](./host-callbacks) 中的 `host.model.*`。
- 不要在外掛中儲存或列印上游金鑰，憑證資料應從請求中的 `StorageJSON` 使用後立即捨棄。
