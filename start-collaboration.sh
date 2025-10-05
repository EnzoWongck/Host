#!/bin/bash

# 協作模式啟動腳本
echo "🚀 啟動協作模式..."

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: 未找到 Node.js，請先安裝 Node.js"
    exit 1
fi

# 檢查 npm 是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 錯誤: 未找到 npm，請先安裝 npm"
    exit 1
fi

# 安裝依賴
echo "📦 安裝依賴..."
npm install

# 啟動 WebSocket 服務器
echo "🌐 啟動 WebSocket 服務器..."
node websocket-server.js &
SERVER_PID=$!

# 等待服務器啟動
sleep 3

# 啟動 Expo 應用
echo "📱 啟動 Expo 應用..."
npx expo start --ios --localhost

# 清理函數
cleanup() {
    echo "🛑 正在關閉服務..."
    kill $SERVER_PID 2>/dev/null
    exit 0
}

# 設置信號處理
trap cleanup SIGINT SIGTERM

# 等待用戶中斷
wait





