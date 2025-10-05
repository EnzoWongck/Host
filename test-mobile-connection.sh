#!/bin/bash
echo "🧪 測試手機連接..."
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "測試端口 8080..."
if nc -z $LOCAL_IP 8080 2>/dev/null; then
    echo "✅ 端口 8080 可以從外部訪問"
else
    echo "❌ 端口 8080 無法從外部訪問"
    echo "嘗試端口 9000..."
    if nc -z $LOCAL_IP 9000 2>/dev/null; then
        echo "✅ 端口 9000 可以從外部訪問"
    else
        echo "❌ 端口 9000 也無法從外部訪問"
        echo "可能是防火牆問題"
    fi
fi
