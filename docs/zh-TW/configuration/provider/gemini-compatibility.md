# Gemini 相容供應商

透過 `gemini-api-key` 設定上游 Gemini 相容供應商。

- api-key: 上游供應商的 API 金鑰
- base-url: 上游供應商的基礎 URL
- proxy-url: 代理伺服器位址（可選）
- headers: 選用的額外 HTTP 標頭，只會傳送至覆寫後的 Gemini 端點。

範例：
```yaml
gemini-api-key:
  - api-key: "AIzaSy...01"
    base-url: "https://generativelanguage.googleapis.com"
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080"
  - api-key: "AIzaSy...02" # 使用 Gemini 官方 API 時，不必設定 base-url
```

> [!NOTE]
> 若只設定 `api-key`，`base-url` 會自動設為 `https://generativelanguage.googleapis.com`。
> 只有使用第三方 Gemini 相容供應商時，才需要設定 `base-url`。
