# 🚀 Poker Host 正式上架指南

## 📋 部署前準備清單

### 1. 域名準備
- [ ] 已購買域名（例如：pokerhost.com）
- [ ] 域名 DNS 已配置
- [ ] A 記錄指向伺服器 IP

### 2. 伺服器準備
- [ ] 已準備 VPS/雲伺服器（推薦：Ubuntu 20.04+）
- [ ] Node.js 18+ 已安裝
- [ ] Nginx 已安裝
- [ ] 防火牆已配置（開放 80, 443 端口）
- [ ] SSH 訪問已設置

### 3. SSL 證書準備
- [ ] 決定使用 Let's Encrypt（免費）或購買證書
- [ ] 準備好證書文件（如使用購買的證書）

---

## 🔧 本地構建步驟

### 步驟 1：構建生產版本

在 Windows PowerShell 中執行：

```powershell
# 確保在專案根目錄
cd C:\Users\user\Documents\GitHub\Host

# 構建 Expo Web 應用
npx expo export --platform web
```

這會創建 `dist` 目錄，包含所有生產文件。

### 步驟 2：檢查構建結果

```powershell
# 檢查 dist 目錄是否存在
Test-Path dist

# 檢查必要文件
Test-Path dist/index.html
Test-Path dist/manifest.json
```

### 步驟 3：準備部署包

如果 `pokerhost-production` 目錄已存在，我們需要更新它：

```powershell
# 清理舊的部署目錄（可選）
Remove-Item -Recurse -Force pokerhost-production -ErrorAction SilentlyContinue

# 創建新的部署目錄
New-Item -ItemType Directory -Path pokerhost-production -Force

# 複製 dist 目錄內容
Copy-Item -Recurse dist/* pokerhost-production/

# 複製生產伺服器文件
Copy-Item production-server.js pokerhost-production/
Copy-Item nginx.conf pokerhost-production/
```

---

## 📦 部署到伺服器

### 方法 1：使用 SCP（推薦）

```powershell
# 在本地執行（需要替換為您的伺服器資訊）
scp -r pokerhost-production/* user@your-server-ip:/var/www/pokerhost/
```

### 方法 2：使用 FTP/SFTP 工具

使用 FileZilla、WinSCP 等工具上傳 `pokerhost-production` 目錄內容到伺服器。

### 方法 3：使用 Git（如果伺服器有 Git）

```bash
# 在伺服器上
cd /var/www
git clone https://github.com/EnzoWongck/Host.git pokerhost
cd pokerhost
npm install
npx expo export --platform web
# 然後配置 Nginx
```

---

## 🖥️ 伺服器配置步驟

### 步驟 1：安裝依賴

```bash
# SSH 連接到伺服器
ssh user@your-server-ip

# 進入部署目錄
cd /var/www/pokerhost

# 安裝 Node.js 依賴（如果需要）
npm install --production
```

### 步驟 2：配置 Nginx

```bash
# 複製 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/pokerhost.com

# 編輯配置文件（替換路徑和域名）
sudo nano /etc/nginx/sites-available/pokerhost.com

# 啟用站點
sudo ln -s /etc/nginx/sites-available/pokerhost.com /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重載 Nginx
sudo systemctl reload nginx
```

### 步驟 3：設置 SSL 證書

#### 使用 Let's Encrypt（免費，推薦）

```bash
# 安裝 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 獲取 SSL 證書
sudo certbot --nginx -d pokerhost.com -d www.pokerhost.com

# 設置自動續期
sudo certbot renew --dry-run
```

#### 使用購買的 SSL 證書

1. 上傳證書文件到伺服器
2. 在 `nginx.conf` 中更新證書路徑：
   ```nginx
   ssl_certificate /path/to/certificate.crt;
   ssl_certificate_key /path/to/private.key;
   ```

### 步驟 4：啟動應用程式

#### 使用 PM2（推薦，自動重啟）

```bash
# 安裝 PM2
npm install -g pm2

# 啟動應用程式
cd /var/www/pokerhost
pm2 start production-server.js --name pokerhost

# 設置開機自啟
pm2 startup
pm2 save

# 查看狀態
pm2 status
pm2 logs pokerhost
```

#### 手動啟動（測試用）

```bash
cd /var/www/pokerhost
node production-server.js
```

---

## ✅ 部署後檢查

### 1. 基本功能測試

- [ ] HTTP 自動重定向到 HTTPS：`http://pokerhost.com`
- [ ] HTTPS 正常訪問：`https://pokerhost.com`
- [ ] 網站正常載入
- [ ] 所有功能正常運作

### 2. PWA 功能測試

- [ ] Manifest 載入：`https://pokerhost.com/manifest.json`
- [ ] Service Worker 註冊：`https://pokerhost.com/sw.js`
- [ ] 圖標顯示正常
- [ ] 可以添加到主畫面

### 3. 性能測試

使用 Chrome DevTools Lighthouse：

- [ ] Performance 評分 > 90
- [ ] PWA 評分 > 90
- [ ] Accessibility 評分 > 90
- [ ] Best Practices 評分 > 90
- [ ] SEO 評分 > 90

### 4. 安全檢查

- [ ] SSL 證書有效（A+ 評分）
- [ ] HTTPS 強制重定向
- [ ] 安全標頭已設置
- [ ] 沒有混合內容警告

---

## 🔧 常見問題排除

### 問題 1：502 Bad Gateway

**原因**：Node.js 應用程式未運行

**解決**：
```bash
# 檢查 PM2 狀態
pm2 status

# 重啟應用程式
pm2 restart pokerhost

# 查看日誌
pm2 logs pokerhost
```

### 問題 2：SSL 證書錯誤

**原因**：證書路徑錯誤或證書過期

**解決**：
```bash
# 檢查證書有效期
sudo certbot certificates

# 更新證書
sudo certbot renew
```

### 問題 3：DNS 不解析

**原因**：DNS 記錄未正確設置

**解決**：
```bash
# 檢查 DNS 解析
nslookup pokerhost.com
dig pokerhost.com

# 等待 DNS 傳播（可能需要 24-48 小時）
```

### 問題 4：PWA 不工作

**原因**：Service Worker 或 Manifest 配置問題

**解決**：
- 檢查 `manifest.json` 路徑
- 檢查 `sw.js` 路徑
- 確認 HTTPS 已啟用
- 清除瀏覽器快取

---

## 📊 監控和維護

### 1. 應用程式監控

```bash
# 實時監控
pm2 monit

# 查看日誌
pm2 logs pokerhost --lines 100

# 查看資源使用
pm2 status
```

### 2. 伺服器監控

- 設置 CPU/記憶體監控告警
- 監控磁碟空間
- 監控網路流量

### 3. 定期維護

- **每週**：檢查應用程式狀態
- **每月**：更新 SSL 證書（Let's Encrypt 自動）
- **每季度**：檢查性能指標
- **每年**：檢查域名續費

---

## 🎉 部署完成！

部署完成後，您的網站將在 `https://pokerhost.com` 上運行！

### 下一步建議：

1. **SEO 優化**：提交到 Google Search Console
2. **分析工具**：設置 Google Analytics
3. **備份策略**：設置自動備份
4. **CDN 加速**：考慮使用 Cloudflare
5. **監控服務**：設置 Uptime Robot 等監控

---

## 📞 需要幫助？

如果遇到問題，請檢查：
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 詳細檢查清單
- [DEPLOYMENT_GUIDE.md](./pokerhost-production/DEPLOYMENT_GUIDE.md) - 部署指南
- GitHub Issues - 技術問題

---

**祝您部署順利！🎊**


