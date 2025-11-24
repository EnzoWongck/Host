# Windows 設置指南

本指南將幫助您在 Windows 系統上設置和運行 Poker Host 專案。

## 📋 前置需求

### 1. 安裝 Node.js
- 下載並安裝 [Node.js](https://nodejs.org/) (推薦 18.x 或更高版本)
- 安裝時選擇「Add to PATH」選項
- 驗證安裝：
  ```cmd
  node --version
  npm --version
  ```

### 2. 安裝 Git（可選，用於版本控制）
- 下載並安裝 [Git for Windows](https://git-scm.com/download/win)

### 3. 安裝 Expo CLI（全局安裝，可選）
```cmd
npm install -g expo-cli
```

## 🚀 快速開始

### 方法一：使用啟動腳本（推薦）

**使用批處理腳本（.bat）：**
1. **啟動 Web 版本**
   - 雙擊 `start-web.bat`
   - 或右鍵選擇「以管理員身份執行」

2. **啟動完整開發模式（包含 WebSocket）**
   - 雙擊 `start-dev.bat`

**使用 PowerShell 腳本（.ps1，推薦）：**
1. **啟動 Web 版本**
   - 右鍵點擊 `start-web.ps1`
   - 選擇「使用 PowerShell 執行」
   - 或打開 PowerShell，執行：`.\start-web.ps1`

2. **啟動完整開發模式（包含 WebSocket）**
   - 右鍵點擊 `start-dev.ps1`
   - 選擇「使用 PowerShell 執行」
   - 或打開 PowerShell，執行：`.\start-dev.ps1`

**注意**：如果 PowerShell 提示執行策略限制，請執行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 方法二：使用 npm 命令

1. **打開命令提示符（CMD）或 PowerShell**
   - 在專案資料夾中，按住 `Shift` + 右鍵
   - 選擇「在此處打開 PowerShell 窗口」或「在此處打開命令窗口」

2. **安裝依賴**
   ```cmd
   npm install
   ```

3. **啟動開發伺服器**
   ```cmd
   npm start
   ```
   然後按 `w` 鍵啟動 Web 版本

   或直接啟動 Web：
   ```cmd
   npm run web
   ```

4. **啟動完整開發模式（Web + WebSocket 伺服器）**
   ```cmd
   npm run dev
   ```

## 📝 常用命令

### 開發命令
```cmd
npm start              # 啟動 Expo 開發伺服器
npm run web            # 直接啟動 Web 版本
npm run web:clean      # 清除快取並啟動 Web
npm run server         # 僅啟動 WebSocket 伺服器
npm run dev            # 同時啟動伺服器和 Expo
```

### 清理命令
```cmd
npm run kill           # 停止所有 Expo 進程（Windows 版本）
```

## 🌐 訪問應用程式

啟動後，應用程式通常會在以下地址自動打開：
- **本地訪問**: `http://localhost:8081`
- **區域網路訪問**: `http://[您的IP]:8081`

如果瀏覽器沒有自動打開，請手動訪問上述地址。

## 🔧 疑難排解

### 問題 1: 端口被佔用
如果 8081 端口被佔用，Expo 會自動使用其他端口。查看終端輸出以獲取正確的 URL。

### 問題 2: 模組未找到錯誤
```cmd
npm install
```
重新安裝所有依賴。

### 問題 3: 清除快取
```cmd
npm run web:clean
```
或手動清除：
```cmd
npx expo start --web --clear
```

### 問題 4: 防火牆阻止
如果無法從其他設備訪問，請檢查 Windows 防火牆設置，允許 Node.js 通過防火牆。

### 問題 5: 權限問題
如果遇到權限問題，請：
- 以管理員身份運行命令提示符
- 或右鍵點擊批處理文件，選擇「以管理員身份執行」

## 📱 在移動設備上測試

### 使用 Expo Go App
1. 在手機上安裝 [Expo Go](https://expo.dev/client)
2. 確保手機和電腦在同一 Wi-Fi 網路
3. 啟動開發伺服器後，掃描終端中顯示的 QR 碼

### 使用區域網路模式
```cmd
npm run web:lan
```
這會顯示區域網路 IP 地址，您可以在手機瀏覽器中訪問。

## 🛠️ 開發工具推薦

- **Visual Studio Code**: 推薦的程式碼編輯器
- **Chrome DevTools**: 用於調試 Web 版本
- **React Native Debugger**: 用於調試 React Native 應用

## 📚 更多資源

- [Expo 文檔](https://docs.expo.dev/)
- [React Native 文檔](https://reactnative.dev/)
- [TypeScript 文檔](https://www.typescriptlang.org/)

## 💡 提示

1. **使用 PowerShell 而非 CMD**：PowerShell 提供更好的開發體驗
2. **保持終端開啟**：開發伺服器需要持續運行
3. **熱重載**：修改程式碼後，應用會自動重新載入
4. **檢查終端輸出**：錯誤和警告訊息會顯示在終端中

## 🆘 需要幫助？

如果遇到問題：
1. 檢查終端中的錯誤訊息
2. 確認所有依賴都已正確安裝
3. 嘗試清除快取並重新啟動
4. 查看專案的 README.md 文件

祝您開發愉快！🎉

