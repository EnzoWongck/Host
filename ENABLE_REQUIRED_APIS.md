# 🔧 啟用 Firebase 電話驗證所需的 API

## 📋 必需的 API

Firebase 電話驗證需要以下 API 已啟用：

1. **Identity Toolkit API**（必需）
2. **Firebase Authentication API**（可能不存在或已整合）

## 🔍 檢查和啟用步驟

### 步驟 1: 檢查 Identity Toolkit API

1. 前往 [Google Cloud Console - API Library](https://console.cloud.google.com/apis/library?project=lunchips-8c124)
2. 在搜尋框中輸入：`Identity Toolkit API`
3. 點擊搜尋結果
4. 如果顯示「啟用」按鈕，點擊它
5. 如果顯示「已啟用」，表示已經啟用

### 步驟 2: 搜尋相關 API

在 API Library 中搜尋以下關鍵字，確保相關 API 已啟用：

- `Identity Toolkit API`（必需）
- `Firebase Authentication`（可能不存在，因為它可能已整合到 Identity Toolkit）
- `Firebase`（查看所有 Firebase 相關 API）

### 步驟 3: 直接啟用 Identity Toolkit API

**直接連結：**
```
https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=lunchips-8c124
```

1. 訪問上面的連結
2. 如果看到「啟用」按鈕，點擊它
3. 等待 API 啟用完成（通常幾秒鐘）

### 步驟 4: 檢查 API 是否在 API Key 限制中

1. 前往 [Credentials](https://console.cloud.google.com/apis/credentials?project=lunchips-8c124)
2. 點擊您的 API Key
3. 在「API 限制」部分：
   - 如果使用「限制金鑰」，確保 **Identity Toolkit API** 在列表中
   - 如果沒有，點擊「編輯」→「新增 API」→ 搜尋「Identity Toolkit API」→ 選擇並儲存
   - 或者暫時選擇「無」進行測試

## 🎯 快速修復步驟

### 方法 1: 啟用 Identity Toolkit API（推薦）

1. **直接訪問：**
   ```
   https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=lunchips-8c124
   ```

2. **點擊「啟用」按鈕**

3. **等待啟用完成**（通常幾秒鐘）

4. **檢查 API Key 限制：**
   - 前往 [Credentials](https://console.cloud.google.com/apis/credentials?project=lunchips-8c124)
   - 點擊您的 API Key
   - 在「API 限制」中，確保 Identity Toolkit API 在列表中，或選擇「無」

5. **等待 2-5 分鐘讓設定生效**

6. **清除瀏覽器快取並重新測試**

### 方法 2: 暫時移除 API 限制

1. 前往 [Credentials](https://console.cloud.google.com/apis/credentials?project=lunchips-8c124)
2. 點擊您的 API Key
3. 在「API 限制」中選擇「無」
4. 點擊「儲存」
5. 等待設定生效後重新測試

## 📝 檢查清單

完成以下檢查：

- [ ] Identity Toolkit API 已啟用
- [ ] API Key 的「API 限制」包含 Identity Toolkit API，或設為「無」
- [ ] API Key 的「應用程式限制」設為「無」或包含 localhost
- [ ] 等待 2-5 分鐘讓設定生效
- [ ] 清除瀏覽器快取
- [ ] 重新測試電話驗證

## 🔗 直接連結

- [啟用 Identity Toolkit API](https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=lunchips-8c124)
- [查看所有已啟用的 API](https://console.cloud.google.com/apis/dashboard?project=lunchips-8c124)
- [API Key 設定](https://console.cloud.google.com/apis/credentials?project=lunchips-8c124)

## ⚠️ 注意事項

- **Firebase Authentication API** 可能不存在作為獨立的 API，因為它已整合到 **Identity Toolkit API** 中
- 只需要啟用 **Identity Toolkit API** 即可
- API 啟用通常需要幾秒鐘
- 設定更改可能需要 2-5 分鐘才能完全生效

## 🧪 驗證 API 已啟用

1. 前往 [APIs & Services - Enabled APIs](https://console.cloud.google.com/apis/dashboard?project=lunchips-8c124)
2. 在搜尋框中輸入 `Identity Toolkit`
3. 確認它顯示在列表中，狀態為「已啟用」

完成這些步驟後，電話驗證功能應該可以正常工作了！









