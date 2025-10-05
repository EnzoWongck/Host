#!/bin/bash

# 開發模式啟動腳本 (Android)
# 使用 Expo 的內建熱重載功能

echo "🚀 啟動開發模式 (Android)..."
echo "📱 將在 Android 模擬器中開啟應用程式"
echo "🔄 檔案修改時會自動重載"
echo "⏹️  按 Ctrl+C 停止"
echo ""

# 進入專案目錄
cd /Users/kwokheitung/Desktop/Host.2/PokerHost

# 檢查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 正在安裝依賴..."
    npm install
fi

# 啟動 Expo 開發伺服器，啟用熱重載
echo "🔄 啟動 Expo 開發伺服器..."
npx expo start --android --clear





