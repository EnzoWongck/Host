const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 設置靜態文件目錄
app.use(express.static(path.join(__dirname, 'dist')));

// 對於所有路由，返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 服務器運行在 http://localhost:${PORT}`);
  console.log('請在瀏覽器中打開上述地址來訪問 Poker Host 應用');
});
