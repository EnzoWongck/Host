# 🔧 Firebase 應用程式憑證錯誤修復指南

## 📋 錯誤說明

當您看到「應用程式憑證錯誤」時，通常是 Firebase 配置問題。以下是詳細的修復步驟。

## ✅ 修復步驟

### 步驟 1: 檢查並添加授權網域

1. **前往 Firebase Console**
   - 訪問：https://console.firebase.google.com/
   - 選擇專案：`lunchips-8c124`

2. **進入 Authentication 設定**
   - 點擊左側選單的「Authentication」
   - 點擊「Settings」（設定）標籤
   - 捲動到「Authorized domains」（授權網域）部分

3. **添加 localhost**
   - 點擊「Add domain」（添加網域）
   - 輸入：`localhost`
   - 點擊「Add」（添加）
   - 如果使用特定端口，也添加：`localhost:8081`、`localhost:3000` 等

4. **確認已添加的網域**
   - 應該看到以下網域：
     - `localhost`
     - `lunchips-8c124.firebaseapp.com`
     - `lunchips.com`（如果已部署）

### 步驟 2: 檢查 Google Cloud Console API Key 設定

1. **前往 Google Cloud Console**
   - 訪問：https://console.cloud.google.com/
   - 選擇專案：`lunchips-8c124`

2. **進入 API 和服務 > 憑證**
   - 點擊左側選單「API 和服務」>「憑證」
   - 找到 **Firebase Web API Key**（在 Firebase 專案設定「一般」頁面顯示的那一串）
   - 點擊該 API Key 進行編輯

3. **檢查「應用程式限制」**
   - 如果設定了「HTTP 引用者（網站）」，**必須**包含以下所有網域：
     - `http://localhost:*`（本地開發）
     - `http://localhost:8081/*`（本地開發 - Expo 預設端口）
     - `http://localhost:3000/*`（本地開發 - 其他端口）
     - `https://lunchips.com/*`（**生產環境 - 必須添加**）
     - `https://*.lunchips.com/*`（**生產環境 - 子網域支援**）
     - `https://lunchips-gdphutige-enzos-projects-c5fe6943.vercel.app/*`（Vercel 部署網域）

4. **檢查「API 限制」**
   - 確保已啟用以下 API：
     - Identity Toolkit API
     - Firebase Authentication API

### 步驟 3: 啟用 Identity Toolkit API

1. **前往 API 庫**
   - 在 Google Cloud Console 中，點擊「API 和服務」>「程式庫」

2. **搜尋並啟用 API**
   - 搜尋「Identity Toolkit API」
   - 點擊進入
   - 如果未啟用，點擊「啟用」按鈕

3. **確認啟用狀態**
   - 應該看到「已啟用」狀態

### 步驟 4: 檢查 Firebase Authentication 設定

1. **返回 Firebase Console**
   - 前往：Authentication > Sign-in method

2. **確認登入方法已啟用**
   - ✅ Email/Password：已啟用
   - ✅ Google：已啟用（如果需要）
   - ✅ Apple：已啟用（如果需要）

3. **檢查專案設定**
   - 點擊左側選單的「專案設定」（齒輪圖標）
   - 確認「您的應用程式」部分顯示正確的 Web 應用程式

### 步驟 5: 等待設定生效

- Firebase 設定變更通常需要 **2-5 分鐘** 才能生效
- 完成上述步驟後，等待幾分鐘
- 然後重新整理瀏覽器頁面

### 步驟 6: 清除瀏覽器快取

如果問題仍然存在：

1. **清除瀏覽器快取**
   - Chrome/Edge: `Ctrl+Shift+Delete`（Windows）或 `Cmd+Shift+Delete`（Mac）
   - 選擇「快取的圖片和檔案」
   - 點擊「清除資料」

2. **硬性重新整理**
   - Windows: `Ctrl+F5`
   - Mac: `Cmd+Shift+R`

## 🔍 驗證修復

### 檢查授權網域

在瀏覽器控制台運行：

```javascript
// 檢查當前網域
console.log('Current domain:', window.location.hostname);
console.log('Current origin:', window.location.origin);
```

### 測試 Firebase 連線

在瀏覽器控制台運行：

```javascript
// 測試 Firebase 初始化
import { auth } from './src/config/firebase';
console.log('Firebase Auth:', auth);
console.log('Auth Domain:', auth.config.authDomain);
```

## ⚠️ 常見問題

### 問題 1: 仍然看到憑證錯誤

**解決方案：**
- 確認已等待 2-5 分鐘讓設定生效
- 檢查瀏覽器控制台是否有其他錯誤
- 確認 API Key 沒有被限制到特定網域

### 問題 2: localhost 已添加但仍無法使用

**解決方案：**
- 確認添加的是 `localhost`（不是 `http://localhost`）
- 如果使用特定端口，也添加 `localhost:8081` 等
- 檢查是否有防火牆或代理阻擋

### 問題 3: 生產環境（lunchips.com）無法使用

**解決方案：**
- 在 Firebase Console 中添加 `lunchips.com`
- 在 Google Cloud Console 的 API Key 限制中添加 `https://lunchips.com/*`
- 確認已啟用 Identity Toolkit API

## 📞 需要幫助？

如果完成上述步驟後問題仍然存在，請檢查：

1. Firebase Console 中的錯誤日誌
2. Google Cloud Console 中的 API 使用情況
3. 瀏覽器控制台的詳細錯誤訊息

## 🔗 相關連結

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase 文件 - 授權網域](https://firebase.google.com/docs/auth/web/domain-restriction)

