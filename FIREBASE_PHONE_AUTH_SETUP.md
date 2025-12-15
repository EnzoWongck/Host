# Firebase 電話號碼登入設定指南

## 📋 概述

您的專案已經實現了電話號碼登入功能，但需要在 Firebase Console 中完成以下設定才能正常使用。

## ✅ 已完成的代碼設定

您的代碼已經包含：
- ✅ `RecaptchaVerifier` 初始化
- ✅ 電話號碼登入功能 (`signInWithPhoneNumber`)
- ✅ 電話號碼綁定功能 (`linkWithPhoneNumber`)
- ✅ reCAPTCHA 容器元素 (`recaptcha-container`)

## 🔧 需要在 Firebase Console 中完成的設定

### 步驟 1: 啟用電話號碼登入

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案：`lunchips-8c124`
3. 在左側選單中，點擊 **Authentication**
4. 選擇 **Sign-in method** 標籤
5. 找到 **Phone** 登入方式
6. 點擊 **Phone** 並啟用它
7. 點擊 **Save** 儲存

### 步驟 2: 設定授權網域（重要！）

這是解決 "您必須先設定 Firebase 的 reCAPTCHA 驗證器" 錯誤的關鍵步驟：

**方法 1：在 Authentication 設定中（推薦）**

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案：`lunchips-8c124`
3. 在左側選單中，點擊 **Authentication**
4. 點擊 **Settings**（設定）標籤（不是 Sign-in method）
5. 向下滾動找到 **Authorized domains**（已授權網域）部分
6. 檢查以下網域是否在列表中：
   - `localhost`（開發環境）
   - `lunchips-8c124.firebaseapp.com`（Firebase Hosting）
   - `lunchips.com`（如果已設定自訂網域）
   - 您的實際部署網域

7. 如果缺少任何網域，點擊 **Add domain** 按鈕添加

**方法 2：在專案設定中**

如果方法 1 找不到，可以嘗試：

1. 點擊 Firebase Console 左上角的 **⚙️ 專案設定**（齒輪圖標）
2. 選擇 **General**（一般）標籤
3. 向下滾動找到 **Your apps**（您的應用程式）部分
4. 找到您的 Web 應用程式
5. 點擊應用程式旁邊的 **⋮**（三個點）選單
6. 選擇 **Authorized domains** 或查看應用程式詳細資訊

**方法 3：直接 URL 訪問**

您也可以直接訪問以下 URL（替換 `YOUR_PROJECT_ID` 為 `lunchips-8c124`）：
```
https://console.firebase.google.com/project/lunchips-8c124/authentication/settings
```

**注意：**
- `localhost` 通常會自動添加，但請確認它在列表中
- 如果使用自訂網域，必須手動添加
- 授權網域的設定可能需要幾分鐘才會生效

### 步驟 3: 啟用計費功能（生產環境必需）

電話驗證需要 Firebase Blaze 方案（付費方案）：

1. 前往 Firebase Console
2. 點擊左側選單的 **Usage and billing**
3. 升級到 **Blaze** 方案（按使用量付費）
4. 注意：Firebase 提供免費額度，小規模使用可能不會產生費用

### 步驟 4: 測試電話驗證

在開發階段，您可以：

1. 使用測試電話號碼（如果已設定）
2. 或使用真實電話號碼進行測試
3. 確保在 `localhost` 環境下測試時，`localhost` 已在授權網域列表中

## 🐛 常見錯誤及解決方法

### 錯誤 1: "您必須先設定 Firebase 的 reCAPTCHA 驗證器"

**原因：** 授權網域未設定或當前網域不在授權列表中

**解決方法：**
1. 檢查 Firebase Console > Authentication > Sign-in method > Authorized domains
2. 確保 `localhost` 和您的實際網域都在列表中
3. 清除瀏覽器快取並重新載入頁面

### 錯誤 2: "auth/billing-not-enabled"

**原因：** Firebase 專案未啟用計費功能

**解決方法：**
1. 升級到 Blaze 方案
2. 或使用開發階段的「跳過驗證」選項（僅限測試）

### 錯誤 3: "auth/captcha-check-failed"

**原因：** reCAPTCHA 驗證失敗

**解決方法：**
1. 檢查網路連接
2. 確認授權網域設定正確
3. 清除瀏覽器快取
4. 嘗試使用不同的瀏覽器

## 📱 使用方式

### 電話號碼登入

1. 在登入頁面點擊「使用電話號碼登入」
2. 輸入電話號碼（含國碼，例如：+852 9123 4567）
3. 點擊「發送驗證碼」
4. 輸入收到的 6 位數驗證碼
5. 完成登入

### Google/Email 登入後綁定電話

1. 使用 Google 或 Email 登入
2. 系統會自動檢查是否已綁定電話號碼
3. 如果沒有，會進入電話驗證畫面
4. 完成電話驗證後才能使用所有功能

## 🔒 防濫用機制

- ✅ 每個電話號碼只能綁定一個帳戶
- ✅ Google/Email 登入後必須驗證電話號碼
- ✅ reCAPTCHA 防止機器人註冊
- ✅ Firebase 自動檢查電話號碼唯一性

## 📚 相關資源

- [Firebase 電話驗證文檔](https://firebase.google.com/docs/auth/web/phone-auth)
- [reCAPTCHA 設定指南](https://firebase.google.com/docs/auth/web/phone-auth#set-up-recaptcha-verifier)
- [授權網域設定](https://firebase.google.com/docs/auth/web/phone-auth#authorized-domains)

## ✅ 檢查清單

完成以下設定後，您的專案就可以使用電話號碼登入了：

- [ ] 在 Firebase Console 中啟用 Phone 登入方式
- [ ] 設定授權網域（包括 `localhost`）
- [ ] 升級到 Blaze 方案（生產環境）
- [ ] 測試電話驗證功能

完成這些設定後，重新載入應用程式，電話號碼登入功能應該就可以正常使用了！

