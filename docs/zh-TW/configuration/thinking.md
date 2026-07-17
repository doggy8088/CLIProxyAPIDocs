# 透過模型名稱括號設定思考預算

在模型名稱結尾加上 `(值)`，即可控制思考預算或推理強度。代理伺服器會在路由前移除這段括號，並將解析後的設定套用至請求。

## 可用取值

- `(數字)`：明確指定思考預算（以供應商原生 token 計算）；超出模型支援範圍時，會限制在範圍內。
- `(等級)`：使用預設的推理強度（不區分大小寫）：

| 等級        | 約等於預算                | 說明      |
|-----------|----------------------|---------|
| `minimal` | 512                  | 低成本推理   |
| `low`     | 1024                 | 快速推理    |
| `medium`  | 8192                 | 預設推理深度  |
| `high`    | 24576                | 深度推理    |
| `xhigh`   | 32768                | 更深推理    |
| `auto`    | 動態（允許時為 -1，否則採用中間值或下限） | 由上游自動分配 |
| `none`    | 0（不允許 0 時採用最小值）    | 關閉思考    |

- 空括號 `()` 會被忽略。`provider://model` 形式請在模型名後加括號，例如 `openrouter://gemini-3-pro-preview(high)`。

## 套用規則

- 僅對宣告支援思考的模型生效；不支援的模型只會移除括號，不注入思考欄位。
- Gemini：將限制於有效範圍內的值寫入 `generationConfig.thinkingConfig.thinkingBudget`，且不修改 `include_thoughts`。本身具有預設思考行為的模型（例如 `gemini-3-pro-preview`）仍會自動啟用思考，但括號指定的預算會覆寫預設值。
- Claude API：提供預算/等級時會設定 `thinking.type=enabled` 並填入正規化後的 `thinking.budget_tokens`，必要時提升 `max_tokens`。
- OpenAI/Codex/OpenRouter：等級、`auto` 或 `none` 會覆寫 `reasoning_effort`（Chat）或 `reasoning.effort`（Responses）；純數字預算不會改寫這些 API 格式的 `reasoning_effort`。
- 使用離散等級的模型會驗證等級，不支援的取值會傳回 400。

## 使用範例

- 動態思考預算（Gemini）：

```bash
curl -X POST http://localhost:8317/v1/chat/completions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "model": "gemini-3-pro-preview(auto)",
        "messages": [{ "role": "user", "content": "幫我總結要點" }]
      }'
# 正規化為 gemini-3-pro-preview，並寫入 thinkingBudget=-1；不支援動態預算時會限制於模型範圍內，且不修改 include_thoughts。
```

- OpenAI Responses 高等級推理：

```bash
curl -X POST http://localhost:8317/v1/responses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "model": "gpt-5.1(high)",
        "input": "列出三個改進點"
      }'
# 以 gpt-5.1 路由，並將 reasoning.effort 覆寫為 "high"。
```

- 關閉思考（不允許 0 時會採用最小值）：

```bash
model=claude-sonnet-4.5(none)
# 若模型允許，則寫入 thinking.budget_tokens=0；否則採用模型的最小值。
```
