#!/bin/bash

echo "🔍 檢查防火牆狀態..."

# 檢查 pfctl 狀態
if sudo pfctl -s info 2>/dev/null | grep -q "Status: Enabled"; then
    echo "✅ 防火牆已啟用"
    echo ""
    echo "🔧 暫時關閉防火牆測試："
    echo "sudo pfctl -d"
    echo ""
    echo "測試完成後重新啟用："
    echo "sudo pfctl -e"
else
    echo "ℹ️  防火牆未啟用或無法檢查"
fi

echo ""
echo "🧪 測試端口訪問："
echo "1. 在電腦瀏覽器中測試: http://LOCAL_IP:8080"
echo "2. 在手機瀏覽器中測試: http://LOCAL_IP:8080"
