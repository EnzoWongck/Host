# Poker Host 生產環境部署腳本 (PowerShell)
# 用於 Windows 環境

Write-Host "🚀 部署 Poker Host 到生產環境..." -ForegroundColor Green
Write-Host ""

# 檢查 Node.js 是否安裝
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js 未安裝，請先安裝 Node.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js 已安裝: $(node --version)" -ForegroundColor Green

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

# 檢查必要的 PWA 文件
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
    $manifestContent = $manifestContent -replace "http://localhost:3000", "https://pokerhost.com"
    $manifestContent = $manifestContent -replace '"start_url": "/"', '"start_url": "https://pokerhost.com/"'
    $manifestContent = $manifestContent -replace '"scope": "/"', '"scope": "https://pokerhost.com/"'
    
    # 寫回文件
    [System.IO.File]::WriteAllText("$PWD\dist\manifest.json", $manifestContent, [System.Text.Encoding]::UTF8)
    
    Write-Host "✅ manifest.json 已更新" -ForegroundColor Green
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
    $htmlContent = $htmlContent -replace "http://localhost:3000", "https://pokerhost.com"
    
    # 檢查是否已包含 Google Analytics，如果沒有則添加
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
$DEPLOY_DIR = "pokerhost-production"
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

# 複製生產環境伺服器文件
if (Test-Path "production-server.js") {
    Copy-Item "production-server.js" $DEPLOY_DIR\ -Force
    Write-Host "✅ 已複製 production-server.js" -ForegroundColor Green
}

# 複製 nginx 配置文件
if (Test-Path "pokerhost-production\nginx.conf") {
    Write-Host "✅ nginx.conf 已存在" -ForegroundColor Green
} else {
    # 創建基本的 nginx 配置
    $nginxConfig = @"
server {
    listen 80;
    server_name pokerhost.com www.pokerhost.com;
    return 301 https://`$server_name`$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pokerhost.com www.pokerhost.com;
    
    # SSL 證書配置（需要替換為真實證書路徑）
    # ssl_certificate /path/to/certificate.crt;
    # ssl_certificate_key /path/to/private.key;
    
    root /var/www/pokerhost-production;
    index index.html;
    
    location / {
        try_files `$uri `$uri/ /index.html;
    }
    
    location /manifest.json {
        add_header Content-Type application/manifest+json;
    }
    
    location /sw.js {
        add_header Content-Type text/javascript;
        add_header Service-Worker-Allowed /;
    }
}
"@
    [System.IO.File]::WriteAllText("$PWD\$DEPLOY_DIR\nginx.conf", $nginxConfig, [System.Text.Encoding]::UTF8)
    Write-Host "✅ 已創建 nginx.conf" -ForegroundColor Green
}

# 創建部署說明文件
$deployGuide = @"
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
   - Node.js 18+ 已安裝
   - Nginx 已安裝並配置

## 🚀 部署步驟

### 1. 上傳文件
使用 SCP 或 FTP 工具將整個 pokerhost-production 目錄上傳到伺服器：
\`\`\`bash
scp -r pokerhost-production/ user@your-server:/var/www/
\`\`\`

### 2. 安裝依賴
\`\`\`bash
cd /var/www/pokerhost-production
npm install --production
\`\`\`

### 3. 配置 Nginx
\`\`\`bash
sudo cp nginx.conf /etc/nginx/sites-available/pokerhost.com
sudo ln -s /etc/nginx/sites-available/pokerhost.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

### 4. 設置 SSL 證書
\`\`\`bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d pokerhost.com -d www.pokerhost.com
\`\`\`

### 5. 啟動應用程式
\`\`\`bash
npm install -g pm2
pm2 start production-server.js --name pokerhost
pm2 startup
pm2 save
\`\`\`

## 📊 監控
- 使用 PM2 監控進程狀態
- 設置 Nginx 日誌監控
- 配置 SSL 證書到期提醒

部署完成後，您的 PWA 將在 https://pokerhost.com 上運行！
"@
[System.IO.File]::WriteAllText("$PWD\$DEPLOY_DIR\DEPLOYMENT_GUIDE.md", $deployGuide, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "✅ 生產環境部署包已創建！" -ForegroundColor Green
Write-Host ""
Write-Host "📁 部署目錄: $DEPLOY_DIR\" -ForegroundColor Cyan
Write-Host "📋 包含文件:" -ForegroundColor Cyan
Write-Host "   • 完整的 PWA 應用程式" -ForegroundColor White
Write-Host "   • 生產環境伺服器 (production-server.js)" -ForegroundColor White
Write-Host "   • Nginx 配置文件 (nginx.conf)" -ForegroundColor White
Write-Host "   • 部署指南 (DEPLOYMENT_GUIDE.md)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 下一步：" -ForegroundColor Yellow
Write-Host "   1. 將 $DEPLOY_DIR\ 目錄上傳到您的伺服器" -ForegroundColor White
Write-Host "   2. 按照 DEPLOYMENT_GUIDE.md 中的步驟進行部署" -ForegroundColor White
Write-Host "   3. 配置 SSL 證書" -ForegroundColor White
Write-Host "   4. 啟動應用程式" -ForegroundColor White
Write-Host ""
Write-Host "Deployment package created successfully!" -ForegroundColor Green
Write-Host "Your PWA will run at https://pokerhost.com after deployment" -ForegroundColor Green
Write-Host ""

