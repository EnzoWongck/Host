#!/bin/bash

# 統一自動重載開發腳本
# 提供選項來選擇開發平台並啟用自動重載

echo "🚀 撲克牌主機 - 自動重載開發模式"
echo "=================================="
echo "請選擇開發平台："
echo "1) iOS 模擬器 (推薦)"
echo "2) Android 模擬器"
echo "3) Web 瀏覽器"
echo "4) 所有平台 (Expo Go)"
echo ""
read -p "請輸入選項 (1-4): " choice

case $choice in
    1)
        echo "📱 啟動 iOS 模擬器自動重載..."
        ./auto-reload.sh
        ;;
    2)
        echo "🤖 啟動 Android 模擬器自動重載..."
        ./auto-reload-android.sh
        ;;
    3)
        echo "🌐 啟動 Web 瀏覽器自動重載..."
        ./auto-reload-web.sh
        ;;
    4)
        echo "📱 啟動所有平台..."
        npx expo start --clear
        ;;
    *)
        echo "❌ 無效選項，請重新執行腳本"
        exit 1
        ;;
esac





