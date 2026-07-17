# 教學 5：使用 Docker 部署伺服器

先前的系列文章已介紹如何在本機使用 CLIProxyAPI。本文進一步說明如何透過 Docker 部署至伺服器。

### 一、環境準備

開始前，請準備一部可用的 VPS（虛擬私人伺服器）。本文以 Debian 13 為範例。

同時，請確保你的伺服器上已經安裝了 **Git** 和 **Docker**。

如果尚未安裝，可以透過以下命令進行安裝：

#### 1. 安裝 Git

```bash
apt update && apt install git -y
```

#### 2. 安裝 Docker

可以使用官方提供的一鍵指令碼進行安裝：

```bash
bash <(curl -fsSL [https://get.docker.com](https://get.docker.com))
```

### 二、部署 CLIProxyAPI

準備工作就緒後，請依序執行以下命令來複製專案並初始化設定。

```bash
git clone https://github.com/router-for-me/CLIProxyAPI.git
cd CLIProxyAPI
cp config.example.yaml config.yaml
```

![](https://img.072899.xyz/2025/09/60714b62a0f5b3ea896ab5461ecec150.png)

此時，我們可以開啟 `config.yaml` 檔案進行編輯。本教學將採用以下最小化設定作為範例：

```yaml
port: 8317

# 資料夾位置請根據你的實際情況填寫
auth-dir: "~/.cli-proxy-api"

request-retry: 3

quota-exceeded:
  switch-project: true
  switch-preview-model: true

api-keys:
# 請自行設定 API 金鑰，供用戶端存取代理服務
- "ABC-123456"
```

> **請注意：** 當使用 Docker 部署時，建議保持 `auth-dir` 的預設設定，無需修改。

編輯 `config.yaml` 後，執行下列 Docker 容器建置指令碼：

```bash
bash docker-build.sh
```

指令碼會提供兩個選項：

![](https://img.072899.xyz/2025/09/f0f543ef4004f3f81c029f442b54c8bc.png)

- **選項 1：** 直接使用 Docker Hub 上的預建置映像檔執行 (`docker compose up -d`)，速度快。
- **選項 2：** 在伺服器本機建置映像檔後執行，適合需要自訂修改的情境。

本教學選擇「選項 1」。執行後請等待服務完成啟動。

![](https://img.072899.xyz/2025/09/44609a9a0746c138f570202bd2825366.png)

### 三、檢視記錄

儘管指令碼提示使用 `docker compose logs -f` 檢視記錄，但由於程式預設會將記錄重定向到檔案，因此**即時檢視記錄**需要使用以下命令：

```bash
tail -f ./logs/main.log
```

### 四、新增 OAuth 身分驗證

程式正常執行後，可依先前文章說明編輯設定檔，以新增中繼轉送服務金鑰。以下著重說明如何透過 OAuth 新增授權憑證檔案。

#### 步驟一：在伺服器端產生登入連結

以新增 **Codex** 為例，請在專案根目錄下執行以下命令：

```bash
docker compose exec cli-proxy-api /CLIProxyAPI/CLIProxyAPI -no-browser --codex-login
```

程式會產生一段用於建立 SSH 隧道的命令，請複製箭頭處 `ssh` 開頭的整段命令。

![](https://img.072899.xyz/2025/09/42f152ef068cea1df603b29934b6e814.png)

#### 步驟二：在本機建立 SSH 通道

在**你自己電腦**的終端或命令列工具中，貼上剛才複製的命令。

![](https://img.072899.xyz/2025/09/1c27a2d2e3bc1ad823a040a50cb8e143.png)

> **注意：** 請將指令中 `-p` 參數後的連接埠（範例為 `22`）替換為 VPS 實際使用的 SSH 連接埠。

按 Enter 後輸入伺服器的 SSH 登入密碼。連線成功後，請保持此終端機視窗開啟，並回到操作伺服器的終端機。

![](https://img.072899.xyz/2025/09/e25d23bc9b129cc9bbc6f4e1a674fed5.png)

#### 步驟三：透過瀏覽器完成授權

複製伺服器終端機上顯示的連結。

![](https://img.072899.xyz/2025/09/5ddcbc39551201f61b906703034af3d8.png)

在本機瀏覽器開啟該連結，使用 ChatGPT 帳號登入並授權。

![](https://img.072899.xyz/2025/09/a4ed389a080bce529c47bda6f3129189.png)

授權成功後，會看到如下畫面：

![](https://img.072899.xyz/2025/09/507c93b6fc900eae5c6c5b486b399561.png)

伺服器終端機也會顯示憑證檔案已儲存。

![](https://img.072899.xyz/2025/09/a34bb04a63f7f75f687a2a626035dccd.png)

至此已完成 Codex 身分驗證。Claude 與 Antigravity 等其他使用 OAuth 授權的服務，操作流程相同。

### 五、運作原理

最後，我們來總結一下這個遠端 OAuth 身分驗證流程的原理：

Claude、Codex 與 Antigravity 的 OAuth 身分驗證都需要回呼（Callback）流程來接收授權權杖。基於安全限制，服務供應商通常會將回呼位址固定為 `localhost`。

在 Docker 容器中執行授權指令時，容器內沒有瀏覽器，因此必須在本機開啟授權網頁。但授權後，瀏覽器會嘗試存取 `localhost`；這只會連到本機，無法將權杖傳給遠端伺服器上的程式。

SSH 通道（SSH Tunnel）會將本機特定連接埠（例如 `1455`）的所有網路請求，透過加密的 SSH 連線轉送至伺服器的相同連接埠。當瀏覽器存取本機的 `http://localhost:1455` 時，請求會實際轉送至伺服器上監聽 `1455` 連接埠的 CLIProxyAPI，因而完成遠端身分驗證。

另一種做法是在瀏覽器跳至 `localhost` 回呼連結時，手動將 `localhost` 替換為伺服器的 IP 或網域。此方法必須正確設定伺服器防火牆或反向代理，確保伺服器可接收回呼請求；否則身分驗證會失敗。

### 六、設定用戶端

完成設定後，將用戶端請求端點（Endpoint）指向伺服器的 `IP:連接埠`，例如 `http://YOUR_SERVER_IP:8317`；其餘操作與本機使用方式相同。

以上即為透過 Docker 將 CLIProxyAPI 部署至伺服器的完整流程。
