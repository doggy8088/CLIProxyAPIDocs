---
outline: 'deep'
---

# 排程器功能

排程器功能用於在主機內建排程器執行前，從候選憑證記錄中選擇一個憑證，或明確委派給內建排程器。

## 功能欄位

```json
{
  "capabilities": {
    "scheduler": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`Scheduler`、`SchedulerPickRequest`、`SchedulerPickResponse`
- `sdk/pluginabi/types.go`：`scheduler.pick`
- `internal/pluginhost/adapters.go`：排程功能註冊與呼叫

範例參考：

- `examples/plugin/scheduler/go/main.go`
- `examples/plugin/scheduler/README.md`

## 方法

| 方法 | 作用 |
| --- | --- |
| `scheduler.pick` | 根據請求上下文和候選憑證傳回排程決定。 |

## 請求

```json
{
  "Provider": "codex",
  "Providers": ["codex"],
  "Model": "gpt-5.5",
  "Stream": true,
  "Options": {
    "Headers": {},
    "Metadata": {}
  },
  "Candidates": [
    {
      "ID": "auth-1",
      "Provider": "codex",
      "Priority": 1,
      "Status": "available",
      "Attributes": {},
      "Metadata": {}
    }
  ]
}
```

## 回應

選擇個別憑證：

```json
{
  "AuthID": "auth-1",
  "Handled": true
}
```

委託內建排程器：

```json
{
  "DelegateBuiltin": "round-robin",
  "Handled": true
}
```

不處理本次排程：

```json
{
  "Handled": false
}
```

支援的內建委託值：

- `round-robin`
- `fill-first`

## 設定範例

```yaml
plugins:
  configs:
    scheduler:
      enabled: true
      priority: 1
      auth_id: ""
      delegate: ""
      deny: false
```

範例外掛行為：

- `deny: true` 時傳回錯誤。
- `delegate` 為 `fill-first` 或 `round-robin` 時委託內建排程器。
- `auth_id` 非空且存在於候選清單時選擇該憑證。

## 開發注意

- 只從 `Candidates` 中選擇憑證 ID，不要傳回請求上下文之外的 ID。
- 傳回錯誤會讓本次排程失敗，適合明確拒絕請求。
- 不想處理時傳回 `Handled: false`，讓後續外掛或主機內建邏輯繼續處理。
