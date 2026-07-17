import { defineConfig } from 'vitepress'

const localePrefix = '/zh-TW'

// https://vitepress.dev/reference/default-theme-config
export default defineConfig({
	title: 'CLIProxyAPI',
	description:
		'將 ChatGPT Codex、Claude Code 與其他模型供應商封裝為相容 OpenAI、Gemini、Claude 及 Codex 的 API 服務。',
	themeConfig: {
		nav: [
			{ text: '首頁', link: `${localePrefix}/` },
			{ text: '快速開始', link: `${localePrefix}/introduction/quick-start` },
		],

		sidebar: [
			{
				text: '簡介',
				items: [
					{
						text: '什麼是 CLIProxyAPI？',
						link: `${localePrefix}/introduction/what-is-cliproxyapi`,
					},
					{
						text: '快速開始',
						link: `${localePrefix}/introduction/quick-start`,
					},
					{
						text: 'GitHub',
						link: 'https://github.com/router-for-me/CLIProxyAPI',
					},
				],
			},
			{
				text: '設定',
				items: [
					{ text: '基本設定', link: `${localePrefix}/configuration/basic` },
					{ text: '設定選項', link: `${localePrefix}/configuration/options` },
					{ text: '憑證目錄', link: `${localePrefix}/configuration/auth-dir` },
					{
						text: '熱重新載入',
						link: `${localePrefix}/configuration/hot-reloading`,
					},
					{
						text: '儲存空間',
						items: [
							{ text: 'Git 儲存空間', link: `${localePrefix}/configuration/storage/git` },
							{
								text: 'PostgreSQL 儲存空間',
								link: `${localePrefix}/configuration/storage/pgsql`,
							},
							{ text: '物件儲存空間', link: `${localePrefix}/configuration/storage/s3` },
						],
					},
					{
						text: '供應商',
						items: [
							{
								text: 'Gemini API',
								link: `${localePrefix}/configuration/provider/gemini`,
							},
							{
								text: 'Antigravity',
								link: `${localePrefix}/configuration/provider/antigravity`,
							},
							{
								text: 'Claude Code',
								link: `${localePrefix}/configuration/provider/claude-code`,
							},
							{ text: 'Codex', link: `${localePrefix}/configuration/provider/codex` },
							{ text: 'xAI / Grok', link: `${localePrefix}/configuration/provider/xai` },
							{ text: 'AI Studio', link: `${localePrefix}/configuration/provider/ai-studio` },
							{
								text: 'OpenAI 相容性',
								link: `${localePrefix}/configuration/provider/openai-compatibility`,
							},
							{
								text: 'Claude Code 相容性',
								link: `${localePrefix}/configuration/provider/claude-code-compatibility`,
							},
							{
								text: 'Gemini 相容性',
								link: `${localePrefix}/configuration/provider/gemini-compatibility`,
							},
							{
								text: 'Codex 相容性',
								link: `${localePrefix}/configuration/provider/codex-compatibility`,
							},
						],
					},
					{ text: '思考預算', link: `${localePrefix}/configuration/thinking` },
				],
			},
			{
				text: '管理',
				items: [
					{ text: 'Web UI', link: `${localePrefix}/management/webui` },
					{ text: '桌面 GUI', link: `${localePrefix}/management/gui` },
					{ text: '管理 API', link: `${localePrefix}/management/api` },
					{
						text: 'Redis 用量佇列',
						link: `${localePrefix}/management/redis-usage-queue`,
					},
				],
			},
			{
				text: 'Agent 用戶端設定',
				items: [
					{ text: 'Claude Code', link: `${localePrefix}/agent-client/claude-code` },
					{ text: 'Codex', link: `${localePrefix}/agent-client/codex` },
					{ text: 'Factory Droid', link: `${localePrefix}/agent-client/droid` },
					{ text: 'OpenCode', link: `${localePrefix}/agent-client/opencode` },
				],
			},
			{
				text: '外掛',
				items: [
					{ text: '外掛開發', link: `${localePrefix}/plugin/development` },
					{
						text: '進入點功能',
						items: [
							{ text: '模型註冊器', link: `${localePrefix}/plugin/model-registrar` },
							{ text: '模型提供者', link: `${localePrefix}/plugin/model-provider` },
							{ text: '憑證提供者', link: `${localePrefix}/plugin/auth-provider` },
							{
								text: '前端身分驗證提供者',
								link: `${localePrefix}/plugin/frontend-auth-provider`,
							},
							{
								text: '前端身分驗證專用模式',
								link: `${localePrefix}/plugin/frontend-auth-exclusive`,
							},
							{ text: '排程器', link: `${localePrefix}/plugin/scheduler` },
							{ text: '模型路由器', link: `${localePrefix}/plugin/model-router` },
							{ text: '執行器', link: `${localePrefix}/plugin/executor` },
						],
					},
					{
						text: '請求處理',
						items: [
							{ text: '請求轉譯器', link: `${localePrefix}/plugin/request-translator` },
							{ text: '請求正規化器', link: `${localePrefix}/plugin/request-normalizer` },
							{ text: '請求攔截器', link: `${localePrefix}/plugin/request-interceptor` },
						],
					},
					{
						text: '回應處理',
						items: [
							{ text: '回應轉譯器', link: `${localePrefix}/plugin/response-translator` },
							{
								text: '轉譯前回應正規化器',
								link: `${localePrefix}/plugin/response-before-translator`,
							},
							{
								text: '轉譯後回應正規化器',
								link: `${localePrefix}/plugin/response-after-translator`,
							},
							{ text: '回應攔截器', link: `${localePrefix}/plugin/response-interceptor` },
							{
								text: '串流回應攔截器',
								link: `${localePrefix}/plugin/response-stream-interceptor`,
							},
						],
					},
					{
						text: '擴充功能與回呼',
						items: [
							{ text: 'Thinking 套用器', link: `${localePrefix}/plugin/thinking-applier` },
							{ text: '用量觀察器', link: `${localePrefix}/plugin/usage-plugin` },
							{
								text: '命令列擴充功能',
								link: `${localePrefix}/plugin/command-line-plugin`,
							},
							{ text: '管理 API', link: `${localePrefix}/plugin/management-api` },
							{ text: '主機回呼', link: `${localePrefix}/plugin/host-callbacks` },
						],
					},
				],
			},
			{
				text: 'Docker',
				items: [
					{ text: '使用 Docker 執行', link: `${localePrefix}/docker/docker` },
					{
						text: '使用 Docker Compose 執行',
						link: `${localePrefix}/docker/docker-compose`,
					},
				],
			},
			{
				text: '實作教學',
				items: [
					{ text: '教學 0：設定詳解', link: `${localePrefix}/hands-on/tutorial-0` },
					{ text: '教學 3：NanoBanana 實作', link: `${localePrefix}/hands-on/tutorial-3` },
					{ text: '教學 4：中繼轉送整合', link: `${localePrefix}/hands-on/tutorial-4` },
					{ text: '教學 5：Docker 伺服器部署', link: `${localePrefix}/hands-on/tutorial-5` },
					{ text: '教學 6：Web GUI 入門', link: `${localePrefix}/hands-on/tutorial-6` },
					{ text: '雲端部署（內建儲存空間）', link: `${localePrefix}/hands-on/tutorial-7` },
					{ text: '雲端部署（資料庫儲存空間）', link: `${localePrefix}/hands-on/tutorial-8` },
					{ text: '雲端部署（物件儲存空間）', link: `${localePrefix}/hands-on/tutorial-9` },
					{ text: '雲端部署（Git 儲存空間）', link: `${localePrefix}/hands-on/tutorial-10` },
					{
						text: '零成本部署（AI Studio 反向代理）',
						link: `${localePrefix}/hands-on/tutorial-11`,
					},
				],
			},
		],

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/router-for-me/CLIProxyAPI' },
		],

		docFooter: {
			prev: '上一頁',
			next: '下一頁',
		},
		outline: {
			label: '本頁目錄',
		},
		lastUpdated: {
			text: '最後更新時間',
		},
		notFound: {
			title: '找不到頁面',
			quote: '請確認網址是否正確，或回到首頁繼續瀏覽。',
			linkLabel: '前往首頁',
			linkText: '回到首頁',
		},
		langMenuLabel: '語言',
		returnToTopLabel: '回到頁首',
		sidebarMenuLabel: '選單',
		darkModeSwitchLabel: '外觀',
		lightModeSwitchTitle: '切換至淺色模式',
		darkModeSwitchTitle: '切換至深色模式',
		skipToContentLabel: '跳至主要內容',
		footer: {
			message: '依 MIT 授權條款釋出。',
			copyright: '著作權所有 2025–至今 Router-For.ME',
		},
	},
})
