# 🎯 Poker Host PWA 使用指南

## 📱 什麼是 PWA？

PWA (Progressive Web App) 是一種結合了網頁和原生應用程式優點的技術。Poker Host 現在支援 PWA，讓您可以：

- ✅ 將網頁添加到手機主畫面，像使用 App 一樣
- ✅ 離線使用（在沒有網路時仍可使用基本功能）
- ✅ 快速載入（智能快取策略）
- ✅ 推送通知支援
- ✅ 全螢幕體驗（沒有瀏覽器地址欄）

## 🚀 快速開始

### 1. 啟動 PWA 伺服器

```bash
# 使用啟動腳本（推薦）
./start-pwa.sh

# 或手動啟動
node server.js
```

### 2. 在電腦上測試

1. 打開瀏覽器訪問：`http://localhost:3000`
2. 測試 PWA 功能：`http://localhost:3000/pwa-test.html`
3. 檢查開發者工具中的 Application 標籤

### 3. 在手機上安裝

#### iPhone (Safari)
1. 確保手機和電腦在同一網路
2. 在手機 Safari 中訪問：`http://[您的IP]:3000`
3. 點擊底部分享按鈕
4. 選擇「加入主畫面」
5. 確認安裝

#### Android (Chrome)
1. 在 Chrome 中訪問應用程式
2. 瀏覽器會自動顯示「安裝應用程式」橫幅
3. 點擊「安裝」按鈕
4. 或點擊右上角選單 → 「安裝應用程式」

## 🔧 PWA 功能詳解

### Service Worker
- **離線支援**：即使沒有網路也能使用基本功能
- **智能快取**：自動快取常用資源，提升載入速度
- **背景同步**：網路恢復時自動同步數據

### Manifest 配置
- **應用程式名稱**：Poker Host - 撲克牌局管理
- **主題顏色**：#007AFF（蘋果藍）
- **顯示模式**：standalone（全螢幕）
- **圖標**：多種尺寸適配不同設備

### 快取策略
- **靜態資源**：長期快取（1年）
- **API 數據**：網路優先，快取備用
- **HTML 頁面**：不快取，確保最新版本

## 📊 PWA 評分標準

使用 Chrome DevTools 的 Lighthouse 測試：

- **Performance**：載入速度
- **Accessibility**：無障礙支援
- **Best Practices**：最佳實踐
- **SEO**：搜尋引擎優化
- **PWA**：PWA 功能完整性

目標：所有項目達到 90+ 分

## 🐛 常見問題

### Q: 為什麼沒有看到安裝提示？
A: 確保：
- 使用 HTTPS 或 localhost
- 有有效的 manifest.json
- Service Worker 已註冊
- 圖標文件存在

### Q: 安裝後圖標不顯示？
A: 檢查：
- 圖標文件路徑是否正確
- 圖標尺寸是否符合要求
- manifest.json 中的圖標配置

### Q: 離線功能不工作？
A: 檢查：
- Service Worker 是否成功註冊
- 快取策略是否正確
- 瀏覽器是否支援 Service Worker

## 🔄 更新 PWA

當有新版本時：

1. 更新代碼
2. 重新構建：`expo export:web`
3. 更新 Service Worker 版本號
4. 重啟伺服器

用戶下次訪問時會自動收到更新提示。

## 📱 測試建議

### 桌面瀏覽器
- Chrome DevTools → Application → Manifest
- Chrome DevTools → Application → Service Workers
- Chrome DevTools → Lighthouse → PWA

### 手機測試
- 不同網路環境（WiFi、4G、離線）
- 不同設備尺寸
- 不同瀏覽器（Safari、Chrome、Firefox）

## 🎨 自定義配置

### 修改主題顏色
編輯 `public/manifest.json`：
```json
{
  "theme_color": "#您的顏色",
  "background_color": "#您的背景色"
}
```

### 添加新圖標
1. 準備不同尺寸的圖標
2. 放入 `public/icons/` 目錄
3. 更新 `manifest.json` 中的圖標列表

### 修改快取策略
編輯 `public/sw.js` 中的快取配置。

## 📞 技術支援

如果遇到問題：

1. 檢查瀏覽器控制台錯誤
2. 查看 Service Worker 狀態
3. 測試 PWA 測試頁面：`/pwa-test.html`
4. 確認所有文件路徑正確

## 🌐 生產環境部署

### 部署到 pokerhost.com

1. **準備部署包**：
```bash
./deploy-production.sh
```

2. **檢查域名配置**：
```bash
./check-domain.sh
```

3. **上傳到伺服器**：
```bash
scp -r pokerhost-production/ user@your-server:/var/www/
```

4. **配置 Nginx 和 SSL**：
```bash
sudo cp nginx.conf /etc/nginx/sites-available/pokerhost.com
sudo certbot --nginx -d pokerhost.com -d www.pokerhost.com
```

### 生產環境特性

- ✅ **HTTPS 強制重定向**
- ✅ **SSL/TLS 加密**
- ✅ **安全標頭配置**
- ✅ **Gzip 壓縮**
- ✅ **PWA 優化快取**
- ✅ **CDN 就緒**

---

🎉 現在您可以享受原生應用程式般的撲克牌局管理體驗了！

**本地開發**：`http://localhost:3000`  
**生產環境**：`https://pokerhost.com`
