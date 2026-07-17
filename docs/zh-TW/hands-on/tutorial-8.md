# 零成本部署：Hugging Face（資料庫儲存空間）

先前的教學分別使用本機儲存卷（ClawCloud）、GitHub（Render）與物件儲存貯體（Railway）保存 CLIProxyAPI 設定及驗證資訊。本文改用 PostgreSQL 資料庫，並說明 Hugging Face Space 的容器部署流程。

本教學將以 Railway 提供的 PostgreSQL 服務為例，使用其他資料庫供應商的流程也大同小異，大家可自行探索。

### 一、準備 PostgreSQL 資料庫

先登入 Railway 帳號，在工作區建立執行個體，並選擇 **Database** → **Add PostgreSQL**。

![](https://img.072899.xyz/2025/10/dab21cb1671989f6781eed1eba03c985.png)

![](https://img.072899.xyz/2025/10/9580732f1e15d365db8a3dd07442b3fd.png)

等待執行個體建立完成後，點選進入資料庫管理頁面，點選 **Database** 分頁下的 **Connect**

![](https://img.072899.xyz/2025/10/f177a3cc1cb30146d9b16475179fd5f0.png)

請複製並儲存 **Public Network** 分頁下的 **Connection URL**，後續步驟將會用到

![](https://img.072899.xyz/2025/10/107a359a8a490b18a325779432a71582.png)

### 二、在 Hugging Face 上部署

開啟預先建立的 [CLIProxyAPI 專案範本](https://huggingface.co/spaces/hkfires/CLIProxyAPI)，然後從下拉式選單選擇 **Duplicate this Space** 複製專案。

![](https://img.072899.xyz/2025/10/0febf3a57ae4f8384dfff6d6e38614ce.png)

在設定頁面中，請按以下說明操作：
* 修改 **Space name**（如果這是你的第一個專案，則無需修改）
* 將 **Visibility** 設定為 **Public**，以確保服務部署後能夠遠端存取
* 在 `MANAGEMENT_PASSWORD` 中填入你計劃用於 WebUI 的管理密碼
* 在 `PGSTORE_DSN` 中貼上先前複製的資料庫連線 URL

全部資訊填寫完畢後，點選 **Duplicate Space**

> **補充說明：** `MANAGEMENT_STATIC_PATH` 與 `PGSTORE_LOCAL_PATH` 必須設為 `/tmp`，因為 Hugging Face 將容器根目錄設為唯讀。這兩個變數會把資料庫快取檔案與管理頁面靜態資源導向可寫入的 `/tmp` 目錄。

![](https://img.072899.xyz/2025/10/a4b88ee81e6eefd0721b301c9bc4f5e8.png)

稍等片刻，當你在記錄中看到類似下方的資訊時，即表示部署已順利完成

![](https://img.072899.xyz/2025/10/98550ed355e70b9776498558bd6c599a.png)

接著可透過 `https://<你的 Hugging Face 使用者名稱>-<專案名稱>.hf.space/management.html` 存取 WebUI。例如：`https://hkfires-cliproxyapi.hf.space/management.html`。請使用先前在環境變數中設定的管理密碼登入。

![](https://img.072899.xyz/2025/10/e8fa8144c51bfc6125a8cb218cf528dd.png)

至此，整個部署流程便已完成。關於後續的使用方法，你可以參考《零成本部署（ClawCloud）》教學中的 **「使用 EasyCLI 進行遠端 OAuth 身分驗證」** 部分。
