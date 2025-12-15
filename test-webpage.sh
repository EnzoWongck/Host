#!/bin/bash

echo "🧪 測試 Poker Host PWA 網頁..."

# 檢查伺服器是否運行
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ 伺服器未運行，請先啟動伺服器："
    echo "   node server.js"
    exit 1
fi

echo "✅ 伺服器正在運行"

# 檢查主要文件
echo "📋 檢查 PWA 文件..."

files=(
    "http://localhost:3000/"
    "http://localhost:3000/manifest.json"
    "http://localhost:3000/sw.js"
    "http://localhost:3000/icons/icon-192x192.png"
)

for file in "${files[@]}"; do
    if curl -s -I "$file" | grep -q "200 OK"; then
        echo "✅ $file"
    else
        echo "❌ $file"
    fi
done

echo ""
echo "🎯 測試完成！"
echo ""
echo "📱 現在您可以："
echo "   1. 在電腦瀏覽器中訪問: http://localhost:3000"
echo "   2. 在手機上訪問: http://[您的IP]:3000"
echo "   3. 使用 Safari 的「加入主畫面」功能安裝為 PWA"
echo ""
echo "🔧 如需測試 PWA 功能，訪問: http://localhost:3000/pwa-test.html"

