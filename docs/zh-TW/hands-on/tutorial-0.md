# 教學 0：設定詳解

本文逐項說明 [CLIProxyAPI 專案](https://github.com/router-for-me/CLIProxyAPI)設定檔中的主要選項，供使用者查閱。

提示：設定檔支援熱重新載入；修改後會立即生效，不必重新啟動程式。

```yaml
# CLIProxyAPI 會執行 HTTP 伺服器，此處指定其連接埠
port: 8317

# 遠端管理設定，搭配 EasyCLI 或 WebUI 使用
remote-management:
  # 若部署於伺服器，必須設為 true，EasyCLI 或 WebUI 才能遠端連線至 CLIProxyAPI
  # 若只透過本機 API 管理，可維持 false
  allow-remote: false

  # 若要透過 EasyCLI 或 WebUI 的 API 管理 CLIProxyAPI，必須設定管理金鑰
  # 留空會停用管理 API，也無法使用 EasyCLI 或 WebUI 連線
  secret-key: ""

  # 是否停用內建 WebUI
  # 設為 false 時，可透過 http://YOUR_SERVER_IP:8317/management.html 開啟 WebUI
  disable-control-panel: false

# 憑證檔案存放目錄，用於存放 Gemini Web、Claude Code、Codex 的憑證檔案
# 預設為目前帳號家目錄下的 .cli-proxy-api 資料夾，適用於 Windows 與 Linux
# 程式首次啟動時會自動建立該資料夾
# Windows 預設為 C:\Users\你的使用者名稱\.cli-proxy-api
# Linux 預設為 /home/你的使用者名稱/.cli-proxy-api
# Windows 若使用其他位置，請依此格式填寫："Z:\\CLIProxyAPI\\auths"
auth-dir: "~/.cli-proxy-api"

# 是否在記錄中啟用 Debug 資訊；預設停用，需要除錯時再啟用
debug: false

# 隱藏設定，可記錄每一個請求與回應，並儲存至 logs 目錄
# 每筆記錄可能超過 10 MB，磁碟空間不足時請勿啟用
request-log: false

# 是否將記錄重定向到記錄檔中
# 預設啟用，記錄會儲存在程式目錄下的 logs 資料夾
# 停用時，記錄會顯示於主控台
logging-to-file: true

# 開關使用統計，預設啟用
# 可透過 API、EasyCLI 或 WebUI 檢視使用量
usage-statistics-enabled: true

# 代理設定支援 socks5/http/https 通訊協定
# 格式範例："socks5://user:pass@192.168.1.1:1080/"
proxy-url: ""

# 收到 403、408、500、502、503、504 狀態碼時，自動重試請求的次數
request-retry: 3

# 模型受到限制之後的處理行為
quota-exceeded:
  # 多帳號輪替的核心設定
  # 設為 true 時，若某個帳號觸發 429，程式會切換至下一個帳號重新傳送請求
  # 設為 false 時，程式會將 429 錯誤傳回用戶端並結束目前請求
  # 設為 true 時，只要輪替清單中至少有一個帳號可用，用戶端便不會收到這項錯誤
  # 設為 false 時，則由用戶端決定重試或中止
  switch-project: true

# 隱藏設定，可依需求停用重試冷卻時間
# 例如某模型觸發 429 後，程式會暫時停用該模型；重複觸發會延長停用時間，最多 30 分鐘
# 預設情況下，停用期內會跳過該模型
# 設為 true 後，即使模型處於停用期，仍會對該模型傳送每一個請求
disable-cooling: false

# 各種 AI 用戶端存取 CLIProxyAPI 時使用的 API 金鑰，請勿與後續的上游金鑰混淆
# 此處金鑰用於用戶端存取 CLIProxyAPI；後續金鑰則由 CLIProxyAPI 用來存取上游服務
api-keys:
  - "your-api-key-1"
  - "your-api-key-2"

# AI Studio 身分驗證開關；設為 true 時，會使用上述 api-keys 驗證 AI Studio Build 應用程式
ws-auth: false

# Gemini 官方 API 金鑰設定。舊的 generative-language-api-key 會在載入時自動遷移至此欄位，並從設定檔移除
# 未設定 base-url 時使用官方端點；設定後可串接第三方轉送服務
# 使用 Cloudflare AI Gateway 時，可透過 headers 設定身分驗證
# 每把金鑰也可個別設定 proxy-url
gemini-api-key:
  - api-key: "AIzaSy...01"
    base-url: "https://generativelanguage.googleapis.com"
    headers:
      X-Custom-Header: "custom-value"
    proxy-url: "socks5://proxy.example.com:1080"
  - api-key: "AIzaSy...02"

# Codex API 金鑰；在此填入轉送服務提供的金鑰與 base-url
# 每把金鑰也可個別設定 proxy-url
codex-api-key:
  - api-key: "sk-atSM..."
    base-url: "https://www.example.com"
    proxy-url: "socks5://proxy.example.com:1080"

# Claude API 金鑰；使用官方金鑰時不必設定 base-url，使用第三方轉送服務時則需設定
# 每把金鑰也可個別設定 proxy-url
claude-api-key:
  - api-key: "sk-atSM..."
  - api-key: "sk-atSM..."
    base-url: "https://www.example.com"
    proxy-url: "socks5://proxy.example.com:1080"
    models:
      # 轉送商提供的模型名稱
      - name: "claude-3-5-sonnet-20241022"
        # 模型別名，也就是用戶端實際設定的模型名稱
        alias: "claude-sonnet-latest"

# 可在此串接各種 OpenAI 相容供應商
openai-compatibility:
  - name: "openrouter"
    base-url: "https://openrouter.ai/api/v1"
    # 舊欄位 api-keys 會在載入時自動遷移為 api-key-entries。
    api-key-entries:
      - api-key: "sk-or-v1-...b780"
        proxy-url: "socks5://proxy.example.com:1080"
      - api-key: "sk-or-v1-...b781"
    models:
      # OpenAI 相容供應商提供的模型名稱
      - name: "moonshotai/kimi-k2:free"
        # 模型別名，也就是用戶端實際設定的模型名稱
        alias: "kimi-k2"
```
