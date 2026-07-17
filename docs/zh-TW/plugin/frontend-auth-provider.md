---
outline: 'deep'
---

# 前端身分驗證提供者功能

前端身分驗證提供者功能用於在請求進入代理流程前驗證用戶端請求。它面向「誰可以呼叫 CLIProxyAPI」這個問題，不負責上游憑證選擇。

## 功能欄位

```json
{
  "capabilities": {
    "frontend_auth_provider": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`FrontendAuthProvider`、`FrontendAuthRequest`、`FrontendAuthResponse`
- `sdk/pluginabi/types.go`：`frontend_auth.identifier`、`frontend_auth.authenticate`
- `internal/pluginhost/adapters.go`：`RegisterFrontendAuthProviders`

範例參考：

- `examples/plugin/frontend-auth/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodFrontendAuthIdentifier`、`MethodFrontendAuthAuthenticate`

## 方法

| 方法 | 作用 |
| --- | --- |
| `frontend_auth.identifier` | 傳回該前端身分驗證提供者的穩定識別碼。 |
| `frontend_auth.authenticate` | 根據 HTTP 請求內容判斷是否驗證成功。 |

## 請求

`frontend_auth.authenticate` 接收：

```json
{
  "Method": "POST",
  "Path": "/v1/chat/completions",
  "Headers": {
    "Authorization": ["Bearer ..."]
  },
  "Query": {},
  "Body": "base64-body"
}
```

## 回應

```json
{
  "Authenticated": true,
  "Principal": "user-or-client-id",
  "Metadata": {
    "provider": "example-frontend-auth-go"
  }
}
```

`Principal` 是驗證主體，`Metadata` 可攜帶給下游使用的身分屬性。

## 與內建 API Key 的關係

一般前端身分驗證提供者會與主機已有身分驗證方式一起工作。只有宣告 [前端身分驗證專用模式](./frontend-auth-exclusive) 時，外掛才會在被選中後成為唯一前端身分驗證來源。

## 開發注意

- 前端身分驗證只驗證用戶端請求，不應讀取或傳回上游憑證。
- 使用請求內容進行身分驗證時，應留意內容大小與敏感資訊，不要在記錄中輸出原始 `Body`。
- 外掛傳回 `Authenticated: false` 時，主機會繼續按目前身分驗證鏈路處理或拒絕請求，實際行為取決於是否啟用了專用模式。
