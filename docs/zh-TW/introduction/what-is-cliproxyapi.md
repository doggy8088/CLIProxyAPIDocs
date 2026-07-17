---
outline: deep
---

# 什麼是 CLIProxyAPI？

**CLIProxyAPI** 是一套代理伺服器，可將 CLI 模型供應商封裝為相容 OpenAI、Gemini、Claude、Codex 與 Grok 的 API。

你可以在本機使用單一或多個帳號，並透過任何相容 OpenAI（包括 Responses）、Gemini 或 Claude API 的用戶端與 SDK 存取服務。

## 功能特性

- 為 CLI 模型提供 OpenAI/Gemini/Claude/Codex/Grok 相容的 API 端點
- Antigravity 支援（OAuth 登入）
- OpenAI Codex（GPT 系列）支援（OAuth 登入）
- Claude Code 支援（OAuth 登入）
- Grok Build 支援（OAuth 登入）
- 支援串流與非串流回應
- 函式呼叫/工具支援
- 多模態輸入（文字、圖片）
- 多帳號輪替與負載平衡（Gemini、OpenAI、Claude 與 Grok）
- 簡單的 CLI 身分驗證流程（OpenAI、Claude 與 Grok）
- 支援 Gemini AIStudio API 金鑰
- 支援 AI Studio Build 多帳號輪替
- 支援 Antigravity 多帳號輪替
- 支援 Claude Code 多帳號輪替
- 支援 OpenAI Codex 多帳號輪替
- 支援 Grok Build 多帳號輪替
- 透過設定串接上游 OpenAI 相容供應商（例如 OpenRouter）

## 支援的模型

- gemini-3-pro-preview
- gemini-3-pro-image-preview
- gemini-2.5-pro
- gemini-2.5-flash
- gemini-2.5-flash-lite
- gemini-2.5-flash-image
- gemini-2.5-flash-image-preview
- gemini-pro-latest
- gemini-flash-latest
- gemini-flash-lite-latest
- gpt-5
- gpt-5-codex
- claude-opus-4-1-20250805
- claude-opus-4-20250514
- claude-sonnet-4-20250514
- claude-sonnet-4-5-20250929
- claude-haiku-4-5-20251001
- claude-3-7-sonnet-20250219
- claude-3-5-haiku-20241022
- deepseek-v3.2
- deepseek-v3.1
- deepseek-r1
- deepseek-v3
- kimi-k2
- glm-4.6
- tstars2.0
