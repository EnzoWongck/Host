# Poker Host - 牌局管理 App

專業的撲克牌局管理應用程式，支援玩家管理、發牌員管理、財務統計等功能。

## 專案架構

```
PokerHost/
├── App.tsx                 # 主應用程式入口
├── app.json               # Expo 配置
├── package.json           # 專案依賴
├── tsconfig.json          # TypeScript 配置
└── src/
    ├── components/        # 可重用組件
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   └── TabBarIcon.tsx
    ├── screens/           # 頁面組件
    │   ├── HomeScreen.tsx
    │   ├── GameScreen.tsx
    │   └── SettingsScreen.tsx
    ├── context/           # React Context
    │   ├── GameContext.tsx
    │   └── ThemeContext.tsx
    ├── types/             # TypeScript 類型定義
    │   ├── game.ts
    │   ├── navigation.ts
    │   └── theme.ts
    └── utils/             # 工具函數
```

## 主要功能

### 🏠 主頁
- 牌局列表展示
- 新增牌局
- 牌局狀態管理

### 🎯 目前牌局
- 玩家管理（買入、盈虧記錄）
- 發牌員管理（工時、薪金計算）
- 支出記錄
- 抽水管理
- 保險功能

### ⚙️ 設定
- 深色/淺色模式切換
- 語言設定
- 幣種設定
- 資料管理

## 技術棧

- **React Native** - 跨平台移動開發
- **Expo** - 開發工具和平台
- **TypeScript** - 類型安全
- **React Navigation** - 導航管理
- **Context API + useReducer** - 狀態管理
- **AsyncStorage** - 本地資料存儲

## 安裝和運行

### 前置需求
- Node.js (推薦 18.x 或更高版本)
- npm 或 yarn
- Expo CLI（可選，全局安裝）

### 安裝步驟

1. **安裝依賴**
   ```bash
   npm install
   # 或
   yarn install
   ```

2. **啟動開發服務器**
   ```bash
   npm start 
   # 或
   yarn start
   ```

3. **在設備上運行**
   - **iOS**: `npm run ios` 或在 Expo Go 中掃描 QR 碼
   - **Android**: `npm run android` 或在 Expo Go 中掃描 QR 碼
   - **Web**: `npm run web`

### Windows 用戶

如果您在 Windows 上開發，請參考 [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) 獲取詳細的設置指南。

**快速開始（Windows）：**
- 雙擊 `start-web.bat` 啟動 Web 版本
- 雙擊 `start-dev.bat` 啟動完整開發模式（包含 WebSocket）

**從 macOS 傳送到 Windows：**
- 查看 [TRANSFER_TO_WINDOWS.md](./TRANSFER_TO_WINDOWS.md) 獲取詳細的傳送指南
- 或執行 `./prepare-transfer.sh` 自動準備傳送檔案

## 開發指南

### 狀態管理

使用 Context API + useReducer 管理全局狀態：

```typescript
// 使用遊戲狀態
const { state, createGame, addPlayer } = useGame();

// 使用主題
const { theme, colorMode, setColorMode } = useTheme();
```

### 新增功能

1. 在 `src/types/` 中定義類型
2. 在 `src/context/` 中更新狀態管理
3. 在 `src/components/` 中建立可重用組件
4. 在 `src/screens/` 中實作頁面邏輯

### 主題系統

支援深色和淺色模式，主題配置在 `src/types/theme.ts` 中：

```typescript
const { theme } = useTheme();

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
});
```

## 建置和部署

### 建置 APK (Android)
```bash
expo build:android
```

### 建置 IPA (iOS)
```bash
expo build:ios
```

### 發佈到 App Store / Google Play
```bash
expo publish
```

## 資料結構

### 遊戲 (Game)
- 基本資訊：名稱、Host、盲注
- 玩家列表
- 發牌員列表
- 支出記錄
- 抽水記錄
- 保險記錄

### 玩家 (Player)
- 個人資訊：姓名、買入金額
- 狀態：進行中、已兌現
- 盈虧計算

### 發牌員 (Dealer)
- 基本資訊：姓名、時薪、佔成比例
- 工作狀態：發牌中、已下班
- 薪金計算：`薪金 = 小費合計 × 佔成 + 基本時薪 × 工時`

## 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 建立 Pull Request

## 授權

此專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 聯絡資訊

- 開發團隊：Poker Host Team
- 電子郵件：support@pokerhost.app
- 專案連結：[https://github.com/pokerhost/poker-host-app](https://github.com/pokerhost/poker-host-app)





