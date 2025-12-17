# 🚀 部署到 www.host27o.com 完整指南

## 📋 快速開始

### 步驟 1：構建並準備部署包

在 Windows PowerShell 中運行：

```powershell
.\deploy-host27o.ps1
```

這會：
- ✅ 構建生產版本（如果 dist 目錄不存在）
- ✅ 更新所有 URL 為 `https://www.host27o.com`
- ✅ 創建 `host27o-production` 部署目錄
- ✅ 生成 Nginx 配置文件
- ✅ 創建部署指南

---

## 📦 部署方法

### 方法 1：使用 SCP（推薦）

```powershell
# 在本地電腦運行
scp -r host27o-production/* user@your-server-ip:/var/www/host27o-production/
```

### 方法 2：使用 FTP/SFTP 工具

使用 FileZilla、WinSCP 等工具：
1. 連接到伺服器
2. 上傳整個 `host27o-production` 目錄內容到 `/var/www/host27o-production/`

### 方法 3：使用 Git（如果伺服器有 Git）

```bash
# 在伺服器上
cd /var/www
git clone https://github.com/your-repo/Host.git host27o-production
cd host27o-production
npm install
npx expo export --platform web
# 然後運行部署腳本更新配置
```

---

## 🖥️ 伺服器配置步驟

### 步驟 1：SSH 連接到伺服器

```bash
ssh user@your-server-ip
```

### 步驟 2：安裝必要軟件（如果尚未安裝）

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝 Nginx
sudo apt install nginx -y

# 啟動 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步驟 3：配置 Nginx

```bash
# 進入部署目錄
cd /var/www/host27o-production

# 複製 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/host27o.com

# 編輯配置文件（確保路徑正確）
sudo nano /etc/nginx/sites-available/host27o.com
# 確認 root 路徑為：/var/www/host27o-production

# 啟用站點
sudo ln -s /etc/nginx/sites-available/host27o.com /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 如果測試通過，重載 Nginx
sudo systemctl reload nginx
```

### 步驟 4：配置 DNS

在您的域名管理後台（如 GoDaddy, Namecheap）設置：

```
類型: A
名稱: @ (或留空)
值: 您的伺服器 IP 地址
TTL: 300

類型: A
名稱: www
值: 您的伺服器 IP 地址
TTL: 300
```

等待 DNS 傳播（通常 5-30 分鐘，最多 48 小時）

### 步驟 5：設置 SSL 證書（Let's Encrypt）

```bash
# 安裝 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 獲取 SSL 證書（自動配置 Nginx）
sudo certbot --nginx -d host27o.com -d www.host27o.com

# 測試自動續期
sudo certbot renew --dry-run
```

**注意**：運行 certbot 前，確保：
- DNS 記錄已正確設置
- 域名已解析到您的伺服器 IP
- 80 和 443 端口已開放

---

## ✅ 部署後檢查

### 1. 基本功能測試

- [ ] HTTP 自動重定向到 HTTPS：`http://www.host27o.com`
- [ ] HTTPS 正常訪問：`https://www.host27o.com`
- [ ] 網站正常載入
- [ ] 所有功能正常運作

### 2. PWA 功能測試

- [ ] Manifest 載入：`https://www.host27o.com/manifest.json`
- [ ] Service Worker 註冊：`https://www.host27o.com/sw.js`
- [ ] 圖標顯示正常
- [ ] 可以添加到主畫面

### 3. SSL 證書檢查

```bash
# 檢查證書有效期
sudo certbot certificates

# 測試 SSL 評分
# 訪問：https://www.ssllabs.com/ssltest/analyze.html?d=www.host27o.com
```

### 4. 性能測試

使用 Chrome DevTools Lighthouse：
- [ ] Performance 評分 > 90
- [ ] PWA 評分 > 90
- [ ] Accessibility 評分 > 90

---

## 🔧 常見問題排除

### 問題 1：502 Bad Gateway

**原因**：Nginx 無法找到文件或權限問題

**解決**：
```bash
# 檢查文件權限
sudo chown -R www-data:www-data /var/www/host27o-production
sudo chmod -R 755 /var/www/host27o-production

# 檢查 Nginx 錯誤日誌
sudo tail -f /var/log/nginx/error.log

# 重啟 Nginx
sudo systemctl restart nginx
```

### 問題 2：SSL 證書錯誤

**原因**：DNS 未正確解析或證書路徑錯誤

**解決**：
```bash
# 檢查 DNS 解析
nslookup www.host27o.com
dig www.host27o.com

# 檢查證書
sudo certbot certificates

# 更新證書
sudo certbot renew
```

### 問題 3：DNS 不解析

**原因**：DNS 記錄未正確設置或尚未傳播

**解決**：
- 檢查域名管理後台的 DNS 設置
- 等待 DNS 傳播（最多 48 小時）
- 使用 `nslookup` 或 `dig` 檢查解析狀態

### 問題 4：PWA 不工作

**原因**：Service Worker 或 Manifest 配置問題

**解決**：
- 檢查 `manifest.json` 路徑
- 檢查 `sw.js` 路徑
- 確認 HTTPS 已啟用
- 清除瀏覽器快取
- 檢查瀏覽器控制台錯誤

---

## 📊 維護命令

```bash
# 查看 Nginx 狀態
sudo systemctl status nginx

# 重啟 Nginx
sudo systemctl restart nginx

# 查看 Nginx 日誌
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 更新 SSL 證書
sudo certbot renew

# 檢查磁碟空間
df -h

# 檢查服務器資源
htop
```

---

## 🔄 更新部署

當需要更新應用時：

1. **本地構建新版本**：
   ```powershell
   .\deploy-host27o.ps1
   ```

2. **上傳到伺服器**：
   ```bash
   scp -r host27o-production/* user@server:/var/www/host27o-production/
   ```

3. **在伺服器上重載 Nginx**：
   ```bash
   sudo systemctl reload nginx
   ```

---

## 🎉 部署完成！

部署完成後，您的應用將在 **https://www.host27o.com** 上運行！

### 下一步建議：

1. **SEO 優化**：提交到 Google Search Console
2. **分析工具**：確認 Google Analytics 正常工作
3. **備份策略**：設置自動備份
4. **監控服務**：設置 Uptime Robot 等監控
5. **CDN 加速**：考慮使用 Cloudflare

---

## 📞 需要幫助？

如果遇到問題，請檢查：
- `host27o-production/DEPLOYMENT_GUIDE.md` - 詳細部署指南
- Nginx 錯誤日誌：`/var/log/nginx/error.log`
- Certbot 日誌：`/var/log/letsencrypt/`

**祝您部署順利！🎊**












