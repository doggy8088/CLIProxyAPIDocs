# 教學 4：中繼轉送整合

前幾篇文章已說明如何透過 OAuth 或 Cookie 串接內建供應商。本篇教學進一步介紹如何將各類 AI 中繼轉送服務整合至 CLIProxyAPI。

首先，讓我們回顧一下之前使用的設定檔：

```yaml
port: 8317

# 資料夾位置請根據你的實際情況填寫
auth-dir: "Z:\\CLIProxyAPI\\auths"

request-retry: 3

quota-exceeded:
  switch-project: true
  switch-preview-model: true

api-keys:
# 請自行設定 API 金鑰，供用戶端存取代理服務
- "ABC-123456"
```

接著擴充這份初始設定檔。

先新增 Claude 中繼轉送服務。第一步是取得該服務的 `base-url`；通常可在服務供應商的官方文件或教學中找到。

以 88code 為例，在其官方教學中可以找到如下資訊：

![](https://img.072899.xyz/2025/09/11c41d79d62c02df1ac5d5998c75d3e5.png)

從圖中可得知，88code Claude 轉送服務的 `base-url` 是 `https://www.88code.org/api`。

我們在設定檔中加入 `claude-api-key` 欄位：

```yaml
port: 8317
auth-dir: "Z:\\CLIProxyAPI\\auths"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

claude-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/api"
```

同樣地，88code 也提供了 Codex 服務。我們依照相同的方法，找到其 `base-url`：

![](https://img.072899.xyz/2025/09/28e5ce297bca540e052863860dd9eb2c.png)

然後，在設定檔中新增 `codex-api-key` 欄位：

```yaml
port: 8317
auth-dir: "Z:\\CLIProxyAPI\\auths"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

claude-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/api"

codex-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/openai/v1"
```

對於其他服務商，也可以採用類似的方式進行新增。例如，我這裡還有幾個 PackyCode 的 Codex API Key，我將它們一併加入設定：

```yaml
port: 8317
auth-dir: "Z:\\CLIProxyAPI\\auths"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

claude-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/api"
  - api-key: "sk-4cXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://api.packycode.com"
  - api-key: "sk-HpYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
    base-url: "https://api.packycode.com"

codex-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/openai/v1"
  - api-key: "fk-4cXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://oai-api.fkclaude.com/v1"
  - api-key: "sk-amXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://codex-api.packycode.com/v1"
  - api-key: "sk-sTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://codex-api.packycode.com/v1"
```

請注意，即使是同一服務商、使用相同 `base-url` 的多個 `api-key`，也需要為每一條 `api-key` 單獨宣告 `base-url`，不可省略。

CLIProxyAPI 也能串接任何相容 OpenAI 介面的供應商，並透過 `openai-compatibility` 欄位設定。完整設定範例如下：

```yaml
port: 8317
auth-dir: "Z:\\CLIProxyAPI\\auths"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

claude-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/api"

codex-api-key:
  - api-key: "88_XXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://www.88code.org/openai/v1"
  - api-key: "fk-4cXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://oai-api.fkclaude.com/v1"
  - api-key: "sk-amXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://codex-api.packycode.com/v1"
  - api-key: "sk-sTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    base-url: "https://codex-api.packycode.com/v1"

openai-compatibility:
  - name: "openrouter"
    base-url: "https://openrouter.ai/api/v1"
    api-keys:
      - "sk-or-v1-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      - "sk-or-v1-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    models:
      - name: "deepseek/deepseek-chat-v3.1:free"
        alias: "deepseek-v3.1"
      - name: "deepseek/deepseek-r1-0528:free"
        alias: "deepseek-r1-0528"
      - name: "x-ai/grok-4-fast:free"
        alias: "grok-4-fast"
  - name: "groq"
    base-url: "https://api.groq.com/openai/v1"
    api-keys:
      - "gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    models:
      - name: "deepseek-r1-distill-llama-70b"
        alias: "deepseek-r1-70b"
```

可以看到，`openai-compatibility` 的設定邏輯與之前略有不同：同一供應商（Provider）下的所有 `api-key` 共享同一個 `base-url`。

完成設定後，請分別測試各模型的連線是否正常。
