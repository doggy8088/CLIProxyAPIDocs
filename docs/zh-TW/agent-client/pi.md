# PI Agent

啟動 CLIProxyAPI 伺服器，然後執行以下命令，安裝官方 PI 供應商外掛。

```bash
pi install npm:@router-for-me/pi-cliproxyapi-provider
```

然後進入 PI，執行 `/login CLIProxyAPI`，並提供 Base URL 與 API 金鑰以登入。

最後，在 PI 中執行 `/settings`，開啟設定，將 `Transport` 設為 `websocket-cached`。
