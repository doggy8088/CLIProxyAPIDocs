# Codex 相容供應商

透過 `codex-api-key` 設定上游 Codex 相容供應商。

- api-key: 上游供應商的 API 金鑰
- base-url: 上游供應商的基礎 URL
- proxy-url: 代理伺服器位址（可選）

範例：
```yaml
codex-api-key:
  - api-key: "sk-atSM..."
    base-url: "https://www.example.com" # 使用第三方 Codex API 轉送伺服器端點
    proxy-url: "socks5://proxy.example.com:1080" # 可選：針對該金鑰的代理設定
```
