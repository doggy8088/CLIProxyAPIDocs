# 零成本部署：Render（Git 儲存空間）

在昨天的文章《零成本部署（ClawCloud）》發布後，我接著測試了 Render 平台，發現其免費方案不提供持續儲存空間。向 CLIProxyAPI 作者回報此情況後，他隨即更新版本，加入 Git 儲存功能。如此便能將設定檔與憑證檔案保存在 GitHub 私有儲存庫中，不必仰賴容器平台的持續儲存空間。

本文說明如何在不提供持續儲存空間的容器服務上部署 CLIProxyAPI，Render 免費方案即為其中一例。EasyCLI 的 OAuth 身分驗證流程與 ClawCloud 部署方式相同，請參閱前一篇教學。

### 一、GitHub 準備工作

先在 GitHub 建立空白儲存庫。名稱可自訂，但儲存庫必須設為私有，否則 API 金鑰等敏感資訊會公開。

![](https://img.072899.xyz/2025/10/311e26cb4da97cafd7bb3b924440e858.png)

建立儲存庫後，記下儲存庫網址。接著點選頁面右上角的個人頭像，進入 **Settings**，再點選左側選單最下方的 **Developer Settings**。

![](https://img.072899.xyz/2025/10/a79377c7af3c80ec58ad853d12762b6c.png)

接著，依序點選 **Personal access tokens** -> **Fine-grained tokens**，然後點選右上角的 **Generate new token**

![](https://img.072899.xyz/2025/10/90fa44065df641c7599b8d16e84edf60.png)

填寫 Token name（可自訂），依需求選擇 Expiration，並在 **Repository access** 中選擇 **Only select repositories**，再選取剛建立的空白儲存庫。

![](https://img.072899.xyz/2025/10/74b5484e44a28293335160a9d42bb190.png)

將頁面向下拉動，在 **Permissions** -> **Add permissions** 中找到 **Contents**，新增並將其權限從 `Read-only` 修改為 `Read and write`

![](https://img.072899.xyz/2025/10/825aafe9f3a52fc431a3ec54829777de.png)

確認權限設定無誤後，點選頁面底部的 **Generate token**

![](https://img.072899.xyz/2025/10/0b5f56df634cea1e3552b8560c7f175a.png)

頁面會顯示產生的權杖。此權杖只會顯示一次，關閉頁面後無法再次檢視，請立即複製並安全保存。

![](https://img.072899.xyz/2025/10/a04fc4a6a75cab2222ba28d46e4463e9.png)

至此，GitHub 的準備工作就完成了。

### 二、Render 部署

首先，請確保你已註冊 Render 帳號。登入後，建立專案並選擇 **New Web Service**

![](https://img.072899.xyz/2025/10/0398d8d1483fe65d556727ec23075eaf.png)

在部署方式中選擇 **Existing Image**，在 **Image URL** 中輸入 `eceasy/cli-proxy-api:latest`，然後點選 **Connect**

![](https://img.072899.xyz/2025/10/4ee784242be93bee942f0eea64d51af5.png)

輸入服務名稱 **Name**，可自訂；選擇區域 **Region**，並確保執行個體型別為 **Free**。

![](https://img.072899.xyz/2025/10/90d6fb2b4a5d401d02a917f82396c304.png)

接下來，我們需要新增 4 個環境變數：

- `GITSTORE_GIT_URL`：GitHub 儲存庫位址
- `GITSTORE_GIT_USERNAME`：GitHub 使用者名稱
- `GITSTORE_GIT_TOKEN`：剛建立的 Personal Access Token
- `MANAGEMENT_PASSWORD`：登入管理介面的密碼

輸入完成後，點選頁面底部的 **Deploy Web Service**

![](https://img.072899.xyz/2025/10/d4b39d6e4f10a19ada98e4af0e505df9.png)

等待部署狀態變為 **Live**，且記錄出現 `Available at your primary URL: XXXX`，即表示程式已啟動。

![](https://img.072899.xyz/2025/10/f77a35fa4f805e78fbcff663c6cf5aae.png)

使用 Render 提供的 URL，在其後新增 `/management.html`，即可進入 WebUI。輸入你設定的 `MANAGEMENT_PASSWORD` 即可登入

![](https://img.072899.xyz/2025/10/af84a3b0d2cc0197f2b4ecb3497c802e.png)

此時再檢視你的 GitHub 儲存庫，會發現其中已自動產生了兩個資料夾

![](https://img.072899.xyz/2025/10/03bbde6090e53ae3362a624badd35319.png)

以上即為 Render 部署流程。其他性質相近的容器雲端平台也可參考此方法調整。

### 三、注意事項

1.  此功能自 CLIProxyAPI v6.2.2 起提供。若要指定映像檔版本，至少應使用 `eceasy/cli-proxy-api:v6.2.2`。
2.  使用此方式部署後，設定檔中的 `remote-management` 部分將不再生效，管理密碼以環境變數為準。這意味著，若要修改管理密碼，你需要直接修改環境變數 `MANAGEMENT_PASSWORD`。
3.  GitHub 儲存功能不能讓多個容器執行個體同時共用同一組設定與憑證；如此操作可能造成衝突。
4.  容器執行期間，直接在 GitHub 儲存庫手動修改的內容不會生效。若必須手動修改，請先停止容器服務。
5.  建議使用 WebUI 或 EasyCLI 管理設定。EasyCLI 也支援遠端 OAuth 身分驗證，操作方式請參閱《零成本部署：ClawCloud（內建儲存空間）》。
