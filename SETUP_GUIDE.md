# Poker Host App - 設置指南

## 🚀 快速開始

此專案已完成 **階段 2：React Native 實作**，包含完整的 Expo + TypeScript 架構。

### 📋 環境需求

在開始之前，您需要安裝以下軟體：

1. **Node.js** (v18 或更高版本)
   ```bash
   # 使用 Homebrew 安裝 (推薦)
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   brew install node
   
   # 或直接從官網下載：https://nodejs.org/
   ```

2. **Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

3. **手機上的 Expo Go App**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 🏗️ 專案設置

1. **安裝依賴**
   ```bash
   cd PokerHost
   npm install
   ```

2. **啟動開發服務器**
   ```bash
   npm start
   ```

3. **在手機上預覽**
   - 開啟 Expo Go App
   - 掃描終端機中顯示的 QR 碼
   - 應用程式將在您的手機上載入

### 📱 平台特定運行

```bash
# iOS 模擬器
npm run ios

# Android 模擬器
npm run android

# Web 瀏覽器
npm run web
```

## 🎯 已完成功能

### ✅ 核心架構
- **Expo + TypeScript** 專案設置
- **React Navigation** 底部 Tab 導航
- **Context API + useReducer** 狀態管理
- **主題系統** (深色/淺色模式)
- **AsyncStorage** 本地資料存儲

### ✅ 使用者介面
- **主頁** - 牌局列表展示
- **目前牌局** - 玩家管理、功能按鈕
- **設定** - 主題切換、語言設定
- **響應式設計** - 適配不同螢幕尺寸

### ✅ 組件系統
- **Card** - iOS 風格卡片組件
- **Button** - 多變體按鈕組件
- **TabBarIcon** - 自定義 Tab 圖標

### ✅ 狀態管理
- **GameContext** - 遊戲狀態管理
- **ThemeContext** - 主題狀態管理
- **TypeScript 類型** - 完整類型定義

## 🔄 從 HTML 原型搬運的功能

所有 HTML 原型中的功能都已成功搬運到 React Native：

### 🏠 主頁功能
- ✅ 簡潔的 "Host" 標題
- ✅ 牌局卡片列表
- ✅ 牌局狀態顯示
- ✅ 新增牌局按鈕

### 🎯 目前牌局功能
- ✅ 可展開的玩家列表
- ✅ 功能按鈕網格 (買入、支出、抽水、保險)
- ✅ 發牌員管理按鈕
- ✅ 底部固定按鈕 (牌局總結、結束牌局)

### ⚙️ 設定功能
- ✅ 黑白色卡片顏色模式選擇
- ✅ 語言和幣種設定
- ✅ 資料管理選項
- ✅ 通知設定
- ✅ 關於資訊

## 🎨 設計系統

### 主題
- **淺色模式**：白色背景、深色文字
- **深色模式**：黑色背景、白色文字
- **主色調**：iOS 藍 `#007AFF`

### 間距系統
```typescript
spacing: {
  xs: 4,   // 極小間距
  sm: 8,   // 小間距
  md: 16,  // 中等間距
  lg: 24,  // 大間距
  xl: 32,  // 極大間距
}
```

### 字體大小
```typescript
fontSize: {
  xs: 12,   // 極小文字
  sm: 14,   // 小文字
  md: 16,   // 中等文字
  lg: 18,   // 大文字
  xl: 24,   // 極大文字
  xxl: 32,  // 標題文字
}
```

## 🔮 下一步開發

### 📋 待實作功能

1. **Modal 組件**
   - 新增牌局 Modal
   - 買入 Modal
   - 支出 Modal
   - 抽水 Modal
   - 保險 Modal
   - 發牌員管理 Modal

2. **計算邏輯**
   - 玩家盈虧計算
   - 發牌員薪金公式
   - 牌局利潤計算
   - 財務總結

3. **資料持久化**
   - 完善 AsyncStorage 整合
   - 資料驗證
   - 錯誤處理

### 🧪 測試階段
完成上述功能後，即可進入：
- **階段 3**：iOS/Android 功能測試
- **階段 4**：打包 APK/IPA
- **階段 5**：App Store / Google Play 上架

## 📞 技術支援

如果在設置過程中遇到問題：

1. **檢查 Node.js 版本**
   ```bash
   node --version  # 應為 v18+
   ```

2. **清除快取**
   ```bash
   npm start -- --clear
   ```

3. **重新安裝依賴**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **查看 Expo 文檔**
   - [Expo 官方文檔](https://docs.expo.dev/)
   - [React Native 文檔](https://reactnative.dev/docs/getting-started)

---

**🎉 恭喜！您的 Poker Host App React Native 版本已準備就緒！**





