#!/bin/bash

# 預覽 README.md 的腳本

echo "🚀 啟動 README 預覽伺服器..."
echo "📖 將在瀏覽器中打開 README.md 的渲染效果"
echo "🌐 訪問地址: http://localhost:8000/preview-readme.html"
echo "⏹️  按 Ctrl+C 停止"
echo ""

# 檢查 Python 版本
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ 錯誤：未找到 Python，請先安裝 Python"
    exit 1
fi

# 啟動簡單 HTTP 伺服器
cd "$(dirname "$0")"
$PYTHON_CMD -m http.server 8000





