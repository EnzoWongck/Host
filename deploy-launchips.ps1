# Vercel 部署腳本 (PowerShell)
# 用於部署到 lunchips.com

Write-Host "🚀 準備部署到 Vercel (lunchips.com)..." -ForegroundColor Green
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

# 4. 構建應用程式
Write-Host ""
Write-Host "🔨 構建 Web 應用程式..." -ForegroundColor Cyan
if (Test-Path "dist") {
    Write-Host "清理舊的構建文件..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist"
}
npx expo export --platform web

if (-not (Test-Path "dist")) {
    Write-Host "❌ 構建失敗，dist 目錄未創建" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 構建完成" -ForegroundColor Green

# 5. 複製必要文件到 dist（如果需要的話）
if (Test-Path "public\manifest.json") {
    Copy-Item "public\manifest.json" "dist\manifest.json" -Force
    Write-Host "✅ 已複製 manifest.json" -ForegroundColor Green
}
if (Test-Path "public\sw.js") {
    Copy-Item "public\sw.js" "dist\sw.js" -Force
    Write-Host "✅ 已複製 sw.js" -ForegroundColor Green
}
if (Test-Path "public\icons") {
    Copy-Item -Recurse "public\icons" "dist\" -Force
    Write-Host "✅ 已複製 icons 目錄" -ForegroundColor Green
}

# 6. 更新 manifest.json 中的 URL 為 lunchips.com
Write-Host ""
Write-Host "🔧 更新 manifest.json 為 lunchips.com..." -ForegroundColor Cyan
if (Test-Path "dist\manifest.json") {
    # 備份原文件
    Copy-Item "dist\manifest.json" "dist\manifest.json.backup" -Force
    
    # 讀取並更新內容
    $manifestContent = Get-Content "dist\manifest.json" -Raw -Encoding UTF8
    $manifestContent = $manifestContent -replace "http://localhost:\d+", "https://lunchips.com"
    $manifestContent = $manifestContent -replace "https://host27o.com", "https://lunchips.com"
    $manifestContent = $manifestContent -replace "https://launchips.com", "https://lunchips.com"
    $manifestContent = $manifestContent -replace '"start_url": "/"', '"start_url": "https://lunchips.com/"'
    $manifestContent = $manifestContent -replace '"start_url": ".*?"', '"start_url": "https://lunchips.com/"'
    $manifestContent = $manifestContent -replace '"scope": "/"', '"scope": "https://lunchips.com/"'
    $manifestContent = $manifestContent -replace '"scope": ".*?"', '"scope": "https://lunchips.com/"'
    
    # 寫回文件
    [System.IO.File]::WriteAllText("$PWD\dist\manifest.json", $manifestContent, [System.Text.Encoding]::UTF8)
    Write-Host "✅ manifest.json 已更新為 lunchips.com" -ForegroundColor Green
} else {
    Write-Host "⚠️  manifest.json 不存在，將在構建後創建" -ForegroundColor Yellow
}

# 7. 更新 HTML 文件中的 meta 標籤和 URL
Write-Host "🔧 更新 HTML meta 標籤為 lunchips.com..." -ForegroundColor Cyan
if (Test-Path "dist\index.html") {
    # 備份原文件
    Copy-Item "dist\index.html" "dist\index.html.backup" -Force
    
    # 讀取並更新內容
    $htmlContent = Get-Content "dist\index.html" -Raw -Encoding UTF8
    
    # 更新所有 localhost 和 host27o.com 為 lunchips.com
    $htmlContent = $htmlContent -replace "http://localhost:\d+", "https://lunchips.com"
    $htmlContent = $htmlContent -replace "https://host27o.com", "https://lunchips.com"
    $htmlContent = $htmlContent -replace "https://launchips.com", "https://lunchips.com"
    
    # 更新 Open Graph 和 Twitter 標籤
    $htmlContent = $htmlContent -replace 'property="og:url" content="[^"]*"', 'property="og:url" content="https://lunchips.com"'
    $htmlContent = $htmlContent -replace 'name="twitter:url" content="[^"]*"', 'name="twitter:url" content="https://lunchips.com"'
    
    # 檢查是否已包含 resolveAssetSource polyfill，如果沒有則添加
    if ($htmlContent -notmatch "resolveAssetSourcePolyfill") {
        $polyfillScript = @"
    <!-- resolveAssetSource Polyfill - 必須在所有腳本之前執行 -->
    <script>
    (function() {
      'use strict';
      // 全局 polyfill 函數
      window.resolveAssetSourcePolyfill = function() {
        try {
          // 方法 1：嘗試通過全局對象訪問（處理編譯後的 u.default）
          if (typeof window !== 'undefined') {
            // 設置一個全局的 resolveAssetSource 函數
            window.__resolveAssetSource = function(source) {
              return source;
            };
          }
          
          // 方法 2：嘗試補 Image 對象（如果已經存在）
          if (typeof Image !== 'undefined') {
            Image.resolveAssetSource = function(source) { return source; };
            if (!Image.default) {
              Image.default = Image;
            } else {
              Image.default.resolveAssetSource = function(source) { return source; };
            }
          }
          
          // 方法 3：使用 Object.defineProperty 攔截（更激進的方法）
          try {
            var originalDefineProperty = Object.defineProperty;
            Object.defineProperty = function(obj, prop, descriptor) {
              if (prop === 'resolveAssetSource' && obj && typeof obj === 'object') {
                obj.resolveAssetSource = function(source) { return source; };
                if (!obj.default) {
                  obj.default = obj;
                } else {
                  obj.default.resolveAssetSource = function(source) { return source; };
                }
              }
              return originalDefineProperty.call(this, obj, prop, descriptor);
            };
          } catch(e) {}
          
          console.log('resolveAssetSource polyfill 已強制載入（HTML注入）');
        } catch(e) {
          console.warn('Polyfill setup failed:', e);
        }
      };
      
      // 立即執行
      window.resolveAssetSourcePolyfill();
      
      // DOMContentLoaded 時再執行一次
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.resolveAssetSourcePolyfill);
      } else {
        setTimeout(window.resolveAssetSourcePolyfill, 0);
      }
      
      // 額外保護：在 window.load 時再執行一次
      window.addEventListener('load', function() {
        setTimeout(window.resolveAssetSourcePolyfill, 100);
      });
    })();
    </script>
    
"@
        # 在 <head> 標籤後立即添加 polyfill（必須在所有其他腳本之前）
        $htmlContent = $htmlContent -replace "(<head>)", "`$1`n$polyfillScript"
        Write-Host "✅ resolveAssetSource polyfill 已添加到 index.html" -ForegroundColor Green
    } else {
        Write-Host "✅ resolveAssetSource polyfill 已存在於 index.html" -ForegroundColor Green
    }
    
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
        Write-Host "✅ Google Analytics 已添加到 index.html" -ForegroundColor Green
    } else {
        Write-Host "✅ Google Analytics 已存在於 index.html" -ForegroundColor Green
    }
    
    # 寫回文件
    [System.IO.File]::WriteAllText("$PWD\dist\index.html", $htmlContent, [System.Text.Encoding]::UTF8)
    Write-Host "✅ HTML meta 標籤已更新為 lunchips.com" -ForegroundColor Green
} else {
    Write-Host "❌ index.html 不存在" -ForegroundColor Red
    exit 1
}

# 8. 部署到 Vercel
Write-Host ""
Write-Host "🚀 開始部署到 Vercel..." -ForegroundColor Cyan
Write-Host "提示：如果這是第一次部署，Vercel 會詢問專案設置" -ForegroundColor Yellow
    Write-Host "建議專案名稱：lunchips" -ForegroundColor Yellow
    Write-Host ""
    
    # 部署命令
    vercel --prod --yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 部署成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 下一步：" -ForegroundColor Yellow
        Write-Host "1. 前往 Vercel 控制台: https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. 選擇或創建專案 'lunchips'" -ForegroundColor White
        Write-Host "3. 點擊 Settings > Domains" -ForegroundColor White
        Write-Host "4. 添加域名: lunchips.com 和 www.lunchips.com" -ForegroundColor White
        Write-Host "5. 按照指示配置 DNS：" -ForegroundColor White
        Write-Host "   - 方式 1（推薦）：使用 Vercel Nameserver" -ForegroundColor Cyan
        Write-Host "     在域名註冊商將 Nameserver 改為 Vercel 提供的地址" -ForegroundColor Cyan
        Write-Host "   - 方式 2：手動配置 DNS 記錄" -ForegroundColor Cyan
        Write-Host "     CNAME www → cname.vercel-dns.com" -ForegroundColor Cyan
        Write-Host "     A @ → 76.76.21.21" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🌐 部署完成後訪問: https://lunchips.com" -ForegroundColor Green
        Write-Host "🔍 測試 API: https://lunchips.com/api/health" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏱️  DNS 傳播時間：5-30 分鐘（可能需要更長）" -ForegroundColor Yellow
        Write-Host "💡 使用 https://dnschecker.org/ 檢查全球 DNS 傳播狀態" -ForegroundColor Yellow
    } else {
    Write-Host ""
    Write-Host "❌ 部署失敗，請檢查錯誤訊息" -ForegroundColor Red
    exit 1
}

