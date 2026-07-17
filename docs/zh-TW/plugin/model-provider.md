---
outline: 'deep'
---

# 模型提供者功能

模型提供者功能用於提供靜態模型，以及依個別憑證記錄動態發現模型。它比模型註冊器更適合 OAuth、檔案憑證或需要存取上游模型清單的外掛。

## 功能欄位

```json
{
  "capabilities": {
    "model_provider": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ModelProvider`、`StaticModelRequest`、`AuthModelRequest`、`ModelResponse`
- `sdk/pluginabi/types.go`：`model.static`、`model.for_auth`
- `internal/pluginhost/adapters.go`：`RegisterModels`、`ModelsForAuth`

範例參考：

- `examples/plugin/model/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodModelStatic`、`MethodModelForAuth`

## 方法

| 方法 | 作用 |
| --- | --- |
| `model.static` | 傳回不依賴個別憑證的靜態模型清單。 |
| `model.for_auth` | 基於某個憑證記錄傳回模型清單，也可以順帶傳回憑證更新。 |

## 靜態模型請求

`model.static` 接收 `StaticModelRequest`：

```json
{
  "Plugin": {},
  "Host": {
    "AuthDir": "~/.cli-proxy-api",
    "ProxyURL": "",
    "ForceModelPrefix": false
  }
}
```

## 按憑證發現模型

`model.for_auth` 接收 `AuthModelRequest`：

```json
{
  "AuthID": "auth-1",
  "AuthProvider": "plugin-example",
  "StorageJSON": "base64-json",
  "Metadata": {},
  "Attributes": {},
  "Host": {}
}
```

如果外掛需要存取上游模型介面，應使用請求所對應的主機 HTTP 用戶端 `host.http.*` 橋接功能，這樣代理、傳輸策略和請求記錄仍由主機管理。

## 回應

`model.static` 和 `model.for_auth` 都傳回 `ModelResponse`：

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
  ],
  "AuthUpdate": {}
}
```

`AuthUpdate` 可在模型發現過程中更新憑證資料，例如重新整理上游傳回的帳號資訊、專案 ID 或下一次重新整理時間。

## 與執行器的關係

如果外掛同時宣告 [執行器功能](./executor)，`executor_model_scope` 會控制模型提供者的註冊路徑：

- `static`：只註冊靜態模型。
- `oauth`：只處理按憑證發現的模型。
- `both` 或空值：同時支援兩類模型。

## 開發注意

- `model.for_auth` 應只處理自己識別的憑證提供者。
- 傳回的 `Provider` 為空時，主機會嘗試使用目前憑證的 provider。
- 動態發現失敗時傳回錯誤會讓主機把該憑證的模型發現視為已處理但失敗。
