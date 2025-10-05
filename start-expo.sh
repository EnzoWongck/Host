#!/bin/bash

# 進入專案目錄
cd /Users/kwokheitung/Desktop/Host.2/PokerHost

# 檢查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "正在安裝依賴..."
    npm install
fi

# 檢查參數
if [ "$1" = "ios" ]; then
    echo "正在啟動 iOS 模擬器..."
    npm run ios
elif [ "$1" = "android" ]; then
    echo "正在啟動 Android 模擬器..."
    npm run android
elif [ "$1" = "web" ]; then
    echo "正在啟動網頁版本..."
    npm run web
else
    echo "正在啟動 Expo 開發伺服器..."
    echo "使用方式："
    echo "  ./start-expo.sh        - 啟動開發伺服器"
    echo "  ./start-expo.sh ios    - 在 iOS 模擬器中啟動"
    echo "  ./start-expo.sh android - 在 Android 模擬器中啟動"
    echo "  ./start-expo.sh web    - 在網頁瀏覽器中啟動"
    npm start
fi
