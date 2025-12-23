const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 加載環境變數（如果存在 .env 文件）
try {
  require('dotenv').config();
  console.log('✅ 環境變數已加載');
} catch (error) {
  // dotenv 未安裝或 .env 文件不存在，使用系統環境變數
  console.log('ℹ️  使用系統環境變數（未找到 .env 文件或 dotenv 未安裝）');
}

const PORT = 3000;

// CORS headers（用於 API 響應）
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 加載 API 路由處理器
let sendOtpHandler = null;
let verifyOtpHandler = null;

try {
  sendOtpHandler = require('./api/phone/send-otp');
  verifyOtpHandler = require('./api/phone/verify-otp');
  console.log('✅ API 路由已加載');
} catch (error) {
  console.warn('⚠️  無法加載 API 路由:', error.message);
  console.warn('   電話驗證功能在 localhost 可能無法使用');
}

// 將 Vercel serverless function 格式適配到 Node.js HTTP 服務器
function createVercelAdapter(handler) {
  return async (req, res) => {
    // 解析 URL
    const parsedUrl = url.parse(req.url, true);
    
    // 讀取請求體
    const chunks = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const bodyBuffer = Buffer.concat(chunks);
      
      // 創建一個可迭代的 req 對象（模擬 Vercel 格式）
      let bodyRead = false;
      const vercelReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: parsedUrl.query,
        body: bodyBuffer.toString(),
        // 讓 req 可迭代（用於 for await (const chunk of req)）
        [Symbol.asyncIterator]: async function* () {
          if (!bodyRead) {
            bodyRead = true;
            yield bodyBuffer;
          }
        },
      };

      // 創建一個可寫入的響應對象
      let statusCode = 200;
      let headers = {};
      let responseBody = '';
      let headersSent = false;

      const vercelRes = {
        writeHead: (code, resHeaders = {}) => {
          if (!headersSent) {
            statusCode = code;
            headers = { ...headers, ...resHeaders };
            headersSent = true;
          }
        },
        end: (data) => {
          responseBody = data || '';
          if (!headersSent) {
            headersSent = true;
          }
        },
        setHeader: (key, value) => {
          headers[key] = value;
        },
        getHeader: (key) => {
          return headers[key];
        },
      };

      try {
        await handler(vercelReq, vercelRes);
        
        // 發送響應
        if (!headersSent) {
          res.writeHead(statusCode, headers);
        } else {
          res.writeHead(statusCode, headers);
        }
        res.end(responseBody);
      } catch (error) {
        console.error('API 處理錯誤:', error);
        if (!headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message,
          }));
        }
      }
    });

    req.on('error', (error) => {
      console.error('請求錯誤:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Request error',
          message: error.message,
        }));
      }
    });
  };
}

const server = http.createServer((req, res) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  
  // 處理 CORS preflight 請求
  if (req.method === 'OPTIONS' && req.url.startsWith('/api/')) {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // 處理 API 路由
  if (req.url.startsWith('/api/phone/send-otp')) {
    if (sendOtpHandler) {
      return createVercelAdapter(sendOtpHandler)(req, res);
    } else {
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'API handler not loaded',
        message: '電話驗證 API 未正確加載，請檢查環境變量設置',
      }));
      return;
    }
  }

  if (req.url.startsWith('/api/phone/verify-otp')) {
    if (verifyOtpHandler) {
      return createVercelAdapter(verifyOtpHandler)(req, res);
    } else {
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'API handler not loaded',
        message: '電話驗證 API 未正確加載，請檢查環境變量設置',
      }));
      return;
    }
  }

  // 處理其他 API 路由（chips, health 等）
  if (req.url.startsWith('/api/')) {
    // 嘗試加載對應的 API handler
    const apiPath = req.url.replace('/api/', '').split('?')[0];
    
    // 處理嵌套路由（如 /api/chips/consume -> api/chips/consume.js）
    const handlerPath = path.join(__dirname, 'api', `${apiPath}.js`);
    
    // 如果直接路徑不存在，嘗試作為目錄結構（如 api/chips/consume.js）
    let actualHandlerPath = handlerPath;
    if (!fs.existsSync(actualHandlerPath) && apiPath.includes('/')) {
      // 已經是正確的路徑格式，不需要修改
    }
    
    if (fs.existsSync(actualHandlerPath)) {
      try {
        // 清除 require 緩存，以便在開發時重新加載
        delete require.cache[require.resolve(actualHandlerPath)];
        const handler = require(actualHandlerPath);
        return createVercelAdapter(handler)(req, res);
      } catch (error) {
        console.error(`無法加載 API handler: ${actualHandlerPath}`, error);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Failed to load API handler',
          message: error.message,
        }));
        return;
      }
    } else {
      console.log(`API 端點未找到: ${req.url} (嘗試路徑: ${actualHandlerPath})`);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'API endpoint not found',
        message: `API 端點 ${req.url} 不存在`,
      }));
      return;
    }
  }
  
  // 處理靜態文件
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




