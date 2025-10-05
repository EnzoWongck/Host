#!/bin/bash

# Poker Host 生產環境部署腳本
echo "🚀 部署 Poker Host 到 pokerhost.com..."

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js"
    exit 1
fi

# 檢查是否存在 dist 目錄
if [ ! -d "dist" ]; then
    echo "❌ dist 目錄不存在，正在構建應用程式..."
    npx expo export
fi

# 檢查必要的 PWA 文件
required_files=("dist/manifest.json" "dist/sw.js" "dist/icons/icon-192x192.png")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必要文件: $file"
        echo "請先運行 ./start-pwa.sh 來設置 PWA 文件"
        exit 1
    fi
done

echo "✅ PWA 文件檢查完成"

# 更新 manifest.json 為生產環境網址
echo "🔧 更新 manifest.json 為生產環境網址..."
if [ -f "dist/manifest.json" ]; then
    # 備份原文件
    cp dist/manifest.json dist/manifest.json.backup
    
    # 更新網址
    sed -i '' 's|http://localhost:3000|https://pokerhost.com|g' dist/manifest.json
    sed -i '' 's|"start_url": "/"|"start_url": "https://pokerhost.com/"|g' dist/manifest.json
    sed -i '' 's|"scope": "/"|"scope": "https://pokerhost.com/"|g' dist/manifest.json
    
    echo "✅ manifest.json 已更新"
else
    echo "❌ manifest.json 不存在"
    exit 1
fi

# 更新 HTML 文件中的 meta 標籤
echo "🔧 更新 HTML meta 標籤..."
if [ -f "dist/index.html" ]; then
    # 備份原文件
    cp dist/index.html dist/index.html.backup
    
    # 更新 Open Graph 和 Twitter 標籤中的網址
    sed -i '' 's|http://localhost:3000|https://pokerhost.com|g' dist/index.html
    
    echo "✅ HTML meta 標籤已更新"
else
    echo "❌ index.html 不存在"
    exit 1
fi

# 創建部署目錄
DEPLOY_DIR="pokerhost-production"
if [ -d "$DEPLOY_DIR" ]; then
    echo "🗑️  清理舊的部署目錄..."
    rm -rf "$DEPLOY_DIR"
fi

echo "📁 創建生產環境部署目錄..."
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR/"

# 創建生產環境的 package.json
cat > "$DEPLOY_DIR/package.json" << EOF
{
  "name": "pokerhost-production",
  "version": "1.0.0",
  "description": "Poker Host Production Server",
  "main": "production-server.js",
  "scripts": {
    "start": "node production-server.js",
    "pm2": "pm2 start production-server.js --name pokerhost",
    "pm2:stop": "pm2 stop pokerhost",
    "pm2:restart": "pm2 restart pokerhost"
  },
  "dependencies": {
    "http": "*",
    "https": "*",
    "fs": "*",
    "path": "*"
  }
}
EOF

# 複製生產環境伺服器文件
cp production-server.js "$DEPLOY_DIR/"

# 創建 nginx 配置文件
cat > "$DEPLOY_DIR/nginx.conf" << 'EOF'
server {
    listen 80;
    server_name pokerhost.com www.pokerhost.com;
    
    # 重定向所有 HTTP 請求到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pokerhost.com www.pokerhost.com;
    
    # SSL 證書配置（需要替換為真實證書路徑）
    # ssl_certificate /path/to/your/certificate.crt;
    # ssl_certificate_key /path/to/your/private.key;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全標頭
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # PWA 支援
    location /manifest.json {
        add_header Content-Type application/manifest+json;
        add_header Cache-Control "public, max-age=86400";
    }
    
    location /sw.js {
        add_header Content-Type text/javascript;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed /;
    }
    
    location /icons/ {
        add_header Cache-Control "public, max-age=31536000";
    }
    
    # 靜態文件服務
    root /path/to/pokerhost-production;
    index index.html;
    
    # SPA 路由支援
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# 創建部署說明文件
cat > "$DEPLOY_DIR/DEPLOYMENT_GUIDE.md" << 'EOF'
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
EOF

echo ""
echo "✅ 生產環境部署包已創建！"
echo ""
echo "📁 部署目錄: $DEPLOY_DIR/"
echo "📋 包含文件:"
echo "   • 完整的 PWA 應用程式"
echo "   • 生產環境伺服器 (production-server.js)"
echo "   • Nginx 配置文件 (nginx.conf)"
echo "   • 部署指南 (DEPLOYMENT_GUIDE.md)"
echo ""
echo "🚀 下一步："
echo "   1. 將 $DEPLOY_DIR/ 目錄上傳到您的伺服器"
echo "   2. 按照 DEPLOYMENT_GUIDE.md 中的步驟進行部署"
echo "   3. 配置 SSL 證書"
echo "   4. 啟動應用程式"
echo ""
echo "🌐 部署完成後，您的 PWA 將在 https://pokerhost.com 上運行！"

