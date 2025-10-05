#!/bin/bash

# Poker Host PWA 啟動腳本
echo "🎯 啟動 Poker Host PWA..."

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js"
    exit 1
fi

# 檢查是否存在 dist 目錄
if [ ! -d "dist" ]; then
    echo "❌ dist 目錄不存在，請先執行 expo export:web"
    exit 1
fi

# 檢查是否存在必要的 PWA 文件
required_files=("dist/manifest.json" "dist/sw.js" "dist/icons/icon-192x192.png")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
done

echo "✅ PWA 文件檢查完成"

# 啟動伺服器
echo "🚀 啟動 PWA 伺服器..."
echo "📱 應用程式將在 http://localhost:3000 上運行"
echo "🧪 PWA 測試頁面: http://localhost:3000/pwa-test.html"
echo ""
echo "📋 PWA 功能說明："
echo "   • 支援離線使用"
echo "   • 可添加到手機主畫面（iOS Safari 自動支援）"
echo "   • 快取策略優化"
echo "   • 推送通知支援"
echo ""
echo "📱 在手機上安裝："
echo "   1. 確保手機和電腦在同一網路"
echo "   2. 在手機 Safari 中訪問 http://[您的IP]:3000"
echo "   3. 點擊分享按鈕 → '加入主畫面'（iOS 原生功能）"
echo ""
echo "⏹️  按 Ctrl+C 停止伺服器"
echo ""

# 啟動伺服器
node server.js
