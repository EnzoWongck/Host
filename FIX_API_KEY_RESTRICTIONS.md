# 🔧 修復 API Key 限制設定

## 📸 根據您的截圖

我看到您的 API Key "Browser key (auto created by Firebase)" 顯示「24 個 API」限制。

## 🔍 檢查步驟

### 步驟 1: 查看 API Key 詳細資訊

1. 在截圖中，點擊 **"Browser key (auto created by Firebase)"**（藍色連結）
2. 或點擊右側的 **"顯示金鑰"** 按鈕

### 步驟 2: 檢查應用程式限制

在 API Key 詳細頁面中，找到 **"應用程式限制"** 部分：

**選項 A：暫時移除限制（用於測試）**
- 選擇 **"無"**
- 點擊 **"儲存"**
- 等待 2-5 分鐘
- 重新測試

**選項 B：正確設定 HTTP 引用者限制**
- 選擇 **"HTTP 引用者（網站）"**
- 在「網站限制」中添加：
  ```
  http://localhost:*
  http://127.0.0.1:*
  http://localhost:8081
  http://localhost:19006
  ```
- 點擊 **"儲存"**

### 步驟 3: 檢查 API 限制

在 API Key 詳細頁面中，找到 **"API 限制"** 部分：

**確保包含以下 API：**
- ✅ Identity Toolkit API（必需）
- ✅ Firebase Authentication API（如果存在）

**如果使用「限制金鑰」：**
- 確保 Identity Toolkit API 在允許列表中
- 如果沒有，點擊「編輯」添加它

**如果使用「無」：**
- 這應該可以工作，但建議設定適當的限制以提高安全性

## 🎯 快速修復（推薦用於測試）

1. 點擊 **"Browser key (auto created by Firebase)"**
2. 在「應用程式限制」中選擇 **"無"**
3. 在「API 限制」中選擇 **"無"** 或確保包含 Identity Toolkit API
4. 點擊 **"儲存"**
5. 等待 2-5 分鐘讓設定生效
6. 清除瀏覽器快取
7. 重新測試電話驗證

## ⚠️ 注意事項

- 移除限制僅用於測試
- 生產環境應該設定適當的限制以提高安全性
- 設定更改可能需要幾分鐘才能生效

## 🔗 直接連結

- [API Key 詳細頁面](https://console.cloud.google.com/apis/credentials?project=lunchips-8c124)
- [Identity Toolkit API](https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=lunchips-8c124)








