@echo off
REM 使用隧道模式啟動 Expo（推薦用於手機訪問）
REM 隧道模式可以穿透防火牆和網絡限制

echo 🚀 啟動開發模式 (Web - 隧道模式)...
echo 🌐 使用 Expo 隧道，手機可以通過互聯網訪問
echo 🔄 檔案修改時會自動重載
echo ⏹️  按 Ctrl+C 停止
echo.
echo 💡 隧道模式會顯示一個 exp:// 開頭的 URL
echo    可以在 Expo Go 中掃描 QR 碼，或在瀏覽器中訪問 Web URL
echo.

REM 啟動 Expo 開發伺服器，使用隧道模式
call npx expo start --web --tunnel --clear

pause











