---
outline: 'deep'
---

# 主機回呼

主機回呼是外掛呼叫 CLIProxyAPI 主機功能的機制。它不是外掛功能欄位，但對執行器、Management API、憑證和資源頁面類外掛非常重要。

## 方法清單

原始碼參考：

- `sdk/pluginabi/types.go`：所有 `host.*` 方法名
- `sdk/pluginapi/types.go`：HTTP、模型執行和憑證檔案請求/回應結構
- `internal/pluginhost/host_callbacks.go`：主機回呼實作

範例參考：

- `examples/plugin/host-callback/go/main.go`
- `examples/plugin/host-callback-auth-files/go/main.go`
- `examples/plugin/host-model-callback/go/main.go`

## HTTP 回呼

| 方法 | 作用 |
| --- | --- |
| `host.http.do` | 透過主機執行普通 HTTP 請求。 |
| `host.http.do_stream` | 透過主機執行串流 HTTP 請求。 |
| `host.http.stream_read` | 讀取主機持有的 HTTP 流。 |
| `host.http.stream_close` | 關閉主機持有的 HTTP 流。 |

外掛應優先用這些方法存取外部 HTTP 服務，這樣代理、傳輸策略和請求記錄仍由主機管理。

## 模型執行回呼

| 方法 | 作用 |
| --- | --- |
| `host.model.execute` | 發起非串流模型請求。 |
| `host.model.execute_stream` | 發起串流模型請求，傳回 `stream_id`。 |
| `host.model.stream_read` | 讀取模型流 chunk。 |
| `host.model.stream_close` | 關閉模型流。 |

請求核心欄位：

```json
{
  "entry_protocol": "openai",
  "exit_protocol": "openai",
  "model": "gpt-5.5",
  "stream": false,
  "body": "base64-request-body",
  "headers": {},
  "query": {},
  "alt": ""
}
```

## host_callback_id

當外掛在 `management.handle` 等主機呼叫上下文中呼叫 `host.model.*` 時，應轉送請求中的 `host_callback_id`。

主機會用這個 ID 識別發起回呼的外掛，並在巢狀模型執行中跳過該外掛自己的請求、回應和串流攔截器，避免遞迴呼叫自己。其他已啟用外掛仍可處理這次巢狀請求。

## 憑證檔案回呼

| 方法 | 作用 |
| --- | --- |
| `host.auth.list` | 列出主機憑證記錄。 |
| `host.auth.get` | 按 auth index 讀取實體憑證 JSON。 |
| `host.auth.get_runtime` | 按 auth index 讀取執行時憑證資訊。 |
| `host.auth.save` | 寫入憑證 JSON 並更新執行時憑證記錄。 |

`examples/plugin/host-callback-auth-files` 示範如何透過資源頁面呼叫這些方法。

## 串流橋接與記錄

| 方法 | 作用 |
| --- | --- |
| `host.stream.emit` | 執行器外掛向主機傳送串流 chunk。 |
| `host.stream.close` | 執行器外掛關閉流。 |
| `host.log` | 透過主機記錄輸出。 |

## 開發注意

- 串流回呼使用後應明確呼叫對應 close 方法。
- 不要透過主機回呼繞過外掛本身的安全邊界；外掛仍屬於受信任的處理程序內程式碼。
- 不要把憑證 JSON、token 或使用者請求內容寫入記錄。
- 不要把讀取憑證、寫入憑證或其他特權主機回呼直接公開成未身分驗證的資源 GET 查詢參數。資源頁需要提供這些操作的使用者控制元件時，應由同源 JavaScript 讀取受信任的管理中心儲存，再呼叫帶身分驗證的 `/v0/management/...` 路由。
- 能重複使用主機模型執行鏈路時，優先用 `host.model.*`，不要複製主機憑證到外掛裡。
