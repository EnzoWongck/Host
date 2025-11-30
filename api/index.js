// Vercel Serverless Function for serving static files
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // 獲取請求路徑
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // 移除查詢參數
  filePath = filePath.split('?')[0];
  
  // 構建完整文件路徑
  // Vercel 會將 dist 目錄內容複製到部署根目錄
  const distPath = path.join(__dirname, '..', 'dist', filePath === '/' ? 'index.html' : filePath);
  
  // 如果文件不存在，返回 index.html (SPA 路由)
  let actualPath = distPath;
  if (!fs.existsSync(actualPath) || fs.statSync(actualPath).isDirectory()) {
    actualPath = path.join(__dirname, '..', 'dist', 'index.html');
  }
  
  // 獲取文件擴展名
  const ext = path.extname(actualPath).toLowerCase();
  
  // 設置 MIME 類型
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
    '.xml': 'application/xml',
    '.hbc': 'application/octet-stream'
  }[ext] || 'application/octet-stream';
  
  try {
    // 讀取文件
    const data = fs.readFileSync(actualPath);
    
    // 設置 HTTP 標頭
    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
    
    // 為 PWA 文件添加特殊標頭
    if (filePath === '/manifest.json' || filePath.endsWith('.webmanifest')) {
      headers['Content-Type'] = 'application/manifest+json';
      headers['Cache-Control'] = 'public, max-age=86400';
    } else if (filePath === '/sw.js') {
      headers['Content-Type'] = 'text/javascript';
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Service-Worker-Allowed'] = '/';
    } else if (filePath.startsWith('/icons/') || filePath.endsWith('.png') || filePath.endsWith('.ico')) {
      headers['Cache-Control'] = 'public, max-age=31536000';
    } else if (filePath === '/' || filePath === '/index.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else if (filePath.startsWith('/_expo/') || filePath.startsWith('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=31536000';
    }
    
    res.writeHead(200, headers);
    res.end(data);
  } catch (err) {
    console.error(`無法讀取文件: ${actualPath}`, err.message);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - 文件未找到');
  }
};


