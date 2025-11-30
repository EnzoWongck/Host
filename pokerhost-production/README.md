# 🚀 Poker Host 生產環境部署包

## 📦 包含內容

此目錄包含完整的生產環境部署文件：

- ✅ **應用程式文件**：完整的 Expo Web 構建輸出
- ✅ **PWA 文件**：manifest.json, sw.js, icons
- ✅ **伺服器文件**：production-server.js
- ✅ **配置文件**：nginx.conf

## 🚀 快速部署

### 1. 上傳到伺服器

使用 SCP 或 FTP 工具將整個目錄上傳到伺服器：

```bash
scp -r pokerhost-production/* user@your-server:/var/www/pokerhost/
```

### 2. 配置 Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/pokerhost.com
sudo ln -s /etc/nginx/sites-available/pokerhost.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. 設置 SSL 證書

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d pokerhost.com -d www.pokerhost.com
```

### 4. 啟動應用程式

```bash
cd /var/www/pokerhost
npm install -g pm2
pm2 start production-server.js --name pokerhost
pm2 startup
pm2 save
```

## 📋 詳細部署指南

請參考根目錄的 `PRODUCTION_DEPLOYMENT.md` 文件獲取完整的部署步驟。

## ✅ 部署後檢查

- [ ] HTTPS 正常訪問：https://pokerhost.com
- [ ] PWA manifest 載入正常
- [ ] Service Worker 註冊成功
- [ ] 所有功能正常運作

## 🎉 完成！

部署完成後，您的網站將在 https://pokerhost.com 上運行！


