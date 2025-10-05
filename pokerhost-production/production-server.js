const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const HTTP_PORT = 80;
const HTTPS_PORT = 443;

// 生產環境配置
const PRODUCTION_DOMAIN = 'pokerhost.com';
const PRODUCTION_URL = `https://${PRODUCTION_DOMAIN}`;

// 創建 HTTP 伺服器（重定向到 HTTPS）
const httpServer = http.createServer((req, res) => {
  const redirectUrl = `https://${req.headers.host}${req.url}`;
  res.writeHead(301, {
    'Location': redirectUrl,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  res.end();
});

// 創建 HTTPS 伺服器
const httpsServer = https.createServer({
  // 注意：在生產環境中，您需要提供真實的 SSL 證書
  // key: fs.readFileSync('/path/to/private-key.pem'),
  // cert: fs.readFileSync('/path/to/certificate.pem')
}, (req, res) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  // 檢查文件是否存在，如果不存在則返回 index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }
  
  // 獲取文件擴展名
  const ext = path.extname(filePath).toLowerCase();
  
  // 設置 MIME 類型
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
  
  // 讀取並返回文件
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`無法讀取文件: ${filePath}`, err.message);
      res.writeHead(404);
      res.end('404 - 文件未找到');
      return;
    }
    
    // 設置 HTTP 標頭
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss:;"
    };
    
    // 為 PWA 文件添加特殊標頭
    if (req.url === '/manifest.json' || req.url.endsWith('.webmanifest')) {
      headers['Content-Type'] = 'application/manifest+json';
      headers['Cache-Control'] = 'public, max-age=86400'; // 快取 24 小時
    } else if (req.url === '/sw.js') {
      headers['Content-Type'] = 'text/javascript';
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Service-Worker-Allowed'] = '/';
    } else if (req.url.startsWith('/icons/') || req.url.endsWith('.png') || req.url.endsWith('.ico')) {
      headers['Cache-Control'] = 'public, max-age=31536000'; // 快取 1 年
    } else if (req.url === '/' || req.url === '/index.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }
    
    res.writeHead(200, headers);
    res.end(data);
  });
});

// 啟動 HTTP 伺服器（重定向到 HTTPS）
httpServer.listen(HTTP_PORT, () => {
  console.log(`🔄 HTTP 重定向伺服器運行在端口 ${HTTP_PORT}`);
  console.log(`📡 所有 HTTP 請求將重定向到 HTTPS`);
});

// 啟動 HTTPS 伺服器
httpsServer.listen(HTTPS_PORT, () => {
  console.log('🚀 Poker Host 生產環境已啟動！');
  console.log(`🌐 網站網址: ${PRODUCTION_URL}`);
  console.log(`📱 PWA 功能已啟用`);
  console.log(`🔒 HTTPS 安全連接已啟用`);
  console.log('⏹️  按 Ctrl+C 停止服務器');
});

// 優雅地關閉服務器
process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉生產服務器...');
  httpServer.close(() => {
    httpsServer.close(() => {
      console.log('✅ 生產服務器已關閉');
      process.exit(0);
    });
  });
});

module.exports = { httpServer, httpsServer };
