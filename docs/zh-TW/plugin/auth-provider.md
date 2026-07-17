---
outline: 'deep'
---

# 憑證提供者功能

憑證提供者功能讓外掛參與憑證檔案解析、登入、輪詢和重新整理。它適合新增一個需要 OAuth、裝置碼、API Key 檔案或自訂 JSON 憑證的上游提供者。

## 功能欄位

```json
{
  "capabilities": {
    "auth_provider": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`AuthProvider`、`AuthData`、`AuthParseRequest`、`AuthLoginStartRequest`、`AuthLoginPollRequest`、`AuthRefreshRequest`
- `sdk/pluginabi/types.go`：`auth.identifier`、`auth.parse`、`auth.login.start`、`auth.login.poll`、`auth.refresh`
- `internal/pluginhost/adapters.go`：憑證解析、重新整理和主機 HTTP 用戶端橋接

範例參考：

- `examples/plugin/auth/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodAuthIdentifier`、`MethodAuthParse`、`MethodAuthLoginStart`、`MethodAuthLoginPoll`、`MethodAuthRefresh`

## 方法

| 方法 | 作用 |
| --- | --- |
| `auth.identifier` | 傳回外掛負責的 provider 識別碼。 |
| `auth.parse` | 嘗試解析主機發現的憑證 JSON。 |
| `auth.login.start` | 開始登入流程，傳回使用者需要開啟的 URL 和輪詢狀態。 |
| `auth.login.poll` | 輪詢登入流程，成功時傳回 `AuthData`。 |
| `auth.refresh` | 重新整理已有憑證，傳回更新後的憑證資料和下次重新整理時間。 |

## AuthData

`AuthData` 是外掛與主機交換憑證資料的核心結構：

```json
{
  "Provider": "plugin-example",
  "ID": "plugin-example-auth",
  "FileName": "plugin-example.json",
  "Label": "Plugin Example",
  "Prefix": "",
  "ProxyURL": "",
  "Disabled": false,
  "StorageJSON": "base64-json",
  "Metadata": {},
  "Attributes": {},
  "NextRefreshAfter": "2026-06-15T12:00:00Z"
}
```

欄位分工：

- `StorageJSON` 是外掛擁有的需儲存的憑證內容。
- `Metadata` 是主機管理但可變的中繼資料。
- `Attributes` 是路由與提供者相關的不可變屬性。
- `NextRefreshAfter` 控制主機下一次主動重新整理時間。

## 登入流程

`auth.login.start` 傳回：

```json
{
  "Provider": "plugin-example",
  "URL": "https://example.com/login",
  "State": "opaque-state",
  "ExpiresAt": "2026-06-15T12:05:00Z",
  "Metadata": {}
}
```

`auth.login.poll` 傳回狀態：

```json
{
  "Status": "pending",
  "Message": "waiting for user confirmation"
}
```

成功時 `Status` 為 `success`，並填入 `Auth`。

## 開發注意

- `auth.parse` 必須透過 `Handled` 明確表示是否識別該憑證檔案。
- 外掛需要存取上游登入或重新整理介面時，應使用主機 HTTP 橋接，避免繞過代理和記錄策略。
- 不要在記錄中輸出 `StorageJSON`、access token、refresh token 或使用者原始憑證。
- 如果外掛同時提供模型發現，通常還會配合 [模型提供者功能](./model-provider)。
