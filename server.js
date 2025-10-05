const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
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
      'Cache-Control': 'no-cache'
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
      headers['X-Frame-Options'] = 'DENY';
      headers['X-Content-Type-Options'] = 'nosniff';
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }
    
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Poker Host 應用已啟動！');
  console.log(`📱 請在瀏覽器中打開: http://localhost:${PORT}`);
  console.log('🎯 現在使用 assets/icons 中的自定義圖標！');
  console.log('⏹️  按 Ctrl+C 停止服務器');
});

// 優雅地關閉服務器
process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉服務器...');
  server.close(() => {
    console.log('✅ 服務器已關閉');
    process.exit(0);
  });
});




