# Windows 快速開始指南

## 🚀 最快速啟動方式

### 方式 1：雙擊啟動（最簡單）
- **Web 版本**：雙擊 `start-web.bat`
- **完整開發模式**：雙擊 `start-dev.bat`

### 方式 2：使用命令
打開命令提示符（CMD）或 PowerShell，執行：

```cmd
npm install    # 首次使用時安裝依賴
npm run web    # 啟動 Web 版本
```

## 📋 所有可用命令

### 基本命令
```cmd
npm start              # 啟動 Expo 開發伺服器（然後按 w 啟動 Web）
npm run web            # 直接啟動 Web 版本
npm run web:clean      # 清除快取並啟動 Web
npm run web:lan        # 啟動 Web 並允許區域網路訪問
```

### 開發模式
```cmd
npm run dev            # 同時啟動 WebSocket 伺服器和 Expo
npm run server         # 僅啟動 WebSocket 伺服器
```

### 清理命令
```cmd
npm run kill           # 停止所有 Expo 進程
```

## 🎯 常用場景

### 場景 1：只想在瀏覽器中開發
```cmd
npm run web
```
或雙擊 `start-web.bat`

### 場景 2：需要協作功能（WebSocket）
```cmd
npm run dev
```
或雙擊 `start-dev.bat`

### 場景 3：清除快取重新開始
```cmd
npm run web:clean
```

### 場景 4：讓手機也能訪問
```cmd
npm run web:lan
```
然後在手機瀏覽器中訪問終端顯示的 IP 地址

## 🌐 訪問應用程式

啟動後，應用程式通常會在以下地址自動打開：
- **本地訪問**: `http://localhost:8081`
- **區域網路**: `http://[您的IP]:8081`（使用 `web:lan` 時）

## ⚠️ 常見問題

### 問題：端口被佔用
解決：Expo 會自動使用其他端口，查看終端輸出獲取正確 URL

### 問題：模組未找到
解決：執行 `npm install`

### 問題：PowerShell 無法執行腳本
解決：執行 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

## 📚 更多資訊

詳細設置指南請參考 [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)

