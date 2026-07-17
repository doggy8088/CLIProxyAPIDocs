---
outline: 'deep'
---

# 模型路由器功能

模型路由器功能允許外掛在主機將請求模型解析為 provider 並選擇憑證之前，決定由何處執行符合條件的模型請求。

適用場景包括根據請求內容、請求標頭、查詢參數或用戶端原始模型，在以下目標之間選擇：

- 目前路由外掛本身的執行器
- 另一個外掛的執行器
- 內建 provider 路徑，例如 `codex`、`antigravity`、`xai` 或 `claude`

## 功能欄位

```json
{
  "capabilities": {
    "model_router": true
  }
}
```

如果路由器可能把請求路由到自己的執行器，也要宣告執行器功能：

```json
{
  "capabilities": {
    "model_router": true,
    "executor": true,
    "executor_model_scope": "static",
    "executor_input_formats": ["claude"],
    "executor_output_formats": ["claude"]
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`ModelRouter`、`ModelRouteRequest`、`ModelRouteResponse`、`ModelRouteTargetKind`
- `sdk/pluginabi/types.go`：`model.route`
- `internal/pluginhost/model_router.go`：路由優先順序、目標驗證和內建 provider 可用性檢查
- `sdk/api/handlers/handlers.go`：常規 provider/auth 解析前的請求入口

範例參考：

- `examples/plugin/claude-web-search-router/go/main.go`
- `examples/plugin/claude-web-search-router/go/fallback.go`

## 方法

| 方法 | 作用 |
| --- | --- |
| `model.route` | 為目前的用戶端請求傳回路由結果。 |

## 執行時機

主機會在一般的模型至 provider 解析與憑證選擇之前，詢問已啟用的模型路由器。高優先順序的外掛會先執行。路由器傳回 `Handled: false`、目標無效或目標無法使用時，主機會略過該結果並嘗試下一個路由器。若沒有路由器處理請求，則繼續使用主機的一般路徑。

請求仍保持用戶端原始 API 格式。例如 Claude 相容請求會以 `SourceFormat: "claude"` 進入，原始 Claude 請求內容放在 `Body` 中。

## 請求

```json
{
  "Plugin": {},
  "PluginID": "claude-web-search-router",
  "SourceFormat": "claude",
  "RequestedModel": "claude-sonnet-4-6",
  "Stream": true,
  "Headers": {},
  "Query": {},
  "Body": "base64-client-body",
  "Metadata": {},
  "AvailableProviders": ["antigravity", "codex", "xai"]
}
```

重要欄位：

| 欄位 | 說明 |
| --- | --- |
| `PluginID` | 目前被呼叫的路由外掛在主機內的 ID。 |
| `SourceFormat` | 用戶端原始 API 格式，例如 `openai`、`claude` 或 `gemini`。 |
| `RequestedModel` | provider/auth 解析前的用戶端請求模型。 |
| `Stream` | 用戶端是否期望串流輸出。 |
| `Headers` / `Query` | 傳入的請求標頭與查詢參數。 |
| `Body` | 原始用戶端請求內容。在 RPC JSON 中會以 base64 表示。 |
| `Metadata` | 儘可能複製的請求內容快照；應視為唯讀的類 JSON 資料。 |
| `AvailableProviders` | 目前已有憑證註冊的內建 provider key。傳回 `TargetKind: "provider"` 前應先檢查它。 |

## 回應

不處理：

```json
{
  "Handled": false
}
```

路由到目前外掛自己的執行器：

```json
{
  "Handled": true,
  "TargetKind": "self",
  "Reason": "matched_web_search"
}
```

路由到另一個外掛執行器：

```json
{
  "Handled": true,
  "TargetKind": "executor",
  "Target": "search-executor",
  "Reason": "matched_search_executor"
}
```

路由到內建 provider：

```json
{
  "Handled": true,
  "TargetKind": "provider",
  "Target": "codex",
  "TargetModel": "gpt-5.4-mini",
  "Reason": "matched_codex_web_search"
}
```

## 目標型別

| TargetKind | Target | TargetModel | 行為 |
| --- | --- | --- | --- |
| `self` | 外掛傳回值會被忽略；主機使用目前路由外掛 ID。 | 忽略。 | 執行目前路由外掛自己的執行器。 |
| `executor` | 目標外掛 ID。 | 忽略。 | 直接執行另一個外掛執行器。 |
| `provider` | 內建 provider key。 | 選用的模型覆寫。 | 繼續使用內建 AuthManager 與 provider 執行器路徑。 |

直接外掛執行器路由不會先選擇憑證。目標執行器必須宣告執行器功能，必須透過 `executor_model_scope: "static"` 或 `"both"` 允許靜態執行，並且必須支援目前請求的輸入與輸出 API 格式。

provider 路由必須指向 `AvailableProviders` 中存在的 provider。`TargetModel` 為空時，主機會保留用戶端原始請求模型。若目標 provider 需要 provider 原生模型名稱，應明確設定 `TargetModel`，不要直接轉送用戶端模型名稱。

## 設定範例

`claude-web-search-router` 範例使用 ModelRouter 偵測 Claude Code 內建的 `web_search` 請求，並將請求路由至支援網頁搜尋的內建 provider，或外掛本身的 Tavily 執行器。

```yaml
plugins:
  enabled: true
  dir: "plugins"
  configs:
    claude-web-search-router:
      enabled: true
      priority: 20
      route: fallback
      antigravity_model: "gemini-3.1-flash-lite"
      codex_model: "gpt-5.4-mini"
      xai_model: "grok-4.3"
      tavily_api_keys:
        - "tvly-xxxxxxxx"
      require_web_search_only: true
```

範例路由行為：

| Route | 目標 |
| --- | --- |
| `antigravity_google` | `TargetKind: "provider"`，`Target: "antigravity"`，`TargetModel: antigravity_model` |
| `codex_web_search` | `TargetKind: "provider"`，`Target: "codex"`，`TargetModel: codex_model` |
| `xai_web_search` | `TargetKind: "provider"`，`Target: "xai"`，`TargetModel: xai_model` |
| `tavily` | `TargetKind: "self"`，由外掛執行器自己處理 Tavily。 |
| `fallback` | `TargetKind: "self"`，由外掛執行器安排多個後端的備援順序。 |

## 開發注意

- 外掛不識別的請求應傳回 `Handled: false`，讓低優先順序路由器和主機常規路徑繼續處理。
- `model.route` 應保持快速，只負責分類和選擇目標，不要在這裡執行完整上游請求。
- 傳回內建 provider 目標前先檢查 `AvailableProviders`。
- 需要外掛執行器編排 fallback、呼叫 `host.model.*` 或使用外掛自有外部服務時，使用 `self`。
- 希望請求繼續走主機管理的憑證選擇、請求記錄、用量統計和內建執行器時，使用 `provider`。
- `model_router` 由功能標記與 `model.route` 方法啟用，不必提高外掛 schema version。
