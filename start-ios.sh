#!/bin/bash

# 進入專案目錄
cd /Users/kwokheitung/Desktop/Host.2/PokerHost

# 檢查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "正在安裝依賴..."
    npm install
fi

# 啟動 iOS 模擬器
echo "正在啟動 iOS 模擬器..."
npx expo start --ios
