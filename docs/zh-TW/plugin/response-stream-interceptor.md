---
outline: 'deep'
---

# 串流回應攔截器功能

串流回應攔截器功能用於在 SSE 或其他串流回應 chunk 發給用戶端前改寫、丟棄 chunk，或調整串流回應標頭。

## 功能欄位

```json
{
  "capabilities": {
    "response_stream_interceptor": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`StreamChunkInterceptor`、`StreamChunkInterceptRequest`、`StreamChunkInterceptResponse`
- `sdk/pluginabi/types.go`：`response.intercept_stream_chunk`
- `internal/pluginhost/adapters.go`：`InterceptStreamChunk`

範例參考：

- `internal/pluginhost/adapters_test.go`：串流 chunk 歷史、丟棄 chunk 和標頭初始化測試

## 方法

| 方法 | 作用 |
| --- | --- |
| `response.intercept_stream_chunk` | 改寫串流回應的標頭初始化，或單一 payload chunk。 |

## 請求

```json
{
  "SourceFormat": "chat-completions",
  "Model": "gpt-5.5",
  "RequestedModel": "gpt-5.5",
  "RequestHeaders": {},
  "ResponseHeaders": {},
  "OriginalRequest": "base64-client-body",
  "RequestBody": "base64-upstream-request",
  "Body": "base64-current-chunk",
  "HistoryChunks": ["base64-previous-chunk"],
  "ChunkIndex": 0,
  "Metadata": {}
}
```

`ChunkIndex` 從 `0` 開始。`-1` 表示僅含標頭的初始化呼叫，此時可先調整回應標頭。

## 回應

```json
{
  "Headers": {
    "X-Stream-Plugin": ["example"]
  },
  "Body": "base64-new-chunk",
  "ClearHeaders": ["X-Old-Header"],
  "DropChunk": false
}
```

語義：

- `Body` 非空時替換目前 chunk。
- `DropChunk: true` 會跳過目前 payload chunk，且不會寫入後續 `HistoryChunks`。
- 即使丟棄 chunk，傳回的標頭修改仍會套用。

## 歷史視窗

`HistoryChunks` 是主機保留的近期 chunk 快照，目前最多保留 64 個 chunk 與 1 MiB 的歷史位元組。外掛不能假設其中包含完整的串流歷史。

## 開發注意

- 不要在每個 chunk 上做高延遲外部請求。
- 處理 SSE 資料時必須維持格式邊界，不要破壞 `data:`、空行和終止 chunk。
- 透過 `host_callback_id` 發起的主機模型回呼會跳過來源外掛自己的串流攔截器。
