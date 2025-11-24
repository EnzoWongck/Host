@echo off
REM Windows 啟動腳本 - 完整開發模式（包含 WebSocket 伺服器）

echo 🚀 啟動完整開發模式...
echo 🌐 Web 應用程式 + WebSocket 伺服器
echo 🔄 檔案修改時會自動重載
echo ⏹️  按 Ctrl+C 停止
echo.

REM 檢查 node_modules 是否存在
if not exist "node_modules" (
    echo 📦 正在安裝依賴...
    call npm install
)

REM 啟動開發模式（同時啟動伺服器和 Expo）
echo 🔄 啟動開發伺服器...
call npm run dev

pause

