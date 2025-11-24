@echo off
REM Windows 啟動腳本 - Web 版本
REM 使用 Expo 的內建熱重載功能

echo 🚀 啟動開發模式 (Web)...
echo 🌐 將在網頁瀏覽器中開啟應用程式
echo 🔄 檔案修改時會自動重載
echo ⏹️  按 Ctrl+C 停止
echo.

REM 檢查 node_modules 是否存在
if not exist "node_modules" (
    echo 📦 正在安裝依賴...
    call npm install
)

REM 啟動 Expo 開發伺服器，啟用熱重載
echo 🔄 啟動 Expo 開發伺服器...
call npx expo start --web --clear

pause

