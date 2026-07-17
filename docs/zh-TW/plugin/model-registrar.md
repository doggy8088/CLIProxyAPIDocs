---
outline: 'deep'
---

# 模型註冊器功能

模型註冊器功能用於把外掛提供的靜態模型中繼資料註冊到 CLIProxyAPI 的模型登錄檔中。它適合模型集合固定、無需按憑證動態發現模型的外掛。

## 功能欄位

在 `plugin.register` 或 `plugin.reconfigure` 的註冊結果中宣告：

```json
{
  "capabilities": {
    "model_registrar": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ModelRegistrar`、`ModelRegistrationRequest`、`ModelRegistrationResponse`、`ModelInfo`
- `sdk/pluginabi/types.go`：`model.register`
- `internal/pluginhost/adapters.go`：`RegisterModels`、`callModelRegistrar`

範例參考：

- `examples/plugin/simple/go/main.go`：`MethodModelRegister`

## 呼叫時機

主機載入或重新設定外掛後，會在註冊模型階段呼叫 `model.register`。傳回的模型會進入模型清單和路由匹配流程。

如果同一個外掛同時宣告了 [執行器功能](./executor)，這些模型會與該外掛執行器關聯；如果沒有執行器，主機會把它們作為外掛提供的普通模型用戶端註冊。

## 請求

`model.register` 的請求對應 `ModelRegistrationRequest`：

```json
{
  "Plugin": {
    "Name": "example",
    "Version": "0.1.0",
    "Author": "router-for-me"
  }
}
```

`Plugin` 是目前外掛的中繼資料，供外掛按自身版本或設定決定傳回哪些模型。

## 回應

傳回 `ModelRegistrationResponse`：

```json
{
  "Provider": "plugin-example",
  "Models": [
    {
      "ID": "plugin-example-model",
      "Object": "model",
      "OwnedBy": "plugin-example",
      "DisplayName": "Plugin Example Model",
      "SupportedGenerationMethods": ["chat"],
      "ContextLength": 8192,
      "MaxCompletionTokens": 1024,
      "UserDefined": true
    }
  ]
}
```

關鍵點：

- `Provider` 必須是穩定的提供者識別碼。
- `Models` 必須是完整模型集合，而不是增量。
- `ID` 是用戶端請求使用的模型名。
- `Thinking` 可宣告模型支援的 thinking 範圍，供 thinking 設定驗證和後續 [Thinking 套用器功能](./thinking-applier) 使用。

## 開發注意

- 不要傳回空 `Provider` 或空模型 ID；主機會跳過無效模型。
- 模型註冊器只負責靜態模型；需要按每個 OAuth 或檔案憑證動態發現模型時，使用 [模型提供者功能](./model-provider)。
- 如果模型只應由外掛執行器處理，應同時宣告執行器功能，並設定合適的 `executor_model_scope`。
