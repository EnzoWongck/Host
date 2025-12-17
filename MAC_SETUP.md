# 🍎 MacBook 設置指南

本指南將幫助您在 MacBook 上設置並運行 Poker Host 專案。

## 📋 前置需求

### 1. 安裝 Node.js
```bash
# 使用 Homebrew 安裝（推薦）
brew install node

# 或從官網下載安裝
# https://nodejs.org/
```

### 2. 安裝 Expo CLI（可選）
```bash
npm install -g expo-cli
```

### 3. 安裝 Xcode（僅 iOS 開發需要）
```bash
# 從 App Store 安裝 Xcode
# 或使用命令行工具
xcode-select --install
```

### 4. 安裝 Android Studio（僅 Android 開發需要）
```bash
# 從官網下載安裝
# https://developer.android.com/studio
```

## 🚀 快速開始

### 步驟 1：克隆或下載專案
```bash
# 如果使用 Git
git clone <repository-url>
cd Host

# 或直接進入專案目錄
cd ~/Documents/GitHub/Host
```

### 步驟 2：安裝依賴
```bash
npm install
```

### 步驟 3：啟動開發服務器

#### 方法 1：使用互動式腳本（推薦）
```bash
chmod +x dev.sh
./dev.sh
```

#### 方法 2：直接啟動
```bash
# Web 版本（最簡單）
npm run web

# iOS 模擬器
npm run ios

# Android 模擬器
npm run android

# 所有平台（Expo Go）
npm start
```

## 📱 開發模式選項

### Web 開發
```bash
# 啟動 Web 版本（自動打開瀏覽器）
npm run web

# 或使用腳本
chmod +x dev-web.sh
./dev-web.sh
```

### iOS 開發
```bash
# 啟動 iOS 模擬器
npm run ios

# 或使用腳本
chmod +x dev-ios.sh
./dev-ios.sh
```

### Android 開發
```bash
# 啟動 Android 模擬器
npm run android

# 或使用腳本
chmod +x dev-android.sh
./dev-android.sh
```

### 完整開發模式（包含 WebSocket 服務器）
```bash
npm run dev
```

## 🔧 常用命令

### 清理並重新啟動
```bash
# Web 版本（清理緩存）
npm run web:clean

# iOS（清理緩存）
npm run ios:clean

# 使用 LAN 模式（允許其他設備連接）
npm run web:lan
npm run ios:lan
```

### 停止 Expo 服務器
```bash
npm run kill
```

## 🛠️ 故障排除

### 問題 1：權限錯誤
```bash
# 給腳本添加執行權限
chmod +x *.sh
```

### 問題 2：端口被佔用
```bash
# 查找並終止佔用端口的進程
lsof -ti:8081 | xargs kill -9
lsof -ti:19000 | xargs kill -9
lsof -ti:19001 | xargs kill -9
```

### 問題 3：Node 版本不兼容
```bash
# 檢查 Node 版本（需要 18.x 或更高）
node -v

# 使用 nvm 切換版本（如果已安裝）
nvm install 18
nvm use 18
```

### 問題 4：依賴安裝失敗
```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 問題 5：Metro 緩存問題
```bash
# 清理 Metro 緩存
npx expo start --clear
```

## 📝 開發工作流程

### 1. 啟動開發服務器
```bash
npm run web
```

### 2. 在瀏覽器中打開
- 通常會自動打開 `http://localhost:8081`
- 或手動訪問顯示的 URL

### 3. 熱重載
- 修改代碼後會自動重新載入
- 無需手動刷新瀏覽器

### 4. 停止服務器
- 按 `Ctrl + C` 停止服務器

## 🌐 在真實設備上測試

### iOS 設備
1. 確保 Mac 和 iPhone 在同一 Wi-Fi 網絡
2. 啟動開發服務器：`npm start`
3. 在 iPhone 上安裝 Expo Go App
4. 掃描終端中顯示的 QR 碼

### Android 設備
1. 確保 Mac 和 Android 設備在同一 Wi-Fi 網絡
2. 啟動開發服務器：`npm start`
3. 在 Android 上安裝 Expo Go App
4. 掃描終端中顯示的 QR 碼

## 🔐 環境變量（如需要）

創建 `.env` 文件（如果專案需要）：
```bash
# .env
API_URL=https://host27o.com/api
```

## 📚 相關文檔

- [README.md](./README.md) - 專案總覽
- [QUICK_START.md](./QUICK_START.md) - 快速開始指南
- [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) - Windows 設置指南（參考）

## 🆘 獲取幫助

如果遇到問題：
1. 檢查 Node.js 版本：`node -v`（需要 18+）
2. 檢查 npm 版本：`npm -v`
3. 查看 Expo 文檔：https://docs.expo.dev/
4. 清理並重新安裝依賴

## ✅ 驗證設置

運行以下命令驗證設置是否正確：
```bash
# 檢查 Node.js
node -v

# 檢查 npm
npm -v

# 檢查 Expo
npx expo --version

# 檢查依賴
npm list --depth=0
```

完成以上步驟後，您就可以在 MacBook 上開始開發了！🎉









