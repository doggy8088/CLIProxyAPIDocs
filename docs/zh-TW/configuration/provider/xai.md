# xAI / Grok（OAuth 登入）

CLIProxyAPI 支援透過 xAI OAuth 登入 Grok Build 帳號。登入後，該帳號會作為 `xai` 供應商使用，預設上游 API 位址為 `https://api.x.ai/v1`。

## 登入

```bash
./cli-proxy-api --xai-login
```

選項：加上 `--no-browser` 可顯示登入網址，而不自動開啟瀏覽器。預設本機 OAuth 回呼會監聽 `127.0.0.1:56121/callback`。

如果預設回呼埠不可用，可以指定埠：

```bash
./cli-proxy-api --xai-login --oauth-callback-port <port>
```

在遠端或無瀏覽器環境中，請依照命令輸出的 SSH 通道指示操作。若 CLI 要求手動貼上回呼權杖，請只貼上權杖本身，不要貼上完整的回呼 URL。

## 支援的 API

- 文字模型會路由至 xAI Responses API，可透過 `/v1/responses`、`/v1/chat/completions` 等 OpenAI 相容端點呼叫。
- 圖片請求使用 `/v1/images/generations` 和 `/v1/images/edits`，模型為 `grok-imagine-image` 或 `grok-imagine-image-quality`。
- 影片請求使用 `/v1/videos`、`/v1/videos/generations`、`/v1/videos/edits`、`/v1/videos/extensions` 和 `/v1/videos/{request_id}`，模型為 `grok-imagine-video`。

xAI 圖片和影片模型可以直接使用模型名，也可以使用 `xai/`、`x-ai/` 或 `grok/` 字首。

## 模型控制

在 `oauth-model-alias` 中使用 `xai` 管道，可為模型公開不同的用戶端可見名稱：

```yaml
oauth-model-alias:
  xai:
    - name: "grok-4.3"
      alias: "grok-latest"
```

在 `oauth-excluded-models` 中使用同一管道，可以從模型清單和路由中隱藏模型：

```yaml
oauth-excluded-models:
  xai:
    - "grok-3-mini"
```

## 請求說明

CLIProxyAPI 會在將 Responses 請求傳送至 xAI 上游前加以正規化：移除不支援的接續與快取欄位、調整工具定義以符合 xAI，並只為支援 reasoning effort 的 Grok 模型保留 reasoning 設定。
