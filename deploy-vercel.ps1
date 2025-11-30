# Vercel 部署腳本 (PowerShell)
# 用於部署到 host27o.com

Write-Host "🚀 準備部署到 Vercel (host27o.com)..." -ForegroundColor Green
Write-Host ""

# 1. 檢查是否在專案根目錄
if (-not (Test-Path "app.json")) {
    Write-Host "❌ 錯誤：請在專案根目錄執行此腳本" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 確認在專案根目錄" -ForegroundColor Green

# 2. 檢查 Vercel CLI 是否安裝
Write-Host "檢查 Vercel CLI..." -ForegroundColor Cyan
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "正在安裝 Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel@latest
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Vercel CLI 安裝失敗" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Vercel CLI 已安裝" -ForegroundColor Green

# 3. 檢查是否已登入
Write-Host ""
Write-Host "檢查 Vercel 登入狀態..." -ForegroundColor Cyan
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  尚未登入 Vercel，請執行: vercel login" -ForegroundColor Yellow
    Write-Host "執行登入..." -ForegroundColor Cyan
    vercel login
}

# 4. 確保 dist 目錄存在
if (-not (Test-Path "dist")) {
    Write-Host "構建應用程式..." -ForegroundColor Cyan
    npx expo export --platform web
    if (-not (Test-Path "dist")) {
        Write-Host "❌ 構建失敗" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ 構建文件已準備" -ForegroundColor Green

# 5. 複製必要文件到 dist（如果需要的話）
if (Test-Path "public\manifest.json") {
    Copy-Item "public\manifest.json" "dist\manifest.json" -Force
}
if (Test-Path "public\sw.js") {
    Copy-Item "public\sw.js" "dist\sw.js" -Force
}
if (Test-Path "public\icons") {
    Copy-Item -Recurse "public\icons" "dist\" -Force
}

# 6. 更新 manifest.json 中的 URL
if (Test-Path "dist\manifest.json") {
    $manifest = Get-Content "dist\manifest.json" -Raw | ConvertFrom-Json
    $manifest.start_url = "https://host27o.com/"
    $manifest.scope = "https://host27o.com/"
    $manifest | ConvertTo-Json -Depth 10 | Set-Content "dist\manifest.json" -Encoding UTF8
    Write-Host "✅ manifest.json 已更新為 host27o.com" -ForegroundColor Green
}

# 6.5. 添加 Google Analytics 到 index.html
if (Test-Path "dist\index.html") {
    $htmlContent = Get-Content "dist\index.html" -Raw -Encoding UTF8
    
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
        [System.IO.File]::WriteAllText("$PWD\dist\index.html", $htmlContent, [System.Text.Encoding]::UTF8)
        Write-Host "✅ Google Analytics 已添加到 index.html" -ForegroundColor Green
    } else {
        Write-Host "✅ Google Analytics 已存在於 index.html" -ForegroundColor Green
    }
}

# 7. 部署到 Vercel
Write-Host ""
Write-Host "開始部署到 Vercel..." -ForegroundColor Cyan
Write-Host "提示：如果這是第一次部署，Vercel 會詢問專案設置" -ForegroundColor Yellow
Write-Host ""

# 部署命令
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 下一步：" -ForegroundColor Yellow
    Write-Host "1. 前往 Vercel 控制台: https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. 選擇專案 host27o" -ForegroundColor White
    Write-Host "3. 點擊 Settings > Domains" -ForegroundColor White
    Write-Host "4. 添加域名: host27o.com" -ForegroundColor White
    Write-Host "5. 按照指示配置 DNS：" -ForegroundColor White
    Write-Host "   - CNAME www → cname.vercel-dns.com" -ForegroundColor Cyan
    Write-Host "   - A @ → 76.76.21.21" -ForegroundColor Cyan
    Write-Host "   或使用 Vercel 自動 Nameserver" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 部署完成後訪問: https://host27o.com" -ForegroundColor Green
    Write-Host "🔍 測試 API: https://host27o.com/api/health" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 部署失敗，請檢查錯誤訊息" -ForegroundColor Red
    exit 1
}

