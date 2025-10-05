# Firebase 設定指南

## 📋 完成的事項

✅ **已安裝 Firebase SDK**
```bash
npm install firebase
```

✅ **已配置 Firebase Auth 服務**
- Google OAuth Provider
- Apple OAuth Provider
- Email/Password 認證

✅ **已實現登入功能**
- Google 登入（藍色按鈕）
- Apple 登入（黑色按鈕）
- Email/Password 登入

✅ **已更新 UI**
- Google 按鈕：藍色 (#4285F4)
- Apple 按鈕：黑色 (#000000)
- 白色文字圖標

✅ **已實現回調處理**
- 登入成功後保存 token 到 localStorage
- 保存用戶資料到 localStorage
- 重定向到主頁面

## 🔧 Firebase 專案設定

### 1. 創建 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「創建專案」
3. 輸入專案名稱（例如：poker-host-auth）
4. 啟用 Google Analytics（可選）
5. 點擊「創建專案」

### 2. 啟用 Authentication

1. 在 Firebase Console 中點擊「Authentication」
2. 點擊「開始使用」
3. 點擊「Sign-in method」選項卡
4. 啟用以下提供者：

#### Google 登入
1. 點擊「Google」
2. 啟用狀態：「啟用」
3. 支援的電子郵件：輸入您的域名或全域
4. 項目支援電子郵件：輸入您的電子郵件
5. 點擊「儲存」

#### Apple 登入
1. 點擊「Apple」（需要 Apple Developer Account）
2. 啟用狀態：「啟用」
3. 填入 Apple Service ID 和私鑰
4. 點擊「儲存」

#### Email/Password
1. 點擊「Email/Password」
2. 啟用「電子郵件/密碼」
3. 可選：啟用「電子郵件連結（密碼登入）」
4. 點擊「儲存」

### 3. 獲取配置資訊

1. 點擊「專案設定」（齒輪圖標）
2. 捲動到「您的應用程式」部分
3. 如需新增應用程式，點擊「</>」Web 圖標
4. 註冊應用程式名稱（例如：Poker Host Web）
5. 勾選「也設定 Firebase Hosting」（可選）
6. 點擊「註冊應用程式」
7. 複製 Firebase SDK 配置

### 4. 更新配置檔案

打開 `src/config/firebase.ts` 並替換配置：

```typescript
const firebaseConfig = {
  apiKey: "您從Firebase獲得的apiKey",
  authDomain: "您的專案.firebaseapp.com",
  projectId: "您的專案ID",
  storageBucket: "您的專案.appspot.com",
  messagingSenderId: "您的senderId",
  appId: "您的appId"
};
```

## 🧪 測試功能

### 測試清單

- [ ] **Google 登入測試**
  - 點擊藍色「Log in with Google」按鈕
  - 確認會彈出 Google 登入視窗
  - 登入成功後應導向主頁面
  - token 應保存到 localStorage

- [ ] **Apple 登入測試**
  - 點擊黑色「Log in with Apple」按鈕
  - 確認會彈出 Apple 登入視窗
  - 登入成功後應導向主頁面
  - token 應保存到 localStorage

- [ ] **Email 登入測試**
  - 輸入有效的電子郵件和密碼
  - 點擊「Log in」按鈕
  - 登入成功後應導向主頁面

- [ ] **註冊頁面測試**
  - 點擊「Sign up for free!」連結
  - 測試註冊功能
  - 測試所有社交登入按鈕

## 🔍 調試提示

### localStorage 檢查
```javascript
// 在瀏覽器控制台中檢查保存的資料
console.log('Auth Token:', localStorage.getItem('authToken'));
console.log('User Profile:', localStorage.getItem('userProfile'));
```

### Firebase Auth 狀態
```javascript
// 檢查當前的 Firebase Auth 狀態
import { auth } from './src/config/firebase';
console.log('Current User:', auth.currentUser);
```

## ⚠️ 注意事項

1. **Apple 登入限制**
   - 需要 Apple Developer Account
   - 需要在 Apple Developer Portal 設定
   - 僅支援 Safari 瀏覽器和移動 Safari

2. **域名限制**
   - Firebase Auth 有授權域限制
   - 確保在 Firebase Console 中添加您的域名

3. **本地開發**
   - localhost 預設已授權
   - 如需其他端口，需在 Firebase Console 添加

## 🚀 生產環境部署

生產部署前請確認：

1. **更新 Firebase 授權域**
   - 在 Firebase Console → Authentication → Settings → 授權域
   - 添加您的生產域名

2. **環境變數**
   ```bash
   # 建議將配置移到環境變數
   export REACT_APP_FIREBASE_API_KEY="your-api-key"
   export REACT_APP_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   ```

3. **安全規則**
   - 設定適當的 Firestore 安全規則
   - 限制用戶對其個人資料的存取

完成設定後，您的應用程式將具備完整的 Firebase Authentication 功能！
