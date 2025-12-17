# 🔍 如何找到 Firebase 授權網域設定

## 📍 快速定位步驟

### 方法 1：通過 Authentication Settings（最直接）

1. **訪問 Firebase Console**
   ```
   https://console.firebase.google.com/
   ```

2. **選擇您的專案**
   - 點擊專案：`lunchips-8c124`

3. **進入 Authentication**
   - 左側選單 → 點擊 **Authentication**

4. **打開 Settings 標籤**
   - 在 Authentication 頁面中，點擊頂部的 **Settings**（設定）標籤
   - ⚠️ 注意：不是 "Sign-in method" 標籤，而是 "Settings" 標籤

5. **找到 Authorized domains**
   - 向下滾動頁面
   - 找到 **Authorized domains**（已授權網域）區塊
   - 應該會看到一個列表，顯示已授權的網域

6. **添加網域**
   - 如果 `localhost` 不在列表中，點擊 **Add domain** 按鈕
   - 輸入 `localhost` 並點擊 **Add**

### 方法 2：通過專案設定

1. **點擊專案設定**
   - Firebase Console 左上角 → 點擊 **⚙️ 專案設定**（齒輪圖標）

2. **選擇 General 標籤**
   - 在專案設定頁面中，確保在 **General**（一般）標籤

3. **找到 Your apps**
   - 向下滾動到 **Your apps**（您的應用程式）部分
   - 找到您的 Web 應用程式

4. **查看應用程式詳細資訊**
   - 點擊應用程式旁邊的 **⋮**（三個點）選單
   - 或直接點擊應用程式名稱查看詳細資訊
   - 在詳細資訊中應該可以看到授權網域設定

### 方法 3：直接 URL 訪問

直接訪問以下 URL（已包含您的專案 ID）：

```
https://console.firebase.google.com/project/lunchips-8c124/authentication/settings
```

這個 URL 會直接帶您到 Authentication Settings 頁面，您應該能看到 **Authorized domains** 區塊。

## ✅ 需要添加的網域

確保以下網域在授權列表中：

- ✅ `localhost` - 開發環境（通常會自動添加）
- ✅ `lunchips-8c124.firebaseapp.com` - Firebase Hosting 預設網域
- ✅ `lunchips.com` - 如果已設定自訂網域
- ✅ 您的實際部署網域（例如：`www.lunchips.com`）

## 🖼️ 視覺指引

在 Authentication Settings 頁面中，您應該會看到類似這樣的結構：

```
Authentication
├── Users（用戶）
├── Sign-in method（登入方式）
└── Settings（設定）← 點擊這裡
    └── Authorized domains（已授權網域）← 在這裡
        ├── localhost
        ├── lunchips-8c124.firebaseapp.com
        └── [Add domain] 按鈕
```

## ⚠️ 常見問題

### Q: 找不到 Settings 標籤？
**A:** 確保您點擊的是 **Authentication** 左側選單項目，然後查看頁面頂部的標籤。Settings 標籤通常在 Users 和 Sign-in method 旁邊。

### Q: 看不到 Authorized domains？
**A:** 
1. 確認您有專案的管理員權限
2. 嘗試刷新頁面（Ctrl+F5 或 Cmd+Shift+R）
3. 檢查瀏覽器控制台是否有錯誤
4. 嘗試使用不同的瀏覽器

### Q: localhost 已經在列表中，但還是出現錯誤？
**A:**
1. 確認您使用的是 `localhost` 而不是 `127.0.0.1`
2. 清除瀏覽器快取並重新載入
3. 等待幾分鐘讓設定生效
4. 檢查 Firebase 專案是否已升級到 Blaze 方案

## 🔗 相關連結

- [Firebase 授權網域文檔](https://firebase.google.com/docs/auth/web/phone-auth#authorized-domains)
- [Firebase Console](https://console.firebase.google.com/)

## 📝 檢查清單

完成以下步驟後，您的電話驗證應該可以正常工作：

- [ ] 找到並打開 Authentication > Settings
- [ ] 確認 `localhost` 在授權網域列表中
- [ ] 如果沒有，點擊 Add domain 添加 `localhost`
- [ ] 確認 Firebase 專案已升級到 Blaze 方案
- [ ] 確認 Phone 登入方式已啟用
- [ ] 清除瀏覽器快取
- [ ] 重新載入應用程式並測試









