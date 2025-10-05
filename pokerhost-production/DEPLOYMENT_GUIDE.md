# Poker Host 生產環境部署指南

## 📋 部署前準備

1. **域名配置**
   - 確保 pokerhost.com 域名已購買並配置 DNS
   - 設置 A 記錄指向您的伺服器 IP

2. **SSL 證書**
   - 使用 Let's Encrypt 或購買 SSL 證書
   - 更新 nginx.conf 中的證書路徑

3. **伺服器環境**
   - Ubuntu/CentOS 伺服器
   - Node.js 16+ 已安裝
   - Nginx 已安裝並配置

## 🚀 部署步驟

### 1. 上傳文件
```bash
# 將整個 pokerhost-production 目錄上傳到伺服器
scp -r pokerhost-production/ user@your-server:/var/www/
```

### 2. 安裝依賴
```bash
cd /var/www/pokerhost-production
npm install
```

### 3. 配置 Nginx
```bash
# 複製 nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/pokerhost.com
sudo ln -s /etc/nginx/sites-available/pokerhost.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 設置 SSL 證書
```bash
# 使用 Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d pokerhost.com -d www.pokerhost.com
```

### 5. 啟動應用程式
```bash
# 使用 PM2 管理進程
npm install -g pm2
npm run pm2

# 或直接啟動
npm start
```

## 🔧 維護命令

```bash
# 重啟應用程式
npm run pm2:restart

# 查看日誌
pm2 logs pokerhost

# 停止應用程式
npm run pm2:stop
```

## 📊 監控

- 使用 PM2 監控進程狀態
- 設置 Nginx 日誌監控
- 配置 SSL 證書到期提醒

## 🔒 安全建議

1. 定期更新 SSL 證書
2. 設置防火牆規則
3. 定期備份數據
4. 監控伺服器資源使用

---

部署完成後，您的 PWA 將在 https://pokerhost.com 上運行！
