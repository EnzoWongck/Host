@echo off
REM 部署到 www.host27o.com 的批處理文件

echo 🚀 開始部署到 www.host27o.com...
echo.

REM 運行 PowerShell 部署腳本
powershell.exe -ExecutionPolicy Bypass -File "deploy-host27o.ps1"

pause












