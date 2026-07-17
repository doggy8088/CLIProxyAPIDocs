# Codex

## 設定為 OAuth 登入模式（建議）

啟動 CLIProxyAPI 伺服器，然後使用 ChatGPT 帳號（任何訂閱方案皆可，包括免費帳號）登入 Codex CLI 或 Codex App。

修改 `~/.codex/config.toml` 檔案，新增以下內容：

```toml
model = "gpt-5.6-sol" # 也可使用 gpt-5.6-terra、gpt-5.6-luna 或其他支援的模型
model_provider = "cliproxyapi"

# 不要求確認即可執行操作，具有風險。Codex 新手不建議啟用；移除 # 即可啟用
# approval_policy = "never"

# 沙箱模式具有極高權限，具有風險。Codex 新手不建議啟用；移除 # 即可啟用
# sandbox_mode = "danger-full-access"

model_reasoning_effort = "xhigh"
plan_mode_reasoning_effort = "xhigh"

[model_providers.cliproxyapi]
base_url = "http://127.0.0.1:8317/v1"
experimental_bearer_token = "sk-dummy" # 改為你在 CLIProxyAPI 中為 Codex 建立的 API 金鑰
name = "OpenAI"
wire_api = "responses"
requires_openai_auth = true
supports_websockets = true # 依需求決定是否啟用 WebSocket
```

無需修改 `auth.json` 檔案。

## 設定為 API 模式

啟動 CLIProxyAPI 伺服器，修改 `~/.codex/config.toml` 和 `~/.codex/auth.json` 檔案。

config.toml:
```toml
# 不要求確認即可執行操作，具有風險。Codex 新手不建議啟用；移除 # 即可啟用
# approval_policy = "never"

# 沙箱模式具有極高權限，具有風險。Codex 新手不建議啟用；移除 # 即可啟用
# sandbox_mode = "danger-full-access"

model_provider = "cliproxyapi"
model = "gpt-5.6-sol" # 也可使用 gpt-5.6-terra、gpt-5.6-luna 或其他支援的模型
model_reasoning_effort = "high"

[model_providers.cliproxyapi]
name = "cliproxyapi"
base_url = "http://127.0.0.1:8317/v1"
wire_api = "responses"
```

auth.json:
```json
{
  "OPENAI_API_KEY": "sk-dummy"
}
```
