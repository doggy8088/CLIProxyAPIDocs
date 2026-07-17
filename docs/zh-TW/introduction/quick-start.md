# 快速開始

## macOS

```bash
brew install cliproxyapi
brew services start cliproxyapi
```

> 使用 Homebrew 安裝並透過 `brew services` 執行時，預設設定檔路徑是 `$(brew --prefix)/etc/cliproxyapi.conf`（Apple Silicon 常見為 `/opt/homebrew/etc/cliproxyapi.conf`，Intel 常見為 `/usr/local/etc/cliproxyapi.conf`）。
> 如果你希望繼續使用 `~/.cli-proxy-api/config.yaml` 作為主要設定檔，可將預設路徑建立為該檔案的符號連結：
>
> ```bash
> brew services stop cliproxyapi
> mv "$(brew --prefix)/etc/cliproxyapi.conf" "$(brew --prefix)/etc/cliproxyapi.conf.bak"
> ln -s ~/.cli-proxy-api/config.yaml "$(brew --prefix)/etc/cliproxyapi.conf"
> brew services start cliproxyapi
> ```

## Linux

### 一鍵安裝指令碼

```bash
curl -fsSL https://raw.githubusercontent.com/router-for-me/cliproxyapi-installer/refs/heads/master/cliproxyapi-installer | bash
```

感謝 [brokechubb](https://github.com/brokechubb) 開發的 Linux 安裝器！

### Arch Linux (AUR)

如果你是 Arch Linux 使用者，可以直接從 AUR 安裝：

```bash
# 使用 yay
yay -S cli-proxy-api-bin

# 使用 paru
paru -S cli-proxy-api-bin
```

安裝完成後，你可以透過 systemd 管理服務：

```bash
# 啟動服務
systemctl --user start cli-proxy-api

# 設定開機自動啟動
systemctl --user enable cli-proxy-api
```

> **注意：**
> 服務啟動前需要設定檔。你可以透過複製範例設定檔來建立它：
>
> ```bash
> mkdir -p ~/.cli-proxy-api
> cp /usr/share/doc/cli-proxy-api-bin/config.example.yaml ~/.cli-proxy-api/config.yaml
> ```

## Windows

你可以在 [這裡](https://github.com/router-for-me/CLIProxyAPI/releases) 下載最新版本並直接執行。

或者，你也可以在 [EasyCLI 版本發布頁面](https://github.com/router-for-me/EasyCLI/releases) 下載桌面 GUI 並直接執行。

## Docker

請將外掛目錄掛載到 `/CLIProxyAPI/plugins`，否則透過外掛商店安裝的外掛在容器重啟後會丟失。

```bash
docker run --rm -p 8317:8317 -v /path/to/your/config.yaml:/CLIProxyAPI/config.yaml -v /path/to/your/auth-dir:/root/.cli-proxy-api -v /path/to/your/plugins-dir:/CLIProxyAPI/plugins eceasy/cli-proxy-api:latest
```

## 從原始碼建置

1. 複製儲存庫：

   ```bash
   git clone https://github.com/router-for-me/CLIProxyAPI.git
   cd CLIProxyAPI
   ```

2. 建置程式：

   Linux、macOS：

   ```bash
   go build -o cli-proxy-api ./cmd/server
   ```
   Windows：

   ```bash
   go build -o cli-proxy-api.exe ./cmd/server
   ```
