---
outline: 'deep'
---

# 外掛開發

CLIProxyAPI 的外掛系統可將模型、憑證、排程、轉譯、攔截、用量觀察、命令列擴充功能與管理頁面等功能串接至主機流程。外掛以原生動態程式庫的形式在 CLIProxyAPI 處理程序中執行。主機透過穩定的 C ABI 呼叫外掛；外掛也能透過主機回呼，重複使用 CLIProxyAPI 現有的 HTTP、模型執行、憑證檔案與記錄功能。

## 適用範圍

外掛適合做這些事情：

- 為新上游提供模型清單、憑證解析、登入重新整理和請求執行功能。
- 在請求進入上游前進行請求轉譯、請求正規化、排程選擇或請求攔截。
- 在回應傳回用戶端前進行回應轉譯、回應正規化或串流 chunk 攔截。
- 接收用量記錄，或為管理介面增加只屬於該外掛的頁面和診斷介面。
- 呼叫主機已有模型執行鏈路，而不是在外掛裡複製金鑰、代理、記錄、用量統計和路由邏輯。

外掛不適合用來承載不可信程式碼。標準動態程式庫外掛與服務二進位檔處在同一處理程序內，主機可以恢復部分 panic，但不能阻止外掛結束處理程序、破壞記憶體、修改處理程序全域狀態或洩露敏感資料。

## 功能文件

每個功能都有獨立說明頁，內容按 `sdk/pluginapi/types.go`、`sdk/pluginabi/types.go`、`internal/pluginhost` 呼叫路徑和 `examples/plugin` 範例整理。

| 分類 | 功能 | 檔案 |
| --- | --- | --- |
| 進入點功能 | `model_registrar` | [模型註冊器](./model-registrar) |
| 進入點功能 | `model_provider` | [模型提供者](./model-provider) |
| 進入點功能 | `auth_provider` | [憑證提供者](./auth-provider) |
| 進入點功能 | `frontend_auth_provider` | [前端身分驗證提供者](./frontend-auth-provider) |
| 進入點功能 | `frontend_auth_provider_exclusive` | [前端身分驗證專用模式](./frontend-auth-exclusive) |
| 進入點功能 | `scheduler` | [排程器](./scheduler) |
| 進入點功能 | `model_router` | [模型路由器](./model-router) |
| 進入點功能 | `executor` | [執行器](./executor) |
| 請求處理 | `request_translator` | [請求轉譯器](./request-translator) |
| 請求處理 | `request_normalizer` | [請求正規化器](./request-normalizer) |
| 請求處理 | `request_interceptor` | [請求攔截器](./request-interceptor) |
| 回應處理 | `response_translator` | [回應轉譯器](./response-translator) |
| 回應處理 | `response_before_translator` | [轉譯前回應正規化器](./response-before-translator) |
| 回應處理 | `response_after_translator` | [轉譯後回應正規化器](./response-after-translator) |
| 回應處理 | `response_interceptor` | [回應攔截器](./response-interceptor) |
| 回應處理 | `response_stream_interceptor` | [串流回應攔截器](./response-stream-interceptor) |
| 擴充功能 | `thinking_applier` | [Thinking 套用器](./thinking-applier) |
| 擴充功能 | `usage_plugin` | [用量觀察器](./usage-plugin) |
| 擴充功能 | `command_line_plugin` | [命令列擴充功能](./command-line-plugin) |
| 擴充功能 | `management_api` | [管理 API](./management-api) |
| 主機功能 | `host.*` | [主機回呼](./host-callbacks) |

## 執行前提

外掛功能仰賴 CGO 建置。管理 API 回應會包含：

```http
X-CPA-SUPPORT-PLUGIN: 1
```

`1` 表示目前二進位檔支援動態程式庫外掛，`0` 表示該二進位檔不支援。這個標頭只表示建置功能，不表示外掛已經啟用，也不表示某個外掛已經載入。

設定裡還需要開啟全域外掛開關：

```yaml
plugins:
  enabled: true
  dir: "plugins"
  configs: {}
```

如果 `plugins.enabled` 為 `false`，外掛檔案和單個外掛設定仍可存在，但不會變成有效啟用狀態。

## 外掛檔案發現

外掛 ID 來自動態程式庫檔名去掉副檔名。例如：

```text
plugins/darwin/arm64/example-provider.dylib
```

對應設定鍵：

```yaml
plugins:
  configs:
    example-provider:
      enabled: true
      priority: 1
```

外掛 ID 必須匹配：

```text
[A-Za-z0-9][A-Za-z0-9._-]{0,127}
```

主機按目前平台依序搜尋：

```text
plugins/<GOOS>/<GOARCH>-<variant>
plugins/<GOOS>/<GOARCH>
plugins
```

其中 macOS 使用 `.dylib`，Linux 和 FreeBSD 使用 `.so`，Windows 使用 `.dll`。同一個外掛 ID 如果在多個目錄出現，優先順序更高的目錄先生效。

## ABI 基礎

每個標準動態程式庫外掛必須匯出：

```c
int cliproxy_plugin_init(const cliproxy_host_api* host, cliproxy_plugin_api* plugin);
```

外掛會在初始化時填入自己的函式表：

```c
int call(char* method, uint8_t* request, size_t request_len, cliproxy_buffer* response);
void free_buffer(void* ptr, size_t len);
void shutdown(void);
```

主機提供的函式表用於外掛反向呼叫主機：

```c
int call(void* host_ctx, char* method, uint8_t* request, size_t request_len, cliproxy_buffer* response);
void free_buffer(void* ptr, size_t len);
```

C ABI 只傳遞方法名稱、位元組陣列與長度，不傳遞 Go interface、Go slice、Go map、Go channel、`context.Context` 或 Go error。請求與回應使用 JSON 封套，原始位元組欄位在 JSON 中會自動以 base64 表示。

成功回應：

```json
{
  "ok": true,
  "result": {}
}
```

錯誤回應：

```json
{
  "ok": false,
  "error": {
    "code": "invalid_request",
    "message": "request is invalid"
  }
}
```

## 生命週期

主機會呼叫這些基礎方法：

| 方法 | 方向 | 作用 |
| --- | --- | --- |
| `plugin.register` | 主機呼叫外掛 | 首次載入外掛，讀取中繼資料、設定欄位和功能宣告。 |
| `plugin.reconfigure` | 主機呼叫外掛 | 設定變更後重新傳入該外掛的設定。 |
| `plugin.shutdown` | 主機呼叫外掛 | 外掛解除安裝或主機關閉時釋放資源。 |

`plugin.register` 和 `plugin.reconfigure` 的請求會包含 `config_yaml`。它來自 `plugins.configs.<pluginID>`，主機會保留外掛自己的 YAML 欄位，只解析主機擁有的 `enabled` 與 `priority`。

註冊回應需要傳回：

```json
{
  "schema_version": 1,
  "metadata": {
    "Name": "example-provider",
    "Version": "0.1.0",
    "Author": "router-for-me",
    "GitHubRepository": "https://github.com/router-for-me/example-provider",
    "Logo": "https://example.com/logo.png",
    "ConfigFields": [
      {
        "Name": "mode",
        "Type": "enum",
        "EnumValues": ["safe", "fast"],
        "Description": "Execution mode."
      }
    ]
  },
  "capabilities": {
    "request_normalizer": true,
    "management_api": true
  }
}
```

`ConfigFields` 供管理介面轉譯外掛自有設定。它不替代外掛自身的設定驗證，外掛仍應在 `plugin.register` / `plugin.reconfigure` 中驗證自己關心的欄位。

## 設定語義

建議最小設定：

```yaml
plugins:
  enabled: true
  dir: "plugins"
  configs:
    example-provider:
      enabled: true
      priority: 1
      mode: "safe"
```

欄位意義：

| 欄位 | 說明 |
| --- | --- |
| `plugins.enabled` | 全域外掛載入開關。 |
| `plugins.dir` | 外掛發現目錄，預設是 `plugins`。 |
| `plugins.store-sources` | 額外外掛商店 registry URL 清單。 |
| `plugins.configs.<pluginID>.enabled` | 單一外掛開關。未指定時視為啟用。 |
| `plugins.configs.<pluginID>.priority` | 外掛啟動、註冊和路由順序。高優先順序外掛先處理。 |
| 其他欄位 | 外掛自有設定，主機會原樣保留並傳給外掛。 |

管理 API 更新設定時會盡量保留原有 YAML 樹，只修改請求指定的欄位。從外掛商店安裝外掛後，系統會寫入動態程式庫，並將對應的外掛設定設為 `enabled: true`，但不會強制啟用 `plugins.enabled`。

## 功能模型

外掛透過 `capabilities` 宣告自己實作的功能。常見功能如下：

| 功能 | 方法方向 | 用途 |
| --- | --- | --- |
| 模型註冊器 | `model.register` | 向主機註冊靜態模型中繼資料。 |
| 模型提供者 | `model.static` / `model.for_auth` | 提供靜態模型或按憑證記錄提供模型。 |
| 憑證提供者 | `auth.*` | 解析、登入、輪詢和重新整理外掛提供者的憑證。 |
| 前端身分驗證提供者 | `frontend_auth.*` | 在代理處理前驗證用戶端請求。 |
| 排程器 | `scheduler.pick` | 從候選憑證中選擇一個憑證，或委託內建排程器。 |
| 模型路由器 | `model.route` | 在 provider/auth 選擇前，將符合的請求路由至外掛執行器、目前路由外掛本身的執行器或內建 provider。 |
| 執行器 | `executor.*` | 直接執行上游請求或串流請求。 |
| 請求轉譯器 | `request.translate` | 將標準請求轉譯為上游 API 格式。 |
| 請求正規化器 | `request.normalize` | 正規化進入執行鏈路的請求。 |
| 請求攔截器 | `request.intercept_before` / `request.intercept_after` | 在選擇憑證前後改寫執行請求。 |
| 回應轉譯器 | `response.translate` | 將標準回應轉譯為用戶端 API 格式。 |
| 回應正規化器 | `response.normalize_before` / `response.normalize_after` | 在原生轉譯前後正規化回應。 |
| 回應攔截器 | `response.intercept_after` | 改寫非串流回應。 |
| 串流回應攔截器 | `response.intercept_stream_chunk` | 改寫串流回應 chunk。 |
| Thinking 套用器 | `thinking.apply` | 套用已驗證的 thinking 設定。 |
| 用量觀察器 | `usage.handle` | 接收完成後的用量記錄。 |
| 命令列擴充功能 | `command_line.*` | 註冊並處理外掛自有命令列參數。 |
| 管理 API | `management.*` | 註冊外掛自己的管理路由或瀏覽器資源。 |

主機的總體規則是：原生邏輯優先，外掛補齊缺口；多個外掛都能處理同一階段時，高優先順序外掛先執行。

## 主機回呼

主機回呼是外掛呼叫主機，不是主機呼叫外掛。它適合重複使用主機已經處理好的代理、憑證、模型路由、記錄、用量統計和資源管理。

常用回呼：

| 回呼 | 用途 |
| --- | --- |
| `host.http.do` | 由主機執行一次普通 HTTP 請求。 |
| `host.http.do_stream` / `host.http.stream_read` / `host.http.stream_close` | 由主機執行串流 HTTP 請求並讀取/關閉流。 |
| `host.model.execute` | 透過主機模型執行鏈路發起非串流模型請求。 |
| `host.model.execute_stream` / `host.model.stream_read` / `host.model.stream_close` | 透過主機模型執行鏈路發起串流模型請求並讀取/關閉流。 |
| `host.stream.emit` / `host.stream.close` | 執行器外掛向主機串流橋接傳送 chunk 或關閉串流。 |
| `host.log` | 透過主機記錄輸出。 |
| `host.auth.list` | 列出主機憑證記錄。 |
| `host.auth.get` | 讀取實體憑證 JSON 檔案。 |
| `host.auth.get_runtime` | 讀取執行時憑證資訊。 |
| `host.auth.save` | 寫入憑證 JSON 並更新執行時憑證記錄。 |

如果外掛從 `management.handle` 或其他主機呼叫上下文裡再呼叫 `host.model.execute` / `host.model.execute_stream`，應轉送請求中的 `host_callback_id`。主機會據此識別發起回呼的外掛，並在巢狀模型執行中跳過同一個外掛的請求、回應和串流攔截器，避免外掛遞迴呼叫自己。其他已啟用外掛仍可處理這次巢狀請求。

串流回呼建議明確呼叫對應的 `*_close` 方法。主機可以在 RPC 作用域結束時清理一部分資源，但外掛主動關閉能更快釋放流資源，也更容易定位錯誤。

## Management API 與外掛資源

外掛可以宣告兩類管理功能：

1. 需要管理憑證的外掛自有 API。
2. 可由瀏覽器直接開啟的外掛資源頁面。

它們的路由邊界不同：

| 型別 | 註冊欄位 | 公開路徑 | 身分驗證 |
| --- | --- | --- | --- |
| 外掛自有 Management API | `routes` | `/v0/management/...` | 需要管理金鑰。 |
| 外掛資源頁面 | `resources` | `/v0/resource/plugins/<pluginID>/...` | 資源請求本身不走管理身分驗證。同源管理中心部署下，受信任頁面的 JavaScript 可以讀取已儲存的管理金鑰並呼叫 `/v0/management/...`。 |

範例：外掛 ID 是 `example-provider`，資源路徑是 `/status`，最終存取位址是：

```text
http://localhost:8317/v0/resource/plugins/example-provider/status
```

外掛透過 `management.register` 傳回路由和資源：

```json
{
  "resources": [
    {
      "Path": "/status",
      "Menu": "Example Provider",
      "Description": "Show plugin status."
    }
  ],
  "routes": [
    {
      "Method": "POST",
      "Path": "/plugins/example-provider/run"
    }
  ]
}
```

主機會將符合的請求轉交給 `management.handle`。請求包含 method、path、headers、query 與 body；回應包含 status code、headers 與 body。

注意：

- 外掛自有 Management API 會與主機已有 `/v0/management` 路由做衝突檢查，衝突時跳過外掛路由。
- 外掛資源路徑會固定掛在 `/v0/resource/plugins/<pluginID>/` 下。
- 帶 `Menu` 的舊式 GET management 路由會作為瀏覽器資源處理，不再作為管理 API 公開。
- 資源路徑不能包含空白、`:`、`*` 或 `..`。
- 安裝並啟用帶資源頁的外掛，應視為信任該外掛的瀏覽器端程式碼。同源部署下，這些程式碼可以讀取管理中心的 `localStorage`，包括存在時儲存的管理金鑰。
- 敏感操作應放在 `/v0/management/...` 路由後面。由資源頁讀取已儲存的管理金鑰後呼叫這些路由，而不是在未身分驗證的資源 GET 請求中直接執行敏感工作。
- 資源頁應與外掛一起打包，不要在可存取同源管理內容的頁面中載入第三方指令碼。

## 管理介面

以下介面都在 `/v0/management` 下，並且需要管理金鑰。

| 方法與路徑 | 作用 |
| --- | --- |
| `GET /plugins` | 列出已發現、已設定、已註冊外掛，並傳回 `plugins_enabled`、`effective_enabled`、選單、中繼資料和設定欄位。 |
| `PATCH /plugins/{pluginID}/enabled` | 只更新 `plugins.configs.<pluginID>.enabled`，不修改全域 `plugins.enabled`。 |
| `GET /plugins/{pluginID}/config` | 取得該外掛保留後的設定物件。 |
| `PUT /plugins/{pluginID}/config` | 整體替換該外掛設定物件。 |
| `PATCH /plugins/{pluginID}/config` | 淺合併設定物件；欄位值為 `null` 時刪除該欄位。 |
| `DELETE /plugins/{pluginID}` | 只解除安裝目標外掛、刪除本機動態程式庫，並移除已儲存的設定。 |
| `GET /plugin-store` | 列出外掛商店中的外掛和本機安裝狀態。 |
| `POST /plugin-store/{pluginID}/install` | 從外掛商店安裝或更新外掛；多來源同 ID 時使用 `?source=<sourceID>`。 |

`GET /plugins` 中幾個狀態欄位不要混用：

- `plugins_enabled`：全域外掛開關。
- `enabled`：單個外掛設定開關。
- `registered`：外掛動態程式庫已載入並完成註冊。
- `effective_enabled`：全域開關、單外掛開關和註冊狀態同時滿足後的實際啟用狀態。

安裝或更新外掛時，主機會先下載 Release 資產並驗證 `checksums.txt`，接著解除安裝目標外掛，再覆寫動態程式庫並觸發設定熱重新載入。若平台或檔案鎖定導致已載入的動態程式庫無法覆寫，介面會傳回要求重新啟動的衝突回應。

## 外掛商店發布格式

預設外掛商店 registry：

```text
https://raw.githubusercontent.com/router-for-me/CLIProxyAPI-Plugins-Store/main/registry.json
```

可透過設定加入第三方來源：

```yaml
plugins:
  store-sources:
    - "https://example.com/cliproxyapi-plugins/registry.json"
```

registry 格式：

```json
{
  "schema_version": 1,
  "plugins": [
    {
      "id": "example-provider",
      "name": "Example Provider",
      "description": "Example plugin provider.",
      "author": "router-for-me",
      "version": "0.1.0",
      "repository": "https://github.com/router-for-me/example-provider",
      "logo": "https://example.com/logo.png",
      "homepage": "https://example.com",
      "license": "MIT",
      "tags": ["provider"]
    }
  ]
}
```

要求：

- `schema_version` 必須是 `1`。
- `id`、`name`、`description`、`author`、`repository` 必填。
- `repository` 必須是 `https://github.com/{owner}/{repo}`。
- `version` 是顯示用的備用值；實際安裝版本來自 GitHub 最新的 Release 標籤。標籤可以包含 `v`，主機會移除開頭的 `v` 再驗證版本。

外掛 Release 必須提供目前平台對應的 ZIP 資產與 `checksums.txt`：

```text
<pluginID>_<version>_<goos>_<goarch>.zip
checksums.txt
```

ZIP 根目錄必須直接包含目標動態程式庫：

```text
example-provider.dylib
```

不能把動態程式庫放在子目錄裡。`checksums.txt` 使用常見 sha256 格式：

```text
<sha256>  example-provider_0.1.0_darwin_arm64.zip
```

## 開發建議

建議從儲存庫中的範例開始：

```bash
make -C examples/plugin list
make -C examples/plugin build
```

常用範例：

| 範例 | 重點 |
| --- | --- |
| `examples/plugin/simple` | Go、C、Rust 三種語言的完整 ABI 骨架。 |
| `examples/plugin/codex-service-tier` | 請求正規化外掛。 |
| `examples/plugin/scheduler` | 排程外掛。 |
| `examples/plugin/claude-web-search-router` | ModelRouter 外掛，把 Claude Code `web_search` 請求路由到內建 provider 或自身執行器。 |
| `examples/plugin/management-api` | 外掛自有管理路由和資源頁面。 |
| `examples/plugin/host-callback-auth-files` | 呼叫主機憑證檔案回呼。 |
| `examples/plugin/host-model-callback` | 呼叫主機模型執行回呼，並示範遞迴保護。 |

開發時建議遵守：

- 外掛只宣告自己真正實作的功能。
- 外掛自己的 HTTP 請求優先走 `host.http.*`，避免繞過主機代理、記錄和傳輸策略。
- 需要發起模型請求時優先走 `host.model.*`，不要把主機憑證複製進外掛。
- 串流資源使用後應明確關閉。
- 不要將讀取憑證、寫入憑證或執行特權動作的主機回呼，直接公開為未經身分驗證的資源查詢參數。若使用者介面需要觸發這些功能，應使用同源且受信任的資源頁，並攜帶管理金鑰呼叫 `/v0/management/...`。
- 外掛自有設定欄位保持向後相容，刪除欄位時同時相容舊設定。
- 記錄不要輸出金鑰、token、原始憑證 JSON 或使用者敏感請求內容。
- 修改動態程式庫後，使用外掛管理介面或重新啟動服務確保舊外掛執行個體已經解除安裝。

## 最小驗證流程

在本機開發外掛後，可依下列流程驗證：

1. 建置目前平台動態程式庫，並放入 `plugins/<GOOS>/<GOARCH>/` 或 `plugins/`。
2. 在 `config.yaml` 中開啟 `plugins.enabled`，並新增 `plugins.configs.<pluginID>`。
3. 啟動 CLIProxyAPI。
4. 請求 `GET /v0/management/plugins`，確認 `registered: true` 和 `effective_enabled: true`。
5. 如果外掛有資源頁面，開啟 `/v0/resource/plugins/<pluginID>/<path>`。
6. 如果外掛有 Management API，使用管理金鑰請求對應 `/v0/management/...` 路由。
7. 修改外掛後，透過管理介面安裝/刪除，或重新啟動服務，確認舊動態程式庫沒有繼續被使用。
