# 零成本部署：Railway（物件儲存空間）

CLIProxyAPI 支援 S3 儲存貯體後，可將 Railway 容器服務與 ClawCloud S3 儲存空間搭配使用。本篇說明這項部署方式。

開始前，請先準備 [ClawCloud](https://run.claw.cloud/) 與 [Railway](https://railway.com/) 帳號。

### 一、建立 ClawCloud 儲存貯體

登入 ClawCloud 後，點選進入 **Object Storage**

![](https://img.072899.xyz/2025/10/8350104852042e43ba4c3dad25fd0004.png)

接著，點選 **Create bucket**

![](https://img.072899.xyz/2025/10/9f5953f5a406a21d2ff914cfa01638c9.png)

輸入自訂的儲存貯體名稱（必須使用小寫），然後點選右上角的 **Create**。

![](https://img.072899.xyz/2025/10/39db7fd3e8ca4a57c46191be889e0f15.png)

建立後，請記錄四項參數：儲存貯體完整名稱（圖中紅框所示）、Access Key、Secret Key 與 External 位址。

![](https://img.072899.xyz/2025/10/ef6c22c9cc50eee9152e4c95454786dd.png)

![](https://img.072899.xyz/2025/10/a3931df797a65db7afecf18cb66e66ce.png)

這 4 個參數將分別用於設定環境變數。此外，我們還需額外設定一個 `MANAGEMENT_PASSWORD`（用於登入 WebUI 的密碼）。請將這些資訊整理為以下格式並妥善儲存：

```dotenv
OBJECTSTORE_ENDPOINT=External值
OBJECTSTORE_ACCESS_KEY=Access Key值
OBJECTSTORE_SECRET_KEY=Secret Key值
OBJECTSTORE_BUCKET=儲存貯體完整名稱
MANAGEMENT_PASSWORD=存取WebUI的密碼
```

### 二、Railway 手動部署

在 Railway 的專案儀表盤中，點選 **Create**，選擇 **Docker image**

![](https://img.072899.xyz/2025/10/f9dfb05a9991e5a228fa18629168588c.png)

輸入 `eceasy/cli-proxy-api:latest` 後按 Enter。稍候，工作區中會出現新的容器。

![](https://img.072899.xyz/2025/10/dec39863e684dd39f63acd1ebbe401e9.png)

點選新建立的容器，並在右側面板選擇 **Variables** → **Raw Editor**。

![](https://img.072899.xyz/2025/10/d3d5d5b5144d2016ff4d8ddf8953a819.png)

將我們先前準備好的環境變數貼上進去，然後點選 **Update Variables**

![](https://img.072899.xyz/2025/10/accaf8ea92a57371cf1d1994be59cd9f.png)

點選 **Deploy** 按鈕開始部署

![](https://img.072899.xyz/2025/10/6889a73eb138f8e1dca7ab0fb4b79b21.png)

等待畫面出現 `Deployment successful` 後，開啟 **Settings** 分頁。

![](https://img.072899.xyz/2025/10/a1059beca1671b505b4909c36ae51f68.png)

在 **Public Networking** 部分，點選 **Generate Domain**

![](https://img.072899.xyz/2025/10/e3d3efbcc34db844c81ee1eefda48e22.png)

將連接埠設定為 `8317`，然後點選 **Generate Domain**

![](https://img.072899.xyz/2025/10/6ddb5ee7884c2c239b02edca10ca2668.png)

Railway 會產生公開存取位址。若可透過該位址開啟 CLIProxyAPI WebUI，即表示部署完成。

![](https://img.072899.xyz/2025/10/d216af36328e62147889108799278561.png)

### 三、Railway 模板部署

Railway 也支援透過範本部署。可點選下方按鈕開始；請注意，此連結包含推薦碼。

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/0uGPyR?referralCode=JC4tEx&utm_medium=integration&utm_source=template&utm_campaign=generic)

使用範本部署後，請確認服務連接埠是否為 `8317`；若不是，請依下圖手動修改。

![](https://img.072899.xyz/2025/10/e741f1f62e4726a16e75b1264ad4438e.png)

![](https://img.072899.xyz/2025/10/ba2c7d7bac37b3bcdd3aebb220c6fb0b.png)

![](https://img.072899.xyz/2025/10/39b49aea18026f80834bf0ee22d405a3.png)

至此，全部部署流程均已完成。後續使用方法可參照《零成本部署（ClawCloud）》教學中的 **「使用 EasyCLI 進行遠端 OAuth 身分驗證」** 部分。

**補充說明：** 除了 ClawCloud，也可改用其他相容 S3 API 的物件儲存服務，例如 Cloudflare R2。
