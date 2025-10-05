const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080; // 使用端口 8080

// 獲取本機 IP 地址
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const LOCAL_IP = getLocalIP();

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
