# 🔍 Firebase 電話驗證診斷指南

## ❌ 錯誤：`auth/invalid-app-credential`

這個錯誤表示 Firebase 無法驗證您的應用程式憑證。以下是完整的診斷和解決步驟。

## 🔧 必須完成的 Firebase Console 設定

### 步驟 1: 啟用 Phone 登入方式（必需）

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案：`lunchips-8c124`
3. 左側選單 → **Authentication**
4. 點擊 **Sign-in method** 標籤
5. 找到 **Phone** 登入方式
6. 點擊 **Phone** → 啟用它
7. 點擊 **Save** 儲存

**⚠️ 如果沒有啟用 Phone，會出現 `auth/invalid-app-credential` 錯誤**

### 步驟 2: 設定授權網域（關鍵！）

**方法 A：直接 URL 訪問（最快）**

直接訪問這個 URL：
```
https://console.firebase.google.com/project/lunchips-8c124/authentication/settings
```

**方法 B：通過界面訪問**

1. Firebase Console → 選擇專案 `lunchips-8c124`
2. 左側選單 → **Authentication**
3. 點擊 **Settings** 標籤（不是 Sign-in method）
4. 向下滾動找到 **Authorized domains**（已授權網域）

**必須添加的網域：**

- ✅ `localhost` - **必須添加**（開發環境）
- ✅ `lunchips-8c124.firebaseapp.com` - Firebase Hosting 預設網域（通常自動添加）
- ✅ 您的實際部署網域（如果已設定）

**如何添加：**

1. 在 **Authorized domains** 區塊中
2. 點擊 **Add domain** 按鈕
3. 輸入 `localhost`
4. 點擊 **Add**

### 步驟 3: 升級到 Blaze 方案（生產環境必需）

電話驗證需要 Firebase Blaze 方案（付費方案）：

1. Firebase Console → 左側選單 → **Usage and billing**
2. 點擊 **Upgrade** 或 **Modify plan**
3. 選擇 **Blaze** 方案（按使用量付費）
4. 完成付款設定（即使有免費額度也需要設定付款方式）

**注意：**
- Firebase 提供免費額度，小規模使用可能不會產生費用
- 免費額度包括：每月 10,000 次電話驗證
- 超過免費額度後才需要付費

## 🧪 驗證設定是否正確

### 檢查清單

完成以下檢查，確保所有設定都正確：

- [ ] Phone 登入方式已啟用（Authentication > Sign-in method > Phone）
- [ ] `localhost` 已在授權網域列表中（Authentication > Settings > Authorized domains）
- [ ] 專案已升級到 Blaze 方案（Usage and billing）
- [ ] Firebase 專案 ID 正確：`lunchips-8c124`
- [ ] API Key 正確：`AIzaSyBuAQUU2xrp8pk418EkKkiQVlIHvkd5-TE`

### 測試步驟

1. **清除瀏覽器快取**
   - Chrome/Edge: Ctrl+Shift+Delete
   - 選擇「快取的圖片和檔案」
   - 清除快取

2. **重新載入應用程式**
   - 按 F5 或 Ctrl+R 重新載入
   - 或關閉瀏覽器標籤並重新打開

3. **檢查控制台**
   - 打開瀏覽器開發者工具（F12）
   - 查看 Console 標籤
   - 查看 Network 標籤中的請求

4. **嘗試發送驗證碼**
   - 輸入電話號碼（含國碼，例如：+852 9123 4567）
   - 點擊「發送驗證碼」
   - 觀察是否有錯誤

## 🐛 常見問題排查

### Q1: 找不到 Authorized domains 設定？

**解決方法：**
1. 確認您有專案的管理員權限
2. 嘗試直接 URL：`https://console.firebase.google.com/project/lunchips-8c124/authentication/settings`
3. 檢查是否在正確的專案中
4. 嘗試使用不同的瀏覽器

### Q2: 已添加 localhost 但還是出現錯誤？

**檢查：**
1. 確認使用的是 `localhost` 而不是 `127.0.0.1`
2. 確認 URL 是 `http://localhost:8081` 或 `http://localhost:19006`
3. 清除瀏覽器快取
4. 等待幾分鐘讓設定生效
5. 檢查是否有其他網域限制（例如公司防火牆）

### Q3: 已升級到 Blaze 方案但還是出現 `auth/billing-not-enabled`？

**解決方法：**
1. 確認付款方式已設定完成
2. 等待幾分鐘讓設定生效
3. 檢查 Usage and billing 頁面確認方案狀態
4. 嘗試重新載入 Firebase Console

### Q4: reCAPTCHA 容器錯誤？

**解決方法：**
1. 清除瀏覽器快取
2. 重新載入頁面
3. 檢查瀏覽器控制台是否有其他錯誤
4. 確認網路連接正常

## 📞 需要幫助？

如果完成所有設定後仍然出現錯誤，請提供：

1. **錯誤訊息**（完整的錯誤堆疊）
2. **Firebase Console 截圖**：
   - Authentication > Sign-in method（顯示 Phone 已啟用）
   - Authentication > Settings > Authorized domains（顯示 localhost 在列表中）
   - Usage and billing（顯示 Blaze 方案）
3. **瀏覽器控制台**的 Network 標籤截圖（顯示失敗的請求）

## 🔗 相關資源

- [Firebase 電話驗證文檔](https://firebase.google.com/docs/auth/web/phone-auth)
- [授權網域設定](https://firebase.google.com/docs/auth/web/phone-auth#authorized-domains)
- [Firebase Console](https://console.firebase.google.com/project/lunchips-8c124)








