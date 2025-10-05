#!/bin/bash

# 檢查 pokerhost.com 域名配置
echo "🔍 檢查 pokerhost.com 域名配置..."

DOMAIN="pokerhost.com"
WWW_DOMAIN="www.pokerhost.com"

# 檢查 DNS 記錄
echo "📡 檢查 DNS 記錄..."

# A 記錄
echo -n "A 記錄 ($DOMAIN): "
A_RECORD=$(dig +short $DOMAIN A)
if [ -n "$A_RECORD" ]; then
    echo "✅ $A_RECORD"
else
    echo "❌ 未找到 A 記錄"
fi

# www A 記錄
echo -n "A 記錄 ($WWW_DOMAIN): "
WWW_A_RECORD=$(dig +short $WWW_DOMAIN A)
if [ -n "$WWW_A_RECORD" ]; then
    echo "✅ $WWW_A_RECORD"
else
    echo "❌ 未找到 www A 記錄"
fi

# CNAME 記錄
echo -n "CNAME 記錄: "
CNAME_RECORD=$(dig +short $WWW_DOMAIN CNAME)
if [ -n "$CNAME_RECORD" ]; then
    echo "✅ $CNAME_RECORD"
else
    echo "ℹ️  未設置 CNAME 記錄（可選）"
fi

# MX 記錄
echo -n "MX 記錄: "
MX_RECORD=$(dig +short $DOMAIN MX)
if [ -n "$MX_RECORD" ]; then
    echo "✅ 已設置"
else
    echo "ℹ️  未設置 MX 記錄（可選）"
fi

# 檢查域名是否可訪問
echo ""
echo "🌐 檢查域名可訪問性..."

# HTTP 檢查
echo -n "HTTP ($DOMAIN): "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "http://$DOMAIN" 2>/dev/null)
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo "✅ 可訪問 (HTTP $HTTP_STATUS)"
else
    echo "❌ 無法訪問 (HTTP $HTTP_STATUS)"
fi

# HTTPS 檢查
echo -n "HTTPS ($DOMAIN): "
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://$DOMAIN" 2>/dev/null)
if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "301" ] || [ "$HTTPS_STATUS" = "302" ]; then
    echo "✅ 可訪問 (HTTPS $HTTPS_STATUS)"
else
    echo "❌ 無法訪問 (HTTPS $HTTPS_STATUS)"
fi

# 檢查 SSL 證書
echo ""
echo "🔒 檢查 SSL 證書..."

SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ -n "$SSL_INFO" ]; then
    echo "✅ SSL 證書已安裝"
    echo "$SSL_INFO"
else
    echo "❌ 未找到 SSL 證書"
fi

# WHOIS 信息
echo ""
echo "📋 域名 WHOIS 信息:"
WHOIS_INFO=$(whois $DOMAIN 2>/dev/null | grep -E "(Domain Name|Registry Expiry Date|Name Server|Registrar)" | head -10)
if [ -n "$WHOIS_INFO" ]; then
    echo "$WHOIS_INFO"
else
    echo "❌ 無法獲取 WHOIS 信息"
fi

echo ""
echo "📋 配置建議:"
echo "1. 確保 A 記錄指向您的伺服器 IP"
echo "2. 設置 www 子域名（可選）"
echo "3. 安裝 SSL 證書（推薦使用 Let's Encrypt）"
echo "4. 配置 HTTP 到 HTTPS 重定向"
echo "5. 設置適當的 TTL 值（建議 300-3600 秒）"

echo ""
echo "🔗 有用的工具:"
echo "• DNS 檢查: https://dnschecker.org/"
echo "• SSL 檢查: https://www.ssllabs.com/ssltest/"
echo "• 網站速度: https://pagespeed.web.dev/"
echo "• PWA 檢查: https://web.dev/measure/"

