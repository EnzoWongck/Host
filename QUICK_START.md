# 🚀 Poker Host 快速開始指南

## 🎯 立即開始

### 方法 1：互動式設置（推薦新手）
```bash
./interactive-setup.sh
```
這個腳本會逐步引導您完成所有設置。

### 方法 2：手動設置（推薦有經驗用戶）
按照以下步驟手動設置：

---

## 📋 快速設置步驟

### 1️⃣ 本地測試
```bash
# 啟動本地伺服器
./start-pwa.sh

# 在瀏覽器打開
# http://localhost:3000
```

### 2️⃣ 準備部署
```bash
# 創建生產環境部署包
./deploy-production.sh
```

### 3️⃣ 檢查域名
```bash
# 檢查域名狀態
./check-domain.sh
```

### 4️⃣ 部署到伺服器
```bash
# 上傳到伺服器
scp -r pokerhost-production/ user@server:/var/www/

# 在伺服器上設置
ssh user@server
cd /var/www/pokerhost-production
npm install
sudo cp nginx.conf /etc/nginx/sites-available/pokerhost.com
sudo ln -s /etc/nginx/sites-available/pokerhost.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5️⃣ 設置 SSL
```bash
# 安裝 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 獲取 SSL 證書
sudo certbot --nginx -d pokerhost.com -d www.pokerhost.com
```

### 6️⃣ 啟動應用程式
```bash
# 使用 PM2 啟動
npm install -g pm2
npm run pm2
pm2 startup && pm2 save
```

---

## 📱 測試清單

- [ ] 本地測試：http://localhost:3000
- [ ] 手機測試：http://[您的IP]:3000
- [ ] 域名測試：https://pokerhost.com
- [ ] PWA 測試：添加到主畫面
- [ ] SSL 測試：證書有效性

---

## 🆘 遇到問題？

### 常見問題：
1. **伺服器無法訪問** → 檢查防火牆和 DNS
2. **SSL 證書錯誤** → 檢查域名解析
3. **PWA 不工作** → 檢查 manifest.json 和 sw.js

### 獲取幫助：
- 📖 詳細指南：`STEP_BY_STEP_SETUP.md`
- 📋 檢查清單：`DEPLOYMENT_CHECKLIST.md`
- 🔧 互動設置：`./interactive-setup.sh`

---

## 🎉 完成！

設置完成後，您的 Poker Host PWA 將在：
- **本地開發**：http://localhost:3000
- **生產環境**：https://pokerhost.com

享受您的撲克牌局管理應用程式！🎊

