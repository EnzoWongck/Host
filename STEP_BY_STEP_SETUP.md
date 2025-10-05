# 🎯 Poker Host 網頁設置完整指南

## 📋 第一步：確認當前狀態

讓我們先檢查您的應用程式是否正常運行：

### 1.1 檢查伺服器狀態
```bash
# 在終端機中運行
cd /Users/kwokheitung/Desktop/Host.2/PokerHost
curl -s http://localhost:3000 > /dev/null && echo "✅ 伺服器正常運行" || echo "❌ 伺服器未運行"
```

### 1.2 啟動伺服器（如果未運行）
```bash
# 如果伺服器未運行，請執行：
./start-pwa.sh
```

### 1.3 在瀏覽器中測試
- 打開瀏覽器
- 訪問：`http://localhost:3000`
- 確認網頁正常顯示

---

## 📱 第二步：在手機上測試

### 2.1 獲取您的電腦 IP 地址
```bash
# 在終端機中運行
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 2.2 在手機上測試
1. 確保手機和電腦連接同一 WiFi
2. 在手機瀏覽器中訪問：`http://[您的IP]:3000`
3. 例如：`http://192.168.1.100:3000`

### 2.3 測試 PWA 功能
1. 在手機 Safari 中打開網頁
2. 點擊分享按鈕（底部中間的方塊圖標）
3. 選擇「加入主畫面」
4. 確認應用程式圖標出現在主畫面

---

## 🌐 第三步：準備生產環境部署

### 3.1 準備部署包
```bash
# 在終端機中運行
./deploy-production.sh
```

### 3.2 檢查部署包
```bash
# 確認部署目錄已創建
ls -la pokerhost-production/
```

---

## 🔧 第四步：設置伺服器

### 4.1 選擇伺服器提供商
推薦選項：
- **VPS 提供商**：DigitalOcean, Linode, Vultr
- **雲端服務**：AWS EC2, Google Cloud, Azure
- **共享主機**：不推薦，需要支援 Node.js

### 4.2 伺服器規格建議
- **CPU**：1-2 核心
- **記憶體**：1-2 GB RAM
- **儲存空間**：20-40 GB SSD
- **作業系統**：Ubuntu 20.04 LTS 或 CentOS 8

### 4.3 連接伺服器
```bash
# 使用 SSH 連接伺服器
ssh username@your-server-ip
```

---

## 📦 第五步：在伺服器上安裝環境

### 5.1 更新系統
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 5.2 安裝 Node.js
```bash
# 安裝 Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 驗證安裝
node --version
npm --version
```

### 5.3 安裝 Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# 啟動 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.4 安裝 PM2（進程管理器）
```bash
sudo npm install -g pm2
```

---

## 🚀 第六步：部署應用程式

### 6.1 上傳文件到伺服器
```bash
# 在本地電腦上運行
scp -r pokerhost-production/ username@your-server-ip:/home/username/
```

### 6.2 在伺服器上設置應用程式
```bash
# 連接到伺服器後運行
cd /home/username/pokerhost-production
npm install
```

### 6.3 配置 Nginx
```bash
# 複製 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/pokerhost.com

# 創建符號連結
sudo ln -s /etc/nginx/sites-available/pokerhost.com /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重新載入 Nginx
sudo systemctl reload nginx
```

---

## 🔒 第七步：設置 SSL 證書

### 7.1 安裝 Certbot
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y
```

### 7.2 獲取 SSL 證書
```bash
# 運行 Certbot（需要先配置 DNS）
sudo certbot --nginx -d pokerhost.com -d www.pokerhost.com
```

### 7.3 測試自動續期
```bash
# 測試證書自動續期
sudo certbot renew --dry-run
```

---

## 🌐 第八步：配置 DNS

### 8.1 登入域名管理後台
1. 登入您的域名註冊商（如 GoDaddy, Namecheap）
2. 找到 DNS 管理區域

### 8.2 設置 A 記錄
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

### 8.3 等待 DNS 傳播
- DNS 傳播通常需要 5-30 分鐘
- 可以使用 `./check-domain.sh` 檢查狀態

---

## 🚀 第九步：啟動應用程式

### 9.1 使用 PM2 啟動
```bash
cd /home/username/pokerhost-production
npm run pm2
```

### 9.2 設置開機自啟
```bash
pm2 startup
pm2 save
```

### 9.3 檢查應用程式狀態
```bash
pm2 status
pm2 logs pokerhost
```

---

## 🧪 第十步：測試和驗證

### 10.1 基本功能測試
```bash
# 測試 HTTP 重定向
curl -I http://pokerhost.com

# 測試 HTTPS
curl -I https://pokerhost.com

# 測試 PWA 文件
curl -I https://pokerhost.com/manifest.json
curl -I https://pokerhost.com/sw.js
```

### 10.2 瀏覽器測試
1. 訪問：`https://pokerhost.com`
2. 檢查 SSL 證書是否有效
3. 測試 PWA 功能
4. 在手機上測試「加入主畫面」

### 10.3 性能測試
- 使用 Google PageSpeed Insights
- 使用 Lighthouse 測試 PWA 評分
- 目標：PWA 評分 > 90

---

## 📊 第十一步：設置監控

### 11.1 設置伺服器監控
```bash
# 安裝 htop（系統監控）
sudo apt install htop -y

# 監控系統資源
htop
```

### 11.2 設置應用程式監控
```bash
# PM2 監控
pm2 monit

# 查看日誌
pm2 logs pokerhost
```

### 11.3 設置日誌輪轉
```bash
# 安裝 logrotate
sudo apt install logrotate -y
```

---

## 🔧 第十二步：維護和更新

### 12.1 定期維護任務
```bash
# 更新系統套件
sudo apt update && sudo apt upgrade -y

# 更新 Node.js 應用程式依賴
cd /home/username/pokerhost-production
npm update

# 重啟應用程式
pm2 restart pokerhost
```

### 12.2 備份策略
```bash
# 創建備份腳本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf pokerhost_backup_$DATE.tar.gz /home/username/pokerhost-production
EOF

chmod +x backup.sh
```

---

## 🆘 常見問題解決

### 問題 1：網站無法訪問
**解決方案**：
1. 檢查防火牆設置：`sudo ufw status`
2. 檢查 Nginx 狀態：`sudo systemctl status nginx`
3. 檢查應用程式狀態：`pm2 status`

### 問題 2：SSL 證書錯誤
**解決方案**：
1. 檢查 DNS 是否正確解析
2. 重新運行 Certbot：`sudo certbot --nginx -d pokerhost.com`
3. 檢查證書有效期：`sudo certbot certificates`

### 問題 3：PWA 功能不工作
**解決方案**：
1. 檢查 manifest.json 是否可訪問
2. 檢查 Service Worker 是否註冊成功
3. 檢查瀏覽器控制台錯誤

---

## 📞 需要幫助？

如果在任何步驟遇到問題，請：

1. **檢查日誌**：
   ```bash
   pm2 logs pokerhost
   sudo tail -f /var/log/nginx/error.log
   ```

2. **重新檢查配置**：
   ```bash
   sudo nginx -t
   pm2 status
   ```

3. **重啟服務**：
   ```bash
   sudo systemctl restart nginx
   pm2 restart pokerhost
   ```

---

## 🎉 完成檢查清單

- [ ] 本地測試通過
- [ ] 手機測試通過
- [ ] 伺服器環境安裝完成
- [ ] 應用程式部署成功
- [ ] SSL 證書安裝成功
- [ ] DNS 配置正確
- [ ] 應用程式正常運行
- [ ] PWA 功能正常
- [ ] 監控設置完成

**恭喜！您的 Poker Host PWA 網站已成功部署！** 🎊

現在您可以訪問 `https://pokerhost.com` 來使用您的撲克牌局管理應用程式了！

