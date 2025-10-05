#!/bin/bash

# 修復手機訪問問題的腳本
echo "🔧 修復手機無法訪問問題"
echo "=================================="
echo ""

# 獲取本地 IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📍 您的電腦 IP: $LOCAL_IP"
echo "📱 手機應該訪問: http://$LOCAL_IP:3000"
echo ""

# 檢查伺服器狀態
echo "🔍 診斷步驟："
echo ""

echo "1. 檢查伺服器是否運行..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 本地伺服器正常運行"
else
    echo "❌ 本地伺服器未運行"
    echo "請先運行: ./start-pwa.sh"
    exit 1
fi

echo ""
echo "2. 檢查伺服器綁定..."
NETSTAT_OUTPUT=$(netstat -an | grep ":3000" | grep LISTEN)
if echo "$NETSTAT_OUTPUT" | grep -q "0.0.0.0:3000"; then
    echo "✅ 伺服器已綁定到所有網路介面 (0.0.0.0:3000)"
elif echo "$NETSTAT_OUTPUT" | grep -q "127.0.0.1:3000"; then
    echo "❌ 伺服器只綁定到本地 (127.0.0.1:3000)"
    echo "這可能是問題所在！"
else
    echo "⚠️  無法確定伺服器綁定狀態"
fi

echo ""
echo "3. 測試網路連接..."
echo "嘗試從外部訪問..."

# 使用 telnet 測試端口是否開放
if command -v nc >/dev/null 2>&1; then
    if nc -z $LOCAL_IP 3000 2>/dev/null; then
        echo "✅ 端口 3000 可以從外部訪問"
    else
        echo "❌ 端口 3000 無法從外部訪問"
        echo "這可能是防火牆或路由器問題"
    fi
else
    echo "⚠️  無法測試端口連接（nc 命令不可用）"
fi

echo ""
echo "🔧 解決方案："
echo ""

echo "方案 1: 檢查防火牆設置"
echo "在終端機中運行以下命令："
echo "sudo pfctl -s rules"
echo ""

echo "方案 2: 暫時關閉防火牆（僅用於測試）"
echo "sudo pfctl -d"
echo "測試完成後重新啟用："
echo "sudo pfctl -e"
echo ""

echo "方案 3: 檢查路由器設置"
echo "1. 確保手機和電腦在同一網路"
echo "2. 檢查路由器是否阻止設備間通信"
echo "3. 嘗試重啟路由器"
echo ""

echo "方案 4: 使用不同的端口"
echo "如果 3000 端口被阻止，可以修改 server.js 使用其他端口"
echo ""

echo "方案 5: 使用 ngrok 建立隧道（臨時解決方案）"
echo "1. 安裝 ngrok: brew install ngrok"
echo "2. 運行: ngrok http 3000"
echo "3. 使用 ngrok 提供的 HTTPS 網址"
echo ""

echo "🧪 測試步驟："
echo ""
echo "1. 在手機瀏覽器中訪問: http://$LOCAL_IP:3000"
echo "2. 如果無法訪問，嘗試以下網址："
echo "   • http://$LOCAL_IP:3000/pwa-test.html"
echo "   • http://localhost:3000 (僅在同一設備上)"
echo ""

echo "3. 檢查手機網路設置："
echo "   • 確保手機連接同一 WiFi"
echo "   • 檢查手機是否在企業網路（可能有防火牆）"
echo "   • 嘗試關閉手機 VPN（如果有的話）"
echo ""

echo "4. 使用電腦瀏覽器測試："
echo "   • 在電腦上訪問: http://$LOCAL_IP:3000"
echo "   • 如果電腦可以訪問但手機不行，說明是網路問題"
echo ""

# 創建一個簡單的測試頁面
cat > test-mobile.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>移動端測試</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>📱 移動端連接測試</h1>
    <p>如果您看到這個頁面，說明連接成功！</p>
    <p>時間: <span id="time"></span></p>
    <p>用戶代理: <span id="useragent"></span></p>
    
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString();
        document.getElementById('useragent').textContent = navigator.userAgent;
    </script>
</body>
</html>
EOF

echo "✅ 已創建測試頁面: test-mobile.html"
echo "您可以訪問: http://$LOCAL_IP:3000/test-mobile.html 進行測試"
echo ""

echo "📞 如果問題仍然存在，請："
echo "1. 檢查您的網路環境"
echo "2. 嘗試使用不同的網路（如手機熱點）"
echo "3. 聯繫網路管理員（如果在企業網路中）"
echo "4. 考慮使用雲端部署方案"

