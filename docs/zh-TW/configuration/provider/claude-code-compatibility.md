# Claude Code 相容供應商

透過 `claude-api-key` 設定上游 Claude Code 相容供應商。

- api-key: 上游供應商的 API 金鑰
- base-url: 上游供應商的基礎 URL
- proxy-url: 代理伺服器位址（可選）
- models: 從上游供應商模型 `名稱` 對應到本機 `別名` 的清單

範例：
```yaml
claude-api-key:
  - api-key: "sk-atSM..." # 使用 Claude 官方 API 時，不必設定 base-url
  - api-key: "sk-atSM..."
    base-url: "https://www.example.com" # 使用第三方 Claude API 轉送伺服器端點
    proxy-url: "socks5://proxy.example.com:1080" # 可選：針對該金鑰的代理設定
    models:
      - name: "claude-3-5-sonnet-20241022" # 上游模型名稱
        alias: "claude-sonnet-latest" # 上游模型的本機別名
```

> [!NOTE]
> 若只設定 `api-key`，`base-url` 會自動設為 `https://api.anthropic.com`。
> 只有使用第三方 Claude Code 相容供應商時，才需要設定 `base-url`。
