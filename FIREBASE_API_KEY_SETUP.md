# 🔑 Firebase API Key 應用程式限制設定指南

## 📋 完整網域列表

在 Google Cloud Console 中設定 API Key 的「應用程式限制」時，需要添加以下**所有**網域：

### 本地開發環境
```
http://localhost:*
http://localhost:8081/*
http://localhost:3000/*
http://127.0.0.1:*
http://127.0.0.1:8081/*
http://127.0.0.1:3000/*
```

### 生產環境（必須添加）
```
https://lunchips.com/*
https://www.lunchips.com/*
https://*.lunchips.com/*
```

### Vercel 部署網域（如果使用）
```
https://lunchips-gdphutige-enzos-projects-c5fe6943.vercel.app/*
https://*.vercel.app/*
```

## 🔧 設定步驟

### 1. 前往 Google Cloud Console
- 訪問：https://console.cloud.google.com/
- 選擇專案：`lunchips-8c124`

### 2. 編輯 API Key
- 點擊「API 和服務」>「憑證」
- 找到 API Key：`AIzaSyBuAQUU2xrp8pk418EkKkiQVlIHvkd5-TE`
- 點擊該 API Key 進行編輯

### 3. 設定應用程式限制
- 在「應用程式限制」部分，選擇「HTTP 引用者（網站）」
- 點擊「新增項目」
- 逐一添加上述所有網域

### 4. 重要注意事項
- ✅ **必須添加 `https://lunchips.com/*`**（生產環境）
- ✅ **必須添加 `http://localhost:*`**（本地開發）
- ✅ 使用 `*` 通配符可以匹配所有子路徑
- ✅ 每個網域需要單獨添加一行

## 📝 完整網域列表（複製貼上）

```
http://localhost:*
http://localhost:8081/*
http://localhost:3000/*
http://127.0.0.1:*
http://127.0.0.1:8081/*
http://127.0.0.1:3000/*
https://lunchips.com/*
https://www.lunchips.com/*
https://*.lunchips.com/*
https://lunchips-gdphutige-enzos-projects-c5fe6943.vercel.app/*
https://*.vercel.app/*
```

## ⚠️ 常見錯誤

### 錯誤 1: 只添加了 localhost，忘記添加生產網域
**結果：** 本地開發正常，但生產環境無法使用 Firebase

### 錯誤 2: 忘記添加 `www` 子網域
**結果：** `www.lunchips.com` 無法使用 Firebase

### 錯誤 3: 使用錯誤的協議（http vs https）
**結果：** 生產環境必須使用 `https://`，本地開發使用 `http://`

## ✅ 驗證設定

完成設定後，等待 2-5 分鐘，然後測試：

1. **本地開發測試**
   - 訪問 `http://localhost:8081`
   - 嘗試登入功能
   - 檢查瀏覽器控制台是否有錯誤

2. **生產環境測試**
   - 訪問 `https://lunchips.com`
   - 嘗試登入功能
   - 檢查瀏覽器控制台是否有錯誤

## 🔍 檢查當前設定

在 Google Cloud Console 中：
1. 進入「API 和服務」>「憑證」
2. 點擊您的 API Key
3. 查看「應用程式限制」部分
4. 確認所有網域都已添加

## 📞 需要幫助？

如果設定後仍有問題：
1. 確認已等待 2-5 分鐘讓設定生效
2. 清除瀏覽器快取
3. 檢查 Firebase Console 中的授權網域設定
4. 查看瀏覽器控制台的詳細錯誤訊息




