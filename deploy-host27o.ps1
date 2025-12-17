# Poker Host 部署到 host27o.com 腳本 (PowerShell)
# 用於 Windows 環境

Write-Host "🚀 部署 Poker Host 到 www.host27o.com..." -ForegroundColor Green
Write-Host ""

# 檢查 Node.js 是否安裝
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安裝，請先安裝 Node.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js 已安裝: $(node --version)" -ForegroundColor Green

# 設置域名
$DOMAIN = "www.host27o.com"
$DOMAIN_WITHOUT_WWW = "host27o.com"

# 檢查是否存在 dist 目錄
if (-not (Test-Path "dist")) {
    Write-Host "❌ dist 目錄不存在，正在構建應用程式..." -ForegroundColor Yellow
    Write-Host "執行: npx expo export --platform web" -ForegroundColor Cyan
    npx expo export --platform web
    
    if (-not (Test-Path "dist")) {
        Write-Host "❌ 構建失敗，dist 目錄未創建" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 構建完成" -ForegroundColor Green
}

# 檢查必要的文件
$requiredFiles = @(
    "dist\index.html",
    "dist\manifest.json"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ 缺少必要文件:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host "請先運行構建命令: npx expo export --platform web" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 必要文件檢查完成" -ForegroundColor Green

# 更新 manifest.json 為生產環境網址
Write-Host ""
Write-Host "🔧 更新 manifest.json 為生產環境網址..." -ForegroundColor Cyan

if (Test-Path "dist\manifest.json") {
    # 備份原文件
    Copy-Item "dist\manifest.json" "dist\manifest.json.backup" -Force
    
    # 讀取並更新內容
    $manifestContent = Get-Content "dist\manifest.json" -Raw -Encoding UTF8
    $manifestContent = $manifestContent -replace "http://localhost:\d+", "https://$DOMAIN"
    $manifestContent = $manifestContent -replace "https://pokerhost.com", "https://$DOMAIN"
    $manifestContent = $manifestContent -replace '"start_url": "/"', "`"start_url`": `"https://$DOMAIN/`""
    $manifestContent = $manifestContent -replace '"scope": "/"', "`"scope`": `"https://$DOMAIN/`""
    
    # 寫回文件
    [System.IO.File]::WriteAllText("$PWD\dist\manifest.json", $manifestContent, [System.Text.Encoding]::UTF8)
    
    Write-Host "✅ manifest.json 已更新為 https://$DOMAIN" -ForegroundColor Green
} else {
    Write-Host "❌ manifest.json 不存在" -ForegroundColor Red
    exit 1
}

# 更新 HTML 文件中的 meta 標籤
Write-Host "🔧 更新 HTML meta 標籤..." -ForegroundColor Cyan

if (Test-Path "dist\index.html") {
    # 備份原文件
    Copy-Item "dist\index.html" "dist\index.html.backup" -Force
    
    # 讀取並更新內容
    $htmlContent = Get-Content "dist\index.html" -Raw -Encoding UTF8
    $htmlContent = $htmlContent -replace "http://localhost:\d+", "https://$DOMAIN"
    $htmlContent = $htmlContent -replace "https://pokerhost.com", "https://$DOMAIN"
    $htmlContent = $htmlContent -replace "pokerhost.com", $DOMAIN_WITHOUT_WWW
    
    # 確保包含 Google Analytics
    if ($htmlContent -notmatch "googletagmanager.com/gtag/js") {
        $googleAnalytics = @"
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-F4S72NL76B"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-F4S72NL76B');
    </script>
    
"@
        # 在 <head> 標籤後添加 Google Analytics
        $htmlContent = $htmlContent -replace "(<head>)", "`$1`n$googleAnalytics"
    }
    
    # 寫回文件
    [System.IO.File]::WriteAllText("$PWD\dist\index.html", $htmlContent, [System.Text.Encoding]::UTF8)
    
    Write-Host "✅ HTML meta 標籤已更新，Google Analytics 已添加" -ForegroundColor Green
} else {
    Write-Host "❌ index.html 不存在" -ForegroundColor Red
    exit 1
}

# 創建部署目錄
$DEPLOY_DIR = "host27o-production"
if (Test-Path $DEPLOY_DIR) {
    Write-Host ""
    Write-Host "🗑️  清理舊的部署目錄..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $DEPLOY_DIR
}

Write-Host "📁 創建生產環境部署目錄..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $DEPLOY_DIR -Force | Out-Null

# 複製 dist 目錄內容
Write-Host "📋 複製文件到部署目錄..." -ForegroundColor Cyan
Copy-Item -Recurse -Force dist\* $DEPLOY_DIR\

# 創建 nginx 配置文件
Write-Host "🔧 創建 Nginx 配置文件..." -ForegroundColor Cyan
$nginxConfig = @"
# Nginx 配置 for $DOMAIN
server {
    listen 80;
    server_name $DOMAIN_WITHOUT_WWW $DOMAIN;
    return 301 https://`$server_name`$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_WITHOUT_WWW $DOMAIN;
    
    # SSL 證書配置（使用 Let's Encrypt 或自定義證書）
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN_WITHOUT_WWW/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_WITHOUT_WWW/privkey.pem;
    
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
    
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000";
    }
    
    # 靜態文件服務
    root /var/www/host27o-production;
    index index.html;
    
    # SPA 路由支援
    location / {
        try_files `$uri `$uri/ /index.html;
    }
    
    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
"@
[System.IO.File]::WriteAllText("$PWD\$DEPLOY_DIR\nginx.conf", $nginxConfig, [System.Text.Encoding]::UTF8)
Write-Host "✅ 已創建 nginx.conf" -ForegroundColor Green

# 創建部署說明文件
$deployGuide = @"
# Poker Host 部署到 www.host27o.com 指南

## 📋 部署前準備

1. **域名配置**
   - 確保 $DOMAIN_WITHOUT_WWW 和 $DOMAIN 域名已購買並配置 DNS
   - 設置 A 記錄指向您的伺服器 IP：
     - @ (或留空) → 您的伺服器 IP
     - www → 您的伺服器 IP

2. **SSL 證書**
   - 使用 Let's Encrypt（免費，推薦）
   - 或購買 SSL 證書

3. **伺服器環境**
   - Ubuntu/CentOS 伺服器
   - Node.js 18+ 已安裝
   - Nginx 已安裝並配置
   - 防火牆已開放 80, 443 端口

## 🚀 部署步驟

### 1. 上傳文件到伺服器

使用 SCP 或 FTP 工具將整個 host27o-production 目錄上傳到伺服器：

\`\`\`bash
# 使用 SCP
scp -r host27o-production/ user@your-server-ip:/var/www/

# 或使用 SFTP/FTP 工具（如 FileZilla）
\`\`\`

### 2. SSH 連接到伺服器

\`\`\`bash
ssh user@your-server-ip
cd /var/www/host27o-production
\`\`\`

### 3. 配置 Nginx

\`\`\`bash
# 複製 Nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/$DOMAIN_WITHOUT_WWW

# 編輯配置文件（更新 root 路徑）
sudo nano /etc/nginx/sites-available/$DOMAIN_WITHOUT_WWW
# 確保 root 路徑正確：root /var/www/host27o-production;

# 啟用站點
sudo ln -s /etc/nginx/sites-available/$DOMAIN_WITHOUT_WWW /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重載 Nginx
sudo systemctl reload nginx
\`\`\`

### 4. 設置 SSL 證書（Let's Encrypt）

\`\`\`bash
# 安裝 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 獲取 SSL 證書（自動配置 Nginx）
sudo certbot --nginx -d $DOMAIN_WITHOUT_WWW -d $DOMAIN

# 測試自動續期
sudo certbot renew --dry-run
\`\`\`

### 5. 驗證部署

訪問以下 URL 確認部署成功：
- https://$DOMAIN_WITHOUT_WWW
- https://$DOMAIN
- https://$DOMAIN/manifest.json
- https://$DOMAIN/sw.js

## 🔧 維護命令

\`\`\`bash
# 重啟 Nginx
sudo systemctl restart nginx

# 查看 Nginx 日誌
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 更新 SSL 證書
sudo certbot renew

# 測試 Nginx 配置
sudo nginx -t
\`\`\`

## 📊 監控建議

- 設置 SSL 證書到期提醒
- 監控伺服器資源使用
- 設置 Nginx 日誌監控
- 定期備份文件

## ✅ 部署檢查清單

- [ ] DNS 記錄已正確設置
- [ ] 文件已上傳到伺服器
- [ ] Nginx 配置已更新並重載
- [ ] SSL 證書已安裝並有效
- [ ] HTTP 自動重定向到 HTTPS
- [ ] 網站可以正常訪問
- [ ] PWA manifest 可以正常載入
- [ ] Service Worker 可以正常註冊

---

部署完成後，您的應用將在 https://$DOMAIN 上運行！

**部署時間**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@
[System.IO.File]::WriteAllText("$PWD\$DEPLOY_DIR\DEPLOYMENT_GUIDE.md", $deployGuide, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "✅ 生產環境部署包已創建！" -ForegroundColor Green
Write-Host ""
Write-Host "📁 部署目錄: $DEPLOY_DIR\" -ForegroundColor Cyan
Write-Host "📋 包含文件:" -ForegroundColor Cyan
Write-Host "   • 完整的 PWA 應用程式" -ForegroundColor White
Write-Host "   • Nginx 配置文件 (nginx.conf)" -ForegroundColor White
Write-Host "   • 部署指南 (DEPLOYMENT_GUIDE.md)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 下一步：" -ForegroundColor Yellow
Write-Host "   1. 將 $DEPLOY_DIR\ 目錄上傳到您的伺服器" -ForegroundColor White
Write-Host "   2. 按照 DEPLOYMENT_GUIDE.md 中的步驟進行部署" -ForegroundColor White
Write-Host "   3. 配置 DNS 記錄指向伺服器 IP" -ForegroundColor White
Write-Host "   4. 設置 SSL 證書（使用 Let's Encrypt）" -ForegroundColor White
Write-Host "   5. 訪問 https://$DOMAIN 驗證部署" -ForegroundColor White
Write-Host ""
Write-Host "🌐 部署完成後，您的應用將在 https://$DOMAIN 上運行！" -ForegroundColor Green
Write-Host ""












