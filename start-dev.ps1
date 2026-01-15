# PowerShell 啟動腳本 - 完整開發模式（包含 WebSocket 伺服器）

Write-Host "🚀 啟動完整開發模式..." -ForegroundColor Green
Write-Host "🌐 Web 應用程式 + WebSocket 伺服器" -ForegroundColor Cyan
Write-Host "🔄 檔案修改時會自動重載" -ForegroundColor Yellow
Write-Host "⏹️  按 Ctrl+C 停止" -ForegroundColor Red
Write-Host ""

# 檢查 node_modules 是否存在
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 正在安裝依賴..." -ForegroundColor Yellow
    npm install
}

# 啟動開發模式（同時啟動伺服器和 Expo）
Write-Host "🔄 啟動開發伺服器..." -ForegroundColor Cyan
npm run dev




