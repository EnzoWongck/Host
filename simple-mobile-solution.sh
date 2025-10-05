#!/bin/bash

# 簡單的手機訪問解決方案
echo "📱 簡單的手機訪問解決方案"
echo "=================================="
echo ""

# 獲取本地 IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📍 您的電腦 IP: $LOCAL_IP"
echo ""

echo "🔧 解決方案 1: 修改伺服器端口（推薦）"
echo "=================================="
echo ""

# 創建一個使用不同端口的伺服器
cat > server-8080.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080; // 使用端口 8080

const server = http.createServer((req, res) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }
  
  const ext = path.extname(filePath).toLowerCase();
  
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.xml': 'application/xml'
  }[ext] || 'application/octet-stream';
  
  const headers = {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache'
  };
  
  if (req.url === '/manifest.json' || req.url.endsWith('.webmanifest')) {
    headers['Content-Type'] = 'application/manifest+json';
    headers['Cache-Control'] = 'public, max-age=86400';
  } else if (req.url === '/sw.js') {
    headers['Content-Type'] = 'text/javascript';
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Service-Worker-Allowed'] = '/';
  } else if (req.url.startsWith('/icons/') || req.url.endsWith('.png') || req.url.endsWith('.ico')) {
    headers['Cache-Control'] = 'public, max-age=31536000';
  } else if (req.url === '/' || req.url === '/index.html') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['X-Frame-Options'] = 'DENY';
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`無法讀取文件: ${filePath}`, err.message);
      res.writeHead(404);
      res.end('404 - 文件未找到');
      return;
    }
    
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Poker Host 應用已啟動！');
  console.log(`📱 本地訪問: http://localhost:${PORT}`);
  console.log(`📱 手機訪問: http://${LOCAL_IP}:${PORT}`);
  console.log('🎯 使用端口 8080 避免防火牆問題！');
  console.log('⏹️  按 Ctrl+C 停止服務器');
});

process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉服務器...');
  server.close(() => {
    console.log('✅ 服務器已關閉');
    process.exit(0);
  });
});
EOF

echo "✅ 已創建 server-8080.js"
echo ""

echo "🔧 解決方案 2: 檢查防火牆"
echo "=================================="
echo ""

# 創建防火牆檢查腳本
cat > check-firewall.sh << 'EOF'
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
EOF

chmod +x check-firewall.sh
echo "✅ 已創建 check-firewall.sh"
echo ""

echo "🚀 現在您可以選擇以下方案："
echo "=================================="
echo ""
echo "方案 1: 使用端口 8080（推薦）"
echo "1. 運行: node server-8080.js"
echo "2. 在手機上訪問: http://$LOCAL_IP:8080"
echo ""
echo "方案 2: 檢查防火牆"
echo "1. 運行: ./check-firewall.sh"
echo "2. 按照提示操作"
echo ""
echo "方案 3: 安裝 ngrok"
echo "1. 運行: ./install-ngrok.sh"
echo "2. 註冊 ngrok 帳戶"
echo "3. 使用 ngrok 隧道"
echo ""

echo "🎯 建議操作順序："
echo "1. 首先嘗試方案 1（端口 8080）"
echo "2. 如果不行，嘗試方案 2（檢查防火牆）"
echo "3. 最後考慮方案 3（ngrok）"
echo ""

echo "📱 測試網址："
echo "• 本地: http://localhost:8080"
echo "• 手機: http://$LOCAL_IP:8080"
echo "• 測試頁面: http://$LOCAL_IP:8080/test-mobile.html"

