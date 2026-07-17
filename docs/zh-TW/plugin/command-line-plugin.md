---
outline: 'deep'
---

# 命令列擴充功能

命令列擴充功能允許外掛向 CLIProxyAPI 註冊自己的命令列參數，並在這些參數觸發時執行外掛邏輯。

## 功能欄位

```json
{
  "capabilities": {
    "command_line_plugin": true
  }
}
```

原始碼參考：

- `sdk/pluginapi/types.go`：`CommandLinePlugin`、`CommandLineFlag`、`CommandLineExecutionRequest`、`CommandLineExecutionResponse`
- `sdk/pluginabi/types.go`：`command_line.register`、`command_line.execute`
- `internal/pluginhost/command_line.go`：命令列外掛註冊和執行

範例參考：

- `examples/plugin/cli/go/main.go`
- `examples/plugin/simple/go/main.go`：`MethodCommandLineRegister`、`MethodCommandLineExecute`

## 方法

| 方法 | 作用 |
| --- | --- |
| `command_line.register` | 宣告外掛擁有的命令列 flag。 |
| `command_line.execute` | 當外掛 flag 觸發時執行外掛命令。 |

## 註冊 flag

```json
{
  "Flags": [
    {
      "Name": "plugin-example-command",
      "Usage": "Run the example C ABI plugin command",
      "Type": "bool",
      "DefaultValue": "false"
    }
  ]
}
```

支援的 `Type`：

- `bool`
- `string`
- `int`
- `int64`
- `float64`
- `duration`

## 執行請求

```json
{
  "Program": "cli-proxy-api",
  "Args": ["--plugin-example-command"],
  "ConfigPath": "config.yaml",
  "Host": {},
  "Flags": {
    "plugin-example-command": {
      "Name": "plugin-example-command",
      "Type": "bool",
      "Value": "true",
      "Set": true
    }
  },
  "TriggeredFlags": {}
}
```

## 執行回應

```json
{
  "Stdout": "base64-stdout",
  "Stderr": "base64-stderr",
  "Auths": [],
  "ExitCode": 0
}
```

`Auths` 可傳回命令建立的憑證記錄，並由主機儲存。

## 開發注意

- flag 名應穩定且避免與主機已有參數衝突。
- 命令列外掛適合登入、匯入憑證或診斷命令，不適合長期執行任務。
- 傳回非零 `ExitCode` 會影響處理程序結束碼。
