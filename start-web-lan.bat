@echo off
REM 使用 cmd 啟動 Web 服務器（LAN 模式），避免 PowerShell 執行策略問題

echo 🚀 啟動開發模式 (Web - LAN 模式)...
echo 🌐 手機可以通過局域網訪問
echo 🔄 檔案修改時會自動重載
echo ⏹️  按 Ctrl+C 停止
echo.

REM 啟動 Expo 開發伺服器，啟用 LAN 模式
call npx expo start --web --host lan --clear

pause












