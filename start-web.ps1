# PowerShell 啟動腳本 - Web 版本
# 使用 Expo 的內建熱重載功能

Write-Host "🚀 啟動開發模式 (Web)..." -ForegroundColor Green
Write-Host "🌐 將在網頁瀏覽器中開啟應用程式" -ForegroundColor Cyan
Write-Host "🔄 檔案修改時會自動重載" -ForegroundColor Yellow
Write-Host "⏹️  按 Ctrl+C 停止" -ForegroundColor Red
Write-Host ""

# 檢查 node_modules 是否存在
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 正在安裝依賴..." -ForegroundColor Yellow
    npm install
}

# 啟動 Expo 開發伺服器，啟用熱重載和 LAN 模式（手機可訪問）
Write-Host "🔄 啟動 Expo 開發伺服器 (LAN 模式)..." -ForegroundColor Cyan
Write-Host "📱 手機訪問：確保手機和電腦在同一 Wi-Fi 網絡" -ForegroundColor Yellow
Write-Host "🌐 終端會顯示本地 IP 地址，在手機瀏覽器中輸入該地址" -ForegroundColor Yellow
Write-Host ""
npx expo start --web --host lan --clear




