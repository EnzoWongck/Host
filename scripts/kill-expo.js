// 跨平台腳本：停止 Expo 進程
const { exec } = require('child_process');
const os = require('os');

const platform = os.platform();

if (platform === 'win32') {
  // Windows: 使用 wmic 查找並終止包含 expo 的 node 進程
  exec('wmic process where "name=\'node.exe\' and commandline like \'%expo%\'" delete', (error) => {
    if (error) {
      // 如果 wmic 失敗或沒有找到進程，嘗試使用 taskkill
      exec('taskkill /F /FI "WINDOWTITLE eq *expo*" /IM node.exe 2>nul', (error2) => {
        // 忽略錯誤，因為可能沒有運行中的進程
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
} else {
  // Unix-like (macOS, Linux): 使用 pkill
  exec("pkill -f 'expo start' || true", (error) => {
    // 在 Unix 系統上，如果沒有找到進程，pkill 會返回錯誤，這是正常的
    process.exit(0);
  });
}

