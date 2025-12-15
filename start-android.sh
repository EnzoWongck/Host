#!/bin/bash

# 獲取腳本所在目錄（專案根目錄）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 檢查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "正在安裝依賴..."
    npm install
fi

# 啟動 Android 模擬器
echo "正在啟動 Android 模擬器..."
npx expo start --android
