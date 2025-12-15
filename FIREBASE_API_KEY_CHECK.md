# 🔑 Firebase API Key 檢查指南

## ❌ 錯誤：reCAPTCHA 成功但 `auth/invalid-app-credential`

如果 reCAPTCHA 驗證成功（有 token），但 Firebase 仍返回 `auth/invalid-app-credential`，可能是 API Key 限制問題。

## 🔍 檢查 API Key 限制

### 步驟 1: 檢查 Google Cloud Console

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇專案：`lunchips-8c124`
3. 左側選單 → **APIs & Services** → **Credentials**
4. 找到您的 API Key：`AIzaSyBuAQUU2xrp8pk418EkKkiQVlIHvkd5-TE`
5. 點擊 API Key 查看詳細資訊

### 步驟 2: 檢查 API Key 限制

在 API Key 詳細資訊頁面中：

**應用程式限制：**
- 如果設定了「HTTP 引用者（網站）」，確保包含：
  - `http://localhost:*`（允許所有端口）
  - `http://127.0.0.1:*`
  - 您的實際部署網域

**API 限制：**
- 確保以下 API 已啟用：
  - ✅ Identity Toolkit API
  - ✅ Firebase Authentication API

### 步驟 3: 啟用必要的 API

1. Google Cloud Console → **APIs & Services** → **Library**
2. 搜尋並啟用：
   - **Identity Toolkit API**（必需）
   - **Firebase Authentication API**（如果存在）

### 步驟 4: 檢查 API Key 設定建議

**對於開發環境，建議：**
- **應用程式限制**：選擇「HTTP 引用者（網站）」
- **網站限制**：添加
  - `http://localhost:*`
  - `http://127.0.0.1:*`
  - `http://localhost:8081`
  - `http://localhost:19006`

**對於生產環境：**
- 添加您的實際網域
- 例如：`https://lunchips.com/*`

## 🔧 快速修復步驟

### 方法 1: 暫時移除 API Key 限制（僅用於測試）

1. Google Cloud Console → APIs & Services → Credentials
2. 點擊您的 API Key
3. 在「應用程式限制」中選擇「無」
4. 在「API 限制」中選擇「無」
5. 點擊「儲存」
6. 等待幾分鐘讓設定生效
7. 重新測試

**⚠️ 注意：** 這僅用於測試，生產環境應該設定適當的限制。

### 方法 2: 正確設定 HTTP 引用者限制

1. Google Cloud Console → APIs & Services → Credentials
2. 點擊您的 API Key
3. 在「應用程式限制」中選擇「HTTP 引用者（網站）」
4. 在「網站限制」中添加：
   ```
   http://localhost:*
   http://127.0.0.1:*
   http://localhost:8081
   http://localhost:19006
   ```
5. 點擊「儲存」

### 方法 3: 檢查 Identity Toolkit API

1. Google Cloud Console → APIs & Services → Library
2. 搜尋「Identity Toolkit API」
3. 如果未啟用，點擊「啟用」
4. 等待 API 啟用完成

## 🧪 驗證設定

完成設定後：

1. **清除瀏覽器快取**
2. **等待 2-5 分鐘**讓設定生效
3. **重新載入應用程式**
4. **再次嘗試發送驗證碼**

## 📝 檢查清單

- [ ] Identity Toolkit API 已啟用
- [ ] API Key 沒有過度限制（或正確設定了 HTTP 引用者）
- [ ] `localhost` 在授權網域列表中
- [ ] Phone 登入方式已啟用
- [ ] 專案已升級到 Blaze 方案
- [ ] 等待設定生效（2-5 分鐘）

## 🔗 直接連結

- [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=lunchips-8c124)
- [Google Cloud Console - API Library](https://console.cloud.google.com/apis/library?project=lunchips-8c124)
- [Firebase Console - Authentication Settings](https://console.firebase.google.com/project/lunchips-8c124/authentication/settings)








