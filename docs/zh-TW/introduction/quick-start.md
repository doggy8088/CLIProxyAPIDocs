# 快速開始

## macOS

```bash
brew install cliproxyapi
brew services start cliproxyapi
```

> 使用 Homebrew 安裝並透過 `brew services` 執行時，預設設定檔路徑是 `$(brew --prefix)/etc/cliproxyapi.conf`（Apple Silicon 常見為 `/opt/homebrew/etc/cliproxyapi.conf`，Intel 常見為 `/usr/local/etc/cliproxyapi.conf`）。
> 如果你希望繼續使用 `~/.cli-proxy-api/config.yaml` 作為主要設定檔，請將 Homebrew 路徑設為**指向**該檔案的符號連結。符號連結的目標在啟動服務前**必須存在**（懸空的符號連結會讓服務立即結束）：
> ```bash
> brew_conf="$(brew --prefix)/etc/cliproxyapi.conf"
> home_conf="$HOME/.cli-proxy-api/config.yaml"
>
> brew services stop cliproxyapi
> mkdir -p "$HOME/.cli-proxy-api"
>
> # 只複製並備份一般檔案；符號連結保持不動。
> # 加上時間戳的備份可避免覆寫既有的 .bak。
> if [ -f "$brew_conf" ] && [ ! -L "$brew_conf" ]; then
>   if [ -f "$home_conf" ] || cp "$brew_conf" "$home_conf"; then
>     mv "$brew_conf" "${brew_conf}.bak.$(date +%Y%m%d-%H%M%S)"
>   fi
> fi
>
> # 只有在 Homebrew 路徑安全地指向既有設定檔後才啟動。
> if [ ! -f "$home_conf" ]; then
>   echo "在 $home_conf 找不到設定檔；服務未啟動。" >&2
> elif [ -e "$brew_conf" ] && [ ! -L "$brew_conf" ]; then
>   echo "無法安全地取代 $brew_conf；服務未啟動。" >&2
> elif ln -sfn "$home_conf" "$brew_conf"; then
>   brew services start cliproxyapi
> else
>   echo "無法建立設定檔符號連結；服務未啟動。" >&2
> fi
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
