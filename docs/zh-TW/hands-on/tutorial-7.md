# 零成本部署：ClawCloud（內建儲存空間）

先前的《教學 5：使用 Docker 部署伺服器》需要 VPS。本篇改為介紹容器雲端平台的部署方式。

`CLIProxyAPI` 支援 Docker，因此也能在容器雲端平台執行。但直接部署時需要處理下列兩個問題：

- **設定檔持續儲存**：容器重新啟動後，未掛載至持續儲存空間的設定變更會遺失。
- **OAuth 身分驗證**：在 VPS 的 Docker 環境中，可以透過 SSH 通道將驗證回呼轉送至伺服器。純容器雲端環境通常不支援 SSH 通道，必須開放額外連接埠，並在回呼時手動修改網域。

下列步驟說明如何使用 `CLIProxyAPI` 的容器雲端部署支援完成設定。

本教學使用 [ClawCloud Run](https://run.claw.cloud/) 示範。原始教學資料指出，使用註冊超過 180 天的 GitHub 帳號登入，可取得每月 5 美元的循環額度，而範例中的 `CLIProxyAPI` 每日約使用 0.05 美元。平台方案與價格可能變動，實際額度請以 ClawCloud 公告為準。其他容器雲端平台可參考相同流程調整。

登入 ClawCloud Run 後，點選 **App Launchpad**。

![](https://img.072899.xyz/2025/10/080dfe9fd2c214ff9e507bd4d2bd5caa.png)

點選 **Create APP**

![](https://img.072899.xyz/2025/10/d44ca8835fac8cfc6b7a82a3ea4d95c9.png)

首先我們填寫基礎資訊

- 應用程式名稱（Application Name）：可自訂，此處填寫 `cliproxyapi`
- 映像檔名稱（Image Name）：`eceasy/cli-proxy-api:latest`
- 網路（Network）：將容器連接埠改為 `8317`，並啟用 **Public Access**

![](https://img.072899.xyz/2025/10/1a4941e799911d181d658de450f6e5d7.png)

頁面向下拉動，在進階設定中，我們需要填寫：

- 啟動指令（Command）：`/CLIProxyAPI/CLIProxyAPI --config /data/config.yaml`
- 環境變數（Environment Variables）：`DEPLOY=cloud`
- 持續儲存空間（Local Storage）：`/data`

![](https://img.072899.xyz/2025/10/3370f4146f19e92087f188dac5184575.png)

環境變數與儲存空間的填寫方式如下圖所示。

| ![](https://img.072899.xyz/2025/10/e854143ef56bd6a71a922cad921c08b2.png) | ![](https://img.072899.xyz/2025/10/d966536ab7dd785ffc36355fdb2536cc.png) |
| ------------------------------------------------------------ | ------------------------------------------------------------ |

確認所有資訊填寫無誤後，點選右上角的 **Deploy Application**，應用程式將開始部署

![](https://img.072899.xyz/2025/10/dc49813c993e84e68af74747332b247b.png)

部署完成後，**Public Address** 狀態會變為 **Available**。請記下對應網址，後續將以此存取 `CLIProxyAPI`。

![](https://img.072899.xyz/2025/10/6502f6ce1d9a4f63c132966ae9c37064.png)

等待部署期間可先準備 `config.yaml`。請注意，`remote-management.secret-key` 是遠端管理金鑰，`api-keys` 則是 AI 用戶端連線至 `CLIProxyAPI` 時使用的金鑰，兩者用途不同。

```yaml
port: 8317
remote-management:
  allow-remote: true
  secret-key: "ABCD-1234"
  disable-control-panel: false
auth-dir: "/data/auths"
debug: false
logging-to-file: false
usage-statistics-enabled: false
request-retry: 3
quota-exceeded:
   switch-project: true
   switch-preview-model: true
api-keys:
  - "EFGH-5678"
```

當容器狀態變為 **Active** 之後

![](https://img.072899.xyz/2025/10/99cce03e91ceb4eca44b8a055d0b874a.png)

點選圖中的按鈕，開啟先前新增的 **Local Storage**。

![](https://img.072899.xyz/2025/10/6ce689a58a74037594e31f5d8e587af7.png)

點選右上角的 **Upload**，選擇剛才準備好的 `config.yaml` 檔案並上傳

![](https://img.072899.xyz/2025/10/d550a6d94c9a5f02852e2f12091ff2a0.png)

上傳完成後，點選 **Restart** 重新啟動容器。

![](https://img.072899.xyz/2025/10/e4e4e077371cff0f77d097ccf9b07da6.png)

稍等片刻，待容器狀態再次變為 **Active** 後，我們可以看到 **Local Storage** 中已產生了新的檔案

![](https://img.072899.xyz/2025/10/877144ceae6bdc3acc180f18e309c9ef.png)

點選 **Logs** 標籤頁，確認記錄內容如下圖所示。

![](https://img.072899.xyz/2025/10/5da47dbaaace9befc61d18ffcca5298a.png)

![](https://img.072899.xyz/2025/10/af2ed8594a0626ca24dcf3427ff2e103.png)

至此，`CLIProxyAPI` 便成功完成了整個部署流程。

------

## 使用 EasyCLI 進行遠端 OAuth 身分驗證

接下來，我們使用官方的另一個專案 [EasyCLI](https://github.com/router-for-me/EasyCLI) 來進行遠端 OAuth 新增。

`EasyCLI` 是 `CLIProxyAPI` 的搭配專案，提供圖形使用者介面（GUI）來管理 `CLIProxyAPI`。它支援完整的 OAuth 身分驗證與授權流程，包括授權回呼，而不只上傳授權檔案；內建 WebUI 不提供這項遠端回呼功能。

請前往 [EasyCLI 程式釋出頁面](https://github.com/router-for-me/EasyCLI/releases) 下載適合你作業系統的版本（作者提供了 Mac、Linux、Windows 版本）。本教學以 Windows x64 版本為例。

開啟程式後選擇 **Remote**，並輸入先前記下的網址。

![](https://img.072899.xyz/2025/10/f1d6dce519e20cae93abaac261f4d269.png)

密碼輸入 `config.yaml` 中設定的 `remote-management.secret-key`（本例中是 `ABCD-1234`）

依序點選 **Authentication Files** -> **New**

![](https://img.072899.xyz/2025/10/00cbb95dfeab2b8047b8270292fbe2cc.png)

選擇需要進行身分驗證的供應商，填寫必填欄位，然後點選 **Confirm**。

![](https://img.072899.xyz/2025/10/994a104817d51e39f811ad190d6190d5.png)

頁面中會出現 OAuth 連結，點選 **Open Link**

![](https://img.072899.xyz/2025/10/361f9b6568609e589c959ca572de8955.png)

程式會自動開啟瀏覽器並前往 OAuth 連結，同時 `EasyCLI` 會進入等待回呼的狀態。

![](https://img.072899.xyz/2025/10/a10dab06835d7bc5d15af8cc1ca607ed.png)

在瀏覽器頁面登入帳號，並完成授權與身分驗證流程。

![](https://img.072899.xyz/2025/10/d1dc0fe737eb8b0ce9f348f2f45871f1.png)

完成後，**Authentication Files** 清單中會出現新產生的憑證檔案。

![](https://img.072899.xyz/2025/10/d713a77479b41f4035f1bf66b2e538f6.png)

**驗證**

我們再用 Cherry Studio 測試一下。如圖所示，根據設定檔內容填寫 API 金鑰和 API 位址

![](https://img.072899.xyz/2025/10/8021ac702f232ded423b186dbcb50a90.png)

若能取得回應，即表示設定完成。

![](https://img.072899.xyz/2025/10/5d0684f8cfecb1bc503f5189822911a3.png)

除了 OAuth 身分驗證外，`EasyCLI` 的其他功能與系統內建 WebUI 大致相同。也可開啟 `https://你的CLIProxyAPI存取連結/management.html` 管理其他設定；WebUI 操作方式請參考《教學 6：Web GUI 入門》。
