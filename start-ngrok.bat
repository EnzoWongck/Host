@echo off
REM 使用 ngrok 建立隧道（如果 Expo 隧道無法使用）

echo 🚀 啟動 ngrok 隧道...
echo 🌐 這會創建一個公共 URL，手機可以通過互聯網訪問
echo ⏹️  按 Ctrl+C 停止
echo.

REM 檢查 ngrok 是否存在
if exist "bin\ngrok.exe" (
    echo 使用本地 ngrok...
    bin\ngrok.exe http 19000
) else if exist "bin\ngrok" (
    echo 使用本地 ngrok...
    bin\ngrok http 19000
) else (
    echo ❌ 未找到 ngrok
    echo.
    echo 請先：
    echo 1. 訪問 https://ngrok.com/ 註冊帳戶
    echo 2. 下載 ngrok 並解壓到 bin\ 目錄
    echo 3. 運行: ngrok config add-authtoken YOUR_TOKEN
    echo.
    pause
    exit /b 1
)

pause











