# Claude Code

啟動 CLIProxyAPI 伺服器，並設定下列環境變數：

- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`

若使用 1.x.x 版，則設定下列環境變數：

- `ANTHROPIC_MODEL`
- `ANTHROPIC_SMALL_FAST_MODEL`

使用 Gemini 模型：
```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317
export ANTHROPIC_AUTH_TOKEN=sk-dummy
# 2.x.x 版本
export ANTHROPIC_DEFAULT_OPUS_MODEL=gemini-2.5-pro
export ANTHROPIC_DEFAULT_SONNET_MODEL=gemini-2.5-flash
export ANTHROPIC_DEFAULT_HAIKU_MODEL=gemini-2.5-flash-lite
# 1.x.x 版本
export ANTHROPIC_MODEL=gemini-2.5-pro
export ANTHROPIC_SMALL_FAST_MODEL=gemini-2.5-flash
```

使用 OpenAI GPT 5 模型：
```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317
export ANTHROPIC_AUTH_TOKEN=sk-dummy
# 2.x.x 版本
export ANTHROPIC_DEFAULT_OPUS_MODEL=gpt-5(high)
export ANTHROPIC_DEFAULT_SONNET_MODEL=gpt-5(medium)
export ANTHROPIC_DEFAULT_HAIKU_MODEL=gpt-5(minimal) # 不建議使用 gpt-5(minimal)，建議使用 gemini-2.5-flash-lite 代替
# 1.x.x 版本
export ANTHROPIC_MODEL=gpt-5
export ANTHROPIC_SMALL_FAST_MODEL=gpt-5(minimal) # 不建議使用 gpt-5(minimal)，建議使用 gemini-2.5-flash-lite 代替
```

使用 OpenAI GPT 5 Codex 模型：
```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317
export ANTHROPIC_AUTH_TOKEN=sk-dummy
# 2.x.x 版本
export ANTHROPIC_DEFAULT_OPUS_MODEL=gpt-5-codex(high)
export ANTHROPIC_DEFAULT_SONNET_MODEL=gpt-5-codex(medium)
export ANTHROPIC_DEFAULT_HAIKU_MODEL=gpt-5-codex(low) # 不建議使用 gpt-5-codex(low)，建議使用 gemini-2.5-flash-lite 代替
# 1.x.x 版本
export ANTHROPIC_MODEL=gpt-5-codex
export ANTHROPIC_SMALL_FAST_MODEL=gpt-5-codex(low) # 不建議使用 gpt-5-codex(low)，建議使用 gemini-2.5-flash-lite 代替
```

使用 Claude 模型：
```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317
export ANTHROPIC_AUTH_TOKEN=sk-dummy
# 2.x.x 版本
export ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-4-1-20250805
export ANTHROPIC_DEFAULT_SONNET_MODEL=claude-sonnet-4-5-20250929
export ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-3-5-haiku-20241022
# 1.x.x 版本
export ANTHROPIC_MODEL=claude-sonnet-4-20250514
export ANTHROPIC_SMALL_FAST_MODEL=claude-3-5-haiku-20241022
```
