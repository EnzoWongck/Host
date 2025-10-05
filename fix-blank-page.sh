#!/bin/bash

# 修復空白頁面問題的腳本
echo "🔧 修復空白頁面問題"
echo "=================================="
echo ""

# 檢查當前狀態
echo "📊 檢查當前狀態..."
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ 伺服器運行正常"
else
    echo "❌ 伺服器未運行"
    echo "請先啟動伺服器: node server-8080.js"
    exit 1
fi

echo ""
echo "🔍 診斷步驟："
echo ""

echo "1. 檢查 HTML 文件..."
if [ -f "dist/index.html" ]; then
    echo "✅ HTML 文件存在"
    if grep -q "id=\"root\"" dist/index.html; then
        echo "✅ root 元素存在"
    else
        echo "❌ root 元素不存在"
    fi
else
    echo "❌ HTML 文件不存在"
fi

echo ""
echo "2. 檢查 JavaScript 文件..."
JS_FILE="dist/_expo/static/js/web/AppEntry-43681ccde7f6b217a6ceca2983d97b3e.js"
if [ -f "$JS_FILE" ]; then
    echo "✅ JavaScript 文件存在"
    echo "文件大小: $(ls -lh "$JS_FILE" | awk '{print $5}')"
else
    echo "❌ JavaScript 文件不存在"
fi

echo ""
echo "3. 檢查 PWA 文件..."
if [ -f "dist/manifest.json" ]; then
    echo "✅ Manifest 文件存在"
else
    echo "❌ Manifest 文件不存在"
fi

if [ -f "dist/sw.js" ]; then
    echo "✅ Service Worker 文件存在"
else
    echo "❌ Service Worker 文件不存在"
fi

echo ""
echo "🔧 修復方案："
echo ""

echo "方案 1: 清除瀏覽器快取"
echo "1. 按 Cmd+Shift+R (Mac) 強制重新載入"
echo "2. 或按 Cmd+Shift+Delete 清除快取"
echo ""

echo "方案 2: 檢查瀏覽器開發者工具"
echo "1. 按 F12 打開開發者工具"
echo "2. 查看 Console 標籤的錯誤信息"
echo "3. 查看 Network 標籤的載入狀態"
echo ""

echo "方案 3: 嘗試不同的瀏覽器"
echo "• Safari"
echo "• Chrome"
echo "• Firefox"
echo ""

echo "方案 4: 重新構建應用程式"
echo "1. 停止當前伺服器 (Ctrl+C)"
echo "2. 運行: npx expo export"
echo "3. 重新啟動伺服器: node server-8080.js"
echo ""

echo "🧪 測試頁面："
echo "• 簡單測試: http://localhost:8080/simple-test.html"
echo "• 診斷頁面: http://localhost:8080/debug.html"
echo "• 主應用程式: http://localhost:8080"
echo ""

echo "📱 手機測試："
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "• 簡單測試: http://$LOCAL_IP:8080/simple-test.html"
echo "• 診斷頁面: http://$LOCAL_IP:8080/debug.html"
echo "• 主應用程式: http://$LOCAL_IP:8080"
echo ""

echo "🎯 建議操作順序："
echo "1. 先訪問簡單測試頁面確認基本功能"
echo "2. 檢查瀏覽器開發者工具的錯誤信息"
echo "3. 嘗試清除快取和重新載入"
echo "4. 如果還是不行，重新構建應用程式"
echo ""

echo "📞 如果問題仍然存在，請告訴我："
echo "• 瀏覽器開發者工具顯示的錯誤信息"
echo "• 使用的是哪個瀏覽器"
echo "• 簡單測試頁面是否能正常顯示"

