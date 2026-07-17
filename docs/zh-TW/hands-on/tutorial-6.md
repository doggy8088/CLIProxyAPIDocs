# 教學 6：Web GUI 入門

先前文章已介紹如何透過命令列執行 CLIProxyAPI。CLIProxyAPI 另有兩個搭配使用的專案：EasyCLI 與 WebUI。

* **EasyCLI 儲存庫位址**：`https://github.com/router-for-me/EasyCLI`
* **WebUI 儲存庫位址**：`https://github.com/router-for-me/Cli-Proxy-API-Management-Center`

這兩個專案提供圖形介面。EasyCLI 是桌面用戶端，WebUI 則是網頁管理介面；兩者都透過連線至 CLIProxyAPI 運作。

舊版需要使用者自行部署或安裝 GUI。自 `6.0.19` 版起，WebUI 已整合至主程式，可直接透過內建網頁介面調整設定。

本文將簡要介紹如何啟用並存取 WebUI。關於 EasyCLI 的使用方法，將在後續關於容器雲部署的文章中詳細介紹。

#### 一、啟用 WebUI

首先，我們需要在原有的基本設定上進行調整，新增遠端管理部分。完整的範例設定如下：

```yaml
port: 8317
auth-dir: "~/.cli-proxy-api"
request-retry: 3
quota-exceeded:
  switch-project: true
  switch-preview-model: true
api-keys:
- "ABC-123456"

# 本次新增的遠端管理部分
remote-management:
  allow-remote: true
  # 遠端管理金鑰，請與上方的 api-keys 區分
  secret-key: "MGT-123456"
  disable-control-panel: false
```

**注意：** 新版支援自動熱重新載入；舊版則需重新啟動程式，設定才會生效。

#### 二、存取 WebUI

程式啟動後，在瀏覽器開啟 `http://YOUR_SERVER_IP:8317/management.html`，並於管理金鑰欄位輸入先前設定的 `MGT-123456`，即可進入 WebUI。

![](https://img.072899.xyz/2025/10/37b12b67193ec67774e2f657e38eefc9.png)

#### 三、重要注意事項

WebUI 提供各項管理功能。請注意，WebUI 的 OAuth 身分驗證功能只支援在本機執行（例如 `localhost` 或 `127.0.0.1`）的 CLIProxyAPI 執行個體。受到 OAuth 服務供應商的安全政策限制，部署於遠端伺服器的執行個體無法直接透過 WebUI 完成身分驗證。
