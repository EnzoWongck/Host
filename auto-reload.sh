#!/bin/bash

# 自動重載腳本
# 監控檔案變化並自動重啟應用程式

echo "🚀 啟動自動重載監控..."
echo "📁 監控目錄: $(pwd)/src"
echo "📱 目標平台: iOS 模擬器"
echo "⏹️  按 Ctrl+C 停止監控"
echo ""

# 檢查是否已安裝 nodemon
if ! command -v nodemon &> /dev/null; then
    echo "📦 正在安裝 nodemon..."
    npm install -g nodemon
fi

# 使用 nodemon 監控 src 目錄的變化
nodemon --watch src --ext ts,tsx,js,jsx --exec "echo '🔄 檔案已修改，正在重啟應用程式...' && pkill -f expo && sleep 2 && npx expo start --ios --clear" --ignore "node_modules" --ignore "dist" --ignore "*.log"





