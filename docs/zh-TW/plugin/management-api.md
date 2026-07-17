---
outline: 'deep'
---

# Management API 功能

Management API 功能允許外掛註冊自己的管理介面和瀏覽器資源頁面。它適合提供狀態頁、診斷頁、設定輔助工具或外掛專屬操作入口。

## 功能欄位

```json
{
  "capabilities": {
    "management_api": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ManagementAPI`、`ManagementRegistrationRequest`、`ManagementRoute`、`ResourceRoute`、`ManagementRequest`、`ManagementResponse`
- `sdk/pluginabi/types.go`：`management.register`、`management.handle`
- `internal/pluginhost/management.go`：管理路由與資源路由註冊、身分驗證邊界

範例參考：

- `examples/plugin/management-api/go/main.go`
- `examples/plugin/host-callback/go/main.go`
- `examples/plugin/host-model-callback/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodManagementRegister`、`MethodManagementHandle`

## 方法

| 方法 | 作用 |
| --- | --- |
| `management.register` | 註冊外掛自己的管理路由和瀏覽器資源。 |
| `management.handle` | 處理匹配到外掛路由的 HTTP 請求。 |

## 路由型別

| 型別 | 註冊欄位 | 公開路徑 | 身分驗證 |
| --- | --- | --- | --- |
| 外掛自有管理介面 | `Routes` | `/v0/management/...` | 需要管理金鑰。 |
| 瀏覽器資源頁面 | `Resources` | `/v0/resource/plugins/<pluginID>/...` | 資源請求本身不走管理身分驗證。同源管理中心部署下，受信任頁面的 JavaScript 可以讀取已儲存的管理金鑰並呼叫 `/v0/management/...`。 |

## 註冊回應

```json
{
  "Routes": [
    {
      "Method": "POST",
      "Path": "/plugins/example/run"
    }
  ],
  "Resources": [
    {
      "Path": "/status",
      "Menu": "Example Plugin",
      "Description": "Shows example plugin status."
    }
  ]
}
```

資源範例最終路徑：

```text
/v0/resource/plugins/example/status
```

## 處理請求

`management.handle` 接收：

```json
{
  "Method": "GET",
  "Path": "/v0/resource/plugins/example/status",
  "Headers": {},
  "Query": {},
  "Body": "base64-body"
}
```

回應：

```json
{
  "StatusCode": 200,
  "Headers": {
    "Content-Type": ["text/html; charset=utf-8"]
  },
  "Body": "base64-html"
}
```

## 身分驗證邊界

- `/v0/management/...` 下的外掛管理介面需要管理金鑰。
- `/v0/resource/plugins/<pluginID>/...` 是瀏覽器資源路徑。用於傳回頁面的 GET 請求本身不走 Management API 身分驗證。
- 同源部署下，外掛資源頁可以讀取管理中心的 `localStorage`，並重複使用其中儲存的管理金鑰。安裝並啟用這類外掛，應視為信任該外掛的瀏覽器端程式碼。
- 跨來源部署不能依賴這種儲存存取方式。外掛頁面必須處理管理狀態缺失或無法讀取的情況。
- 帶 `Menu` 的舊式 GET management route 會被主機遷移為資源路由，避免把選單頁面公開成管理 API。

## 受信任資源頁模式

需要執行特權操作時，建議採用這種結構：

1. 用資源頁承載外掛 UI。
2. 頁面 JavaScript 在同源可用時讀取管理中心儲存。
3. 使用讀到的管理金鑰，透過 `Authorization: Bearer <management-key>` 呼叫外掛自己的 `/v0/management/...` 路由。

不要將敏感操作直接繫結至未經身分驗證的資源 GET 請求。若資源路由讀取 `Query` 後立即修改設定、讀取憑證檔案或呼叫特權主機回呼，只要有人能存取資源 URL，便能觸發這些操作。

## 開發注意

- 外掛管理路由不能覆寫主機現有的 `/v0/management` 路由。
- 資源路徑不能包含空白、`:`、`*` 或 `..`。
- 傳回 HTML 時仍要避免把 secret、token 或憑證 JSON 轉譯到頁面。
- 外掛資源頁應自行打包指令碼。載入第三方指令碼會讓這些指令碼獲得同源管理儲存的存取功能。
- 需要呼叫主機模型、HTTP 或憑證檔案功能時，使用 [主機回呼](./host-callbacks)。
