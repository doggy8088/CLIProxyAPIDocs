# OpenCode

啟動 CLIProxyAPI 伺服器，然後編輯 `~/.config/opencode/opencode.json`；若檔案不存在，請先建立。

```json
{
    "$schema": "https://opencode.ai/config.json",
    "provider": {
        "openai": {
            "options": {
                "baseURL": "http://127.0.0.1:8317/v1",
                "apiKey": "sk-dummy"
            }
        }
    },
    "model": "gpt-5.3-codex"
}
```
