# 🚨 強制清除緩存指南

## 問題確認

您訪問的 URL 顯示的是**舊版本**：
- **舊版本 JS**：`AppEntry-1b52f8f71b05b6b831f7d49b3a201892.js`
- **最新版本 JS**：`AppEntry-5aea738aed8261d4c04823eb715b98cc.js`

這說明您訪問的可能是：
1. 瀏覽器緩存的舊版本
2. Vercel CDN 緩存的舊版本
3. Service Worker 緩存的舊版本

---

## 🔧 解決方法（按順序嘗試）

### 方法 1：強制刷新（最重要！）

**Windows/Linux**：
- `Ctrl + Shift + R`
- 或 `Ctrl + F5`
- 或 `Shift + F5`

**Mac**：
- `Cmd + Shift + R`
- 或 `Cmd + Option + R`

### 方法 2：清除瀏覽器緩存

1. 按 `F12` 打開開發者工具
2. **右鍵點擊瀏覽器的刷新按鈕**
3. 選擇「**清空緩存並硬性重新載入**」（Empty Cache and Hard Reload）

或：

1. 打開瀏覽器設置
2. 清除瀏覽數據
3. 選擇「**緩存的圖片和文件**」
4. 時間範圍選擇「**全部時間**」
5. 清除數據
6. 重新訪問 https://launchips.com

### 方法 3：清除 Service Worker

1. 打開開發者工具（F12）
2. 點擊 **Application** 標籤
3. 左側選擇 **Service Workers**
4. 如果有 Service Worker，點擊 **Unregister**
5. 點擊 **Clear storage**
6. 刷新頁面

### 方法 4：使用無痕模式

1. 打開無痕/隱私瀏覽模式
   - Chrome: `Ctrl + Shift + N` (Windows) 或 `Cmd + Shift + N` (Mac)
   - Firefox: `Ctrl + Shift + P` (Windows) 或 `Cmd + Shift + P` (Mac)
   - Edge: `Ctrl + Shift + N` (Windows) 或 `Cmd + Shift + N` (Mac)
2. 訪問 https://launchips.com
3. 檢查是否為最新版本

### 方法 5：直接訪問最新部署 URL

訪問最新部署的 URL（繞過 CDN 緩存）：
- https://host27o-ovidg6hly-enzos-projects-c5fe6943.vercel.app

### 方法 6：清除 DNS 緩存

**Windows**：
```powershell
ipconfig /flushdns
```

**Mac**：
```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

**Linux**：
```bash
sudo systemd-resolve --flush-caches
```

---

## 🔍 如何確認是否為最新版本

### 檢查 JS Bundle 文件名

1. 打開 https://launchips.com
2. 按 `F12` 打開開發者工具
3. 點擊 **Network** 標籤
4. 按 `Ctrl + Shift + R` 強制刷新
5. 搜索 `AppEntry`
6. 確認文件名是否為：**`AppEntry-5aea738aed8261d4c04823eb715b98cc.js`**

**如果看到其他文件名**，說明仍然是舊版本！

### 檢查控制台日誌

打開控制台（F12 > Console），應該看到：
```
Welcome 背景圖片源: { uri: '/assets/assets/icons/background.9fe3e57bd1f14f038a9bb47d1977bc67.jpg' }
```

### 檢查功能

**最新版本應該有**：
- ✅ Welcome 頁面顯示背景圖片
- ✅ 登入頁面有「使用電話號碼登入」按鈕
- ✅ Google 登入使用重定向（不會彈出視窗）

---

## 📊 版本對比

| 項目 | 舊版本 | 最新版本 |
|------|--------|----------|
| JS Bundle | AppEntry-1b52f8f71b05b6b831f7d49b3a201892.js | AppEntry-5aea738aed8261d4c04823eb715b98cc.js |
| Welcome 背景圖片 | ❌ 不顯示 | ✅ 顯示 |
| 電話登入按鈕 | ❌ 不顯示 | ✅ 顯示 |
| Google 登入 | ❌ popup-blocked | ✅ 重定向方式 |

---

## ⚠️ 重要提示

1. **99% 的問題是瀏覽器緩存**
   - 請務必使用 `Ctrl + Shift + R` 強制刷新
   - 或清除瀏覽器緩存

2. **Vercel CDN 緩存**
   - Vercel 使用全球 CDN，可能需要 1-5 分鐘傳播
   - 如果立即訪問可能看到舊版本

3. **Service Worker 緩存**
   - 如果使用 PWA，Service Worker 可能緩存了舊版本
   - 需要清除 Service Worker

4. **瀏覽器擴展**
   - 某些瀏覽器擴展（如廣告攔截器）可能影響資源加載
   - 嘗試禁用擴展後測試

---

## 🎯 快速檢查命令

在瀏覽器控制台中執行：

```javascript
// 檢查當前 JS Bundle
const script = document.querySelector('script[src*="AppEntry"]');
console.log('當前 JS Bundle:', script?.src);

// 檢查是否為最新版本
const isLatest = script?.src.includes('AppEntry-5aea738aed8261d4c04823eb715b98cc.js');
console.log('是否為最新版本:', isLatest ? '✅ 是' : '❌ 否');

// 如果是最新版本，應該看到：
// 當前 JS Bundle: https://lunchips.com/_expo/static/js/web/AppEntry-5aea738aed8261d4c04823eb715b98cc.js
// 是否為最新版本: ✅ 是
```

---

## 📝 最新部署信息

- **最新部署時間**：剛剛（2025-12-13 20:18）
- **最新部署 ID**：dpl_H14zkm1XBWf1JKEdD277dVyqkqjC
- **最新部署 URL**：https://host27o-ovidg6hly-enzos-projects-c5fe6943.vercel.app
- **最新 JS Bundle**：AppEntry-5aea738aed8261d4c04823eb715b98cc.js

---

**請按照上述方法清除緩存，然後確認是否為最新版本！**





