# OpenAI 相容供應商

透過 `openai-compatibility` 設定上游 OpenAI 相容供應商（例如 OpenRouter）。

- name：內部識別名
- disabled：可選，設為 true 則停用該供應商（無需刪除設定）
- base-url：供應商基礎位址
- api-key-entries：API 金鑰項目清單，支援選用的單一金鑰代理設定（建議使用，且會儲存至設定檔）
- models：將上游模型 `name` 對應為本機可用 `alias`

> **相容性說明：** 舊欄位 `api-keys` 會在載入時自動遷移至 `api-key-entries`，並在儲存設定時移除；後續請直接使用 `api-key-entries`。

支援每金鑰代理設定的範例：

```yaml
openai-compatibility:
  - name: "openrouter"
    disabled: false
    base-url: "https://openrouter.ai/api/v1"
    api-key-entries:
      - api-key: "sk-or-v1-...b780"
        proxy-url: "socks5://proxy.example.com:1080"
      - api-key: "sk-or-v1-...b781"
    models:
      - name: "moonshotai/kimi-k2:free"
        alias: "kimi-k2"
```

使用方式：在 `/v1/chat/completions` 中將 `model` 設為別名（如 `kimi-k2`），代理將自動路由到對應供應商與模型。
