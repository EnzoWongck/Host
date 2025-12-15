# 🔍 如何確認是否為最新版本

## 📦 最新版本信息

**最新構建時間**：剛剛（2025-12-13）  
**最新 JS Bundle**：`AppEntry-5aea738aed8261d4c04823eb715b98cc.js`  
**最新部署 URL**：https://host27o-auw2nvuwn-enzos-projects-c5fe6943.vercel.app

---

## ✅ 檢查步驟

### 步驟 1：檢查 JS Bundle 文件名

1. 打開 https://launchips.com
2. 按 `F12` 打開開發者工具
3. 點擊 **Network** 標籤
4. 按 `Ctrl + Shift + R` 強制刷新頁面
5. 在 Network 標籤中搜索 `AppEntry`
6. 找到 `AppEntry-*.js` 文件
7. **確認文件名是否為**：`AppEntry-5aea738aed8261d4c04823eb715b98cc.js`

**如果看到其他文件名**（如 `AppEntry-1b52f8f71b0...`），說明是舊版本！

---

### 步驟 2：檢查控制台日誌

1. 打開開發者工具（F12）
2. 點擊 **Console** 標籤
3. 刷新頁面
4. 查看是否有以下日誌：
   - `Welcome 背景圖片源: { uri: '/assets/assets/icons/background.9fe3e57bd1f14f038a9bb47d1977bc67.jpg' }`

**如果看到這個日誌**，說明是最新版本！

---

### 步驟 3：檢查功能

#### Welcome 頁面
- [ ] 背景圖片是否顯示？
- [ ] 打開控制台，是否有 `Welcome 背景圖片源` 的日誌？

#### 登入頁面
- [ ] 是否有「使用電話號碼登入」按鈕？
- [ ] 打開控制台，檢查是否有錯誤

#### Google 登入
- [ ] 點擊 Google 登入按鈕
- [ ] 是否使用重定向（不會彈出視窗）？
- [ ] 控制台是否顯示 `使用重定向方式進行 Google 登入...`？

---

## 🚨 如果看到舊版本

### 方法 1：強制刷新（最重要！）

**Windows/Linux**：
- `Ctrl + Shift + R`
- 或 `Ctrl + F5`

**Mac**：
- `Cmd + Shift + R`

### 方法 2：清除瀏覽器緩存

1. 按 `F12` 打開開發者工具
2. 右鍵點擊瀏覽器的刷新按鈕
3. 選擇「清空緩存並硬性重新載入」

或：

1. 打開瀏覽器設置
2. 清除瀏覽數據
3. 選擇「緩存的圖片和文件」
4. 清除數據
5. 重新訪問網站

### 方法 3：使用無痕模式

1. 打開無痕/隱私瀏覽模式
2. 訪問 https://launchips.com
3. 檢查是否為最新版本

### 方法 4：清除 Service Worker

1. 打開開發者工具（F12）
2. 點擊 **Application** 標籤
3. 左側選擇 **Service Workers**
4. 如果有 Service Worker，點擊 **Unregister**
5. 刷新頁面

### 方法 5：直接訪問最新部署 URL

訪問：https://host27o-auw2nvuwn-enzos-projects-c5fe6943.vercel.app

---

## 🔧 調試信息

### 背景圖片問題

如果背景圖片不顯示，請檢查：

1. 打開開發者工具（F12）
2. 點擊 **Network** 標籤
3. 刷新頁面
4. 搜索 `background.9fe3e57bd1f14f038a9bb47d1977bc67.jpg`
5. 檢查：
   - 文件是否成功加載（狀態碼應該是 200）
   - 如果狀態碼是 404，說明路徑有問題
   - 如果狀態碼是 200 但圖片不顯示，可能是 CSS 問題

### 電話登入按鈕問題

如果看不到電話登入按鈕，請檢查：

1. 打開開發者工具（F12）
2. 點擊 **Console** 標籤
3. 輸入：`document.querySelector('[data-testid="phone-login"]')` 或檢查元素
4. 檢查 `onPhoneLogin` 是否為 `undefined`

---

## 📊 版本對比表

| 功能 | 舊版本 | 最新版本 |
|------|--------|----------|
| JS Bundle | AppEntry-1b52f8f71b0... | AppEntry-5aea738aed8261d4c04823eb715b98cc.js |
| Welcome 背景圖片 | ❌ 不顯示 | ✅ 顯示 + 調試日誌 |
| 電話登入按鈕 | ❌ 不顯示 | ✅ 顯示 |
| Google 登入 | ❌ popup-blocked | ✅ 重定向方式 |

---

## 🎯 快速檢查命令

在瀏覽器控制台中執行：

```javascript
// 檢查 JS Bundle 版本
console.log('當前 JS Bundle:', document.querySelector('script[src*="AppEntry"]')?.src);

// 檢查背景圖片
console.log('背景圖片路徑:', '/assets/assets/icons/background.9fe3e57bd1f14f038a9bb47d1977bc67.jpg');

// 檢查電話登入按鈕
console.log('電話登入按鈕存在:', !!document.querySelector('[data-testid="phone-login"]'));
```

---

## ⚠️ 重要提示

1. **99% 的問題是瀏覽器緩存**
   - 請務必使用 `Ctrl + Shift + R` 強制刷新
   - 或清除瀏覽器緩存

2. **CDN 傳播時間**
   - Vercel 使用 CDN，可能需要 1-5 分鐘傳播到全球
   - 如果立即訪問可能看到舊版本

3. **Service Worker 緩存**
   - 如果使用 PWA，Service Worker 可能緩存了舊版本
   - 需要清除 Service Worker

---

**最後更新**：2025-12-13  
**最新構建 ID**：5aea738aed8261d4c04823eb715b98cc





