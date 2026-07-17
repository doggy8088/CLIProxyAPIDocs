# Gemini API 設定

使用 `gemini-api-key` 參數設定 Gemini API 金鑰。每個項目皆可選擇設定 `base-url`、`headers` 與 `proxy-url`。`headers` 只會附加至送往覆寫後 Gemini 端點的請求，絕不會轉送至代理伺服器。為維持回溯相容性，舊版 `generative-language-api-key` 管理介面仍提供只含金鑰的鏡像檢視；透過該介面寫入會更新整份 Gemini 清單，但會捨棄每把金鑰的覆寫設定，而且舊欄位不再儲存於 `config.yaml`。
