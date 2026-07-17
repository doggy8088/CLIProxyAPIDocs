---
outline: 'deep'
---

# 前端身分驗證專用模式

前端身分驗證專用模式不是獨立介面，而是前端身分驗證提供者的附加功能。它表示該外掛被選中後，主機只使用這個外掛作為前端請求驗證來源。

## 功能欄位

```json
{
  "capabilities": {
    "frontend_auth_provider": true,
    "frontend_auth_provider_exclusive": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`FrontendAuthProviderExclusive`
- `internal/pluginhost/rpc_schema.go`：`frontend_auth_provider_exclusive`
- `internal/pluginhost/adapters.go`：專用前端身分驗證提供者選擇邏輯

範例參考：

- `examples/plugin/frontend-auth-exclusive/go/main.go`

## 選擇規則

主機註冊前端身分驗證提供者時，會優先選擇宣告了 `frontend_auth_provider_exclusive` 的外掛：

- 只對同時宣告 `frontend_auth_provider` 的外掛有效。
- 多個專用外掛存在時，優先順序更高的外掛勝出。
- 優先順序相同的情況下，主機按穩定規則選擇。
- 專用外掛移除或關閉後，主機會清理專用狀態。

## 請求和回應

專用模式仍然使用 `frontend_auth.authenticate`：

```json
{
  "Authenticated": true,
  "Principal": "example-frontend-auth-exclusive-go",
  "Metadata": {
    "mode": "exclusive",
    "provider": "example-frontend-auth-exclusive-go"
  }
}
```

範例外掛透過請求標頭判斷：

```text
X-Example-Frontend-Auth: exclusive
```

## 開發注意

- 專用模式會改變整體前端身分驗證邊界，必須謹慎啟用。
- 外掛應對失敗傳回 `Authenticated: false`，不要 panic 或結束處理程序。
- 不要只宣告 `frontend_auth_provider_exclusive`；沒有 `frontend_auth_provider` 時該欄位不會形成有效的前端身分驗證提供者。
