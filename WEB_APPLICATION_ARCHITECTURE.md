# Web 應用架構與工作原理

## 📋 目錄
1. [應用概述](#應用概述)
2. [技術棧](#技術棧)
3. [啟動流程](#啟動流程)
4. [架構設計](#架構設計)
5. [核心功能模組](#核心功能模組)
6. [數據流](#數據流)
7. [狀態管理](#狀態管理)
8. [Web 特定功能](#web-特定功能)

---

## 應用概述

這是一個基於 **React Native + Expo** 的跨平台應用，使用 **React Native Web** 在瀏覽器中運行。主要功能是**撲克牌局管理系統**，支援：

- 🎮 牌局管理（創建、編輯、結束）
- 👥 玩家管理（買入、結算、盈虧記錄）
- 🎯 發牌員管理（工時、薪金計算）
- 💰 財務管理（支出、抽水、保險）
- 🔐 用戶認證（Firebase Authentication）
- 💳 訂閱系統（PayPal 訂閱）
- 🌐 多語言支援（繁體/簡體中文）
- 🎨 主題切換（深色/淺色模式）

---

## 技術棧

### 核心框架
- **React Native 0.81.4** - 跨平台 UI 框架
- **Expo SDK 54** - 開發工具和平台服務
- **React 19.1.0** - UI 庫
- **TypeScript 5.9.2** - 類型安全

### 導航與路由
- **React Navigation 6** - 導航管理
  - `@react-navigation/native`
  - `@react-navigation/bottom-tabs`
  - `@react-navigation/stack`

### 狀態管理
- **React Context API** - 全局狀態管理
- **useReducer** - 複雜狀態邏輯
- **AsyncStorage** - 本地持久化存儲

### 後端服務
- **Firebase** - 認證和數據庫
- **WebSocket** - 實時協作功能（可選）

### Web 特定
- **React Native Web 0.21.0** - Web 平台適配
- **Expo Web** - Web 構建和優化

---

## 啟動流程

### 1. 應用入口 (`App.tsx`)

```typescript
App (根組件)
  └─> GestureHandlerRootView
      └─> SafeAreaProvider
          └─> ThemeProvider
              └─> LanguageProvider
                  └─> GameProvider
                      └─> CollaborationProvider
                          └─> ToastProvider
                              └─> AuthProvider
                                  └─> SubscriptionProvider
                                      └─> NavigationProvider
                                          └─> AppWithFont
                                              └─> AppNavigator
                                                  └─> MainTabNavigator
```

### 2. Context 初始化順序

1. **ThemeProvider** - 初始化主題（深色/淺色）
2. **LanguageProvider** - 初始化語言（繁體/簡體）
3. **GameProvider** - 初始化遊戲狀態
4. **AuthProvider** - 檢查用戶登入狀態
5. **SubscriptionProvider** - 檢查訂閱狀態
6. **NavigationProvider** - 設置導航回調

### 3. 導航流程

```
WelcomeScreen (歡迎頁)
    ↓ 點擊「開始使用」
LoginScreen (登入頁)
    ↓ 登入成功
PhoneVerifyScreen (電話驗證)
    ↓ 驗證成功
MainTabNavigator (主應用)
    ├─> HomeScreen (首頁)
    ├─> GameScreen (牌局頁)
    └─> SettingsScreen (設定頁)
```

### 4. Web 平台特殊處理

在 `App.tsx` 的 `AppWithFont` 組件中：

- **字體載入**：動態載入 Google Fonts (Gilroy, Satoshi)
- **PWA 配置**：設置 manifest、favicon、theme-color
- **樣式注入**：注入全局 CSS 樣式（深色主題、輸入框樣式）
- **DOM 操作**：動態修改 `<head>` 標籤

---

## 架構設計

### 文件結構

```
src/
├── components/          # 可重用組件
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── ...
├── screens/            # 頁面組件
│   ├── WelcomeScreen.tsx
│   ├── HomeScreen.tsx
│   ├── GameScreen.tsx
│   └── SettingsScreen.tsx
├── context/            # Context 狀態管理
│   ├── GameContext.tsx
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ...
├── config/             # 配置文件
│   ├── firebase.ts
│   ├── auth.ts
│   └── dev.ts
├── types/              # TypeScript 類型定義
│   ├── game.ts
│   ├── theme.ts
│   └── navigation.ts
├── utils/              # 工具函數
│   └── fonts.ts
└── locales/            # 多語言文件
    ├── zh-TW.ts
    └── zh-CN.ts
```

### 組件層級

```
App (根組件)
  ├─> Context Providers (狀態提供者)
  │   ├─> ThemeProvider
  │   ├─> LanguageProvider
  │   ├─> GameProvider
  │   └─> AuthProvider
  │
  └─> AppNavigator (導航邏輯)
      ├─> WelcomeScreen
      ├─> LoginScreen
      ├─> SignupScreen
      ├─> PhoneVerifyScreen
      └─> MainTabNavigator
          ├─> HomeScreen
          ├─> GameScreen
          └─> SettingsScreen
```

---

## 核心功能模組

### 1. 認證系統 (`AuthContext.tsx`)

**功能**：
- Google 登入（Web 使用 Firebase Auth）
- Apple 登入（僅 iOS）
- Email 登入（開發模式）
- 電話驗證

**流程**：
```
用戶點擊登入
  ↓
Firebase Authentication
  ↓
檢查是否已綁定電話
  ↓
是 → 進入主應用
否 → 進入電話驗證頁
```

### 2. 遊戲管理 (`GameContext.tsx`)

**狀態結構**：
```typescript
{
  games: Game[];              // 所有牌局列表
  currentGame: Game | null;    // 當前進行中的牌局
  loading: boolean;            // 載入狀態
  error: string | null;        // 錯誤訊息
}
```

**主要操作**：
- `ADD_GAME` - 創建新牌局
- `UPDATE_GAME` - 更新牌局信息
- `ADD_PLAYER` - 添加玩家
- `ADD_BUYIN` - 記錄買入
- `ADD_EXPENSE` - 記錄支出
- `ADD_RAKE` - 記錄抽水
- `ADD_INSURANCE` - 記錄保險

**數據持久化**：
- 使用 `AsyncStorage` 保存到本地
- Key: `@poker_host_games`

### 3. 主題系統 (`ThemeContext.tsx`)

**功能**：
- 深色/淺色模式切換
- 主題顏色配置
- 字體大小配置

**實現**：
- 使用 `AsyncStorage` 保存用戶偏好
- 動態注入 CSS 樣式（Web 平台）

### 4. 語言系統 (`LanguageContext.tsx`)

**支援語言**：
- 繁體中文 (zh-TW)
- 簡體中文 (zh-CN)

**實現**：
- 使用 `AsyncStorage` 保存語言偏好
- 動態載入對應的語言文件

### 5. 訂閱系統 (`SubscriptionContext.tsx`)

**功能**：
- 檢查試用期狀態
- 管理訂閱狀態
- 顯示 Paywall（試用到期時）

**PayPal 整合**：
- 使用 PayPal SDK 處理訂閱
- 支援 Sandbox 和 Live 環境

---

## 數據流

### 1. 用戶操作流程

```
用戶操作 (點擊按鈕)
  ↓
事件處理函數 (onPress)
  ↓
Context Action (dispatch)
  ↓
Reducer 處理邏輯
  ↓
更新狀態
  ↓
組件重新渲染
  ↓
保存到 AsyncStorage (持久化)
```

### 2. 數據讀取流程

```
組件掛載 (useEffect)
  ↓
從 AsyncStorage 讀取
  ↓
Context Action (SET_GAMES)
  ↓
更新 Context 狀態
  ↓
組件接收新數據並渲染
```

### 3. 認證流程

```
用戶登入
  ↓
Firebase Auth
  ↓
獲取用戶信息
  ↓
更新 AuthContext
  ↓
檢查電話驗證狀態
  ↓
導航到相應頁面
```

---

## 狀態管理

### Context 架構

每個 Context 都遵循相同的模式：

```typescript
// 1. 定義 Context
const Context = createContext<ContextType | undefined>(undefined);

// 2. 創建 Provider
export const Provider: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 從 AsyncStorage 載入初始數據
  useEffect(() => {
    loadFromStorage();
  }, []);
  
  // 保存到 AsyncStorage
  useEffect(() => {
    saveToStorage();
  }, [state]);
  
  return (
    <Context.Provider value={{ state, actions }}>
      {children}
    </Context.Provider>
  );
};

// 3. 創建 Hook
export const useContext = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('Must be used within Provider');
  return ctx;
};
```

### 主要 Context

| Context | 職責 | 持久化 |
|---------|------|--------|
| `GameContext` | 管理所有牌局數據 | ✅ AsyncStorage |
| `AuthContext` | 管理用戶認證狀態 | ✅ AsyncStorage |
| `ThemeContext` | 管理主題設置 | ✅ AsyncStorage |
| `LanguageContext` | 管理語言設置 | ✅ AsyncStorage |
| `SubscriptionContext` | 管理訂閱狀態 | ✅ AsyncStorage |
| `ToastContext` | 顯示提示訊息 | ❌ 臨時狀態 |
| `NavigationContext` | 導航回調 | ❌ 臨時狀態 |

---

## Web 特定功能

### 1. PWA 支援

**配置** (`app.json`):
```json
{
  "web": {
    "name": "HostPokerMoney",
    "shortName": "HostPokerMoney",
    "themeColor": "#10B981",
    "backgroundColor": "#1A1A1A",
    "display": "standalone",
    "dangerouslySetInnerHTML": true
  }
}
```

**動態注入** (`App.tsx`):
- Manifest link
- Apple Touch Icon
- Theme Color Meta Tag
- Favicon

### 2. 字體載入

**動態載入**：
- Google Fonts: Gilroy (Black 900)
- Fontshare: Satoshi (400-900)

**應用方式**：
- 通過 `<style>` 標籤注入全局 CSS
- 根據語言選擇不同字體

### 3. PayPal 整合

**組件**: `PayPalSubscriptionButton.tsx`

**功能**：
- 載入 PayPal SDK
- 渲染訂閱按鈕
- 編程式觸發訂閱流程

**配置** (`src/config/dev.ts`):
```typescript
export const PAYPAL_CLIENT_ID = '...';
export const PAYPAL_USE_SANDBOX = true;
```

### 4. 開發模式

**配置** (`src/config/dev.ts`):
```typescript
export const SKIP_AUTH_ON_WEB = false;      // 跳過登入
export const SHOW_GROK_PREVIEW = false;      // 顯示預覽
export const ENABLE_SUBSCRIPTION_MODE = true; // 啟用訂閱模式
export const FORCE_SUBSCRIBED = false;       // 強制已訂閱
```

### 5. 深色主題樣式

**動態注入** (`App.tsx`):
- 背景色: `#121212`
- 卡片色: `#1E2023`
- 輸入框樣式優化
- 移除瀏覽器默認樣式

---

## 啟動命令

### 開發模式

```bash
# Web 版本
npm run web              # 啟動 Web
npm run web:clean        # 清除快取並啟動
npm run web:lan          # 允許區域網路訪問

# 完整開發（含 WebSocket）
npm run dev

# 停止服務
npm run kill
```

### 訪問地址

- **本地**: `http://localhost:8081` (或終端顯示的端口)
- **區域網路**: `http://[您的IP]:8081` (使用 `web:lan` 時)

---

## 數據持久化

### AsyncStorage Keys

| Key | 用途 |
|-----|------|
| `@poker_host_games` | 所有牌局數據 |
| `@poker_host_theme` | 主題設置 |
| `@poker_host_language` | 語言設置 |
| `@poker_host_auth` | 認證狀態 |
| `@poker_host_subscription` | 訂閱狀態 |
| `@poker_host_privacy` | 隱私設置 |

### 數據格式

**遊戲數據** (`Game`):
```typescript
{
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  players: Player[];
  dealers: Dealer[];
  expenses: Expense[];
  rakes: Rake[];
  insurances: Insurance[];
}
```

---

## 性能優化

### 1. 資源預載入

在 `MainTabNavigator` 中預載入常用圖標：
```typescript
Asset.loadAsync([
  require('./assets/icons/home.png'),
  require('./assets/icons/pokercard.png'),
  // ...
]);
```

### 2. 懶加載

- 使用 `React.lazy()` 懶加載組件（可選）
- 按需載入語言文件

### 3. 記憶化

- 使用 `useMemo` 記憶化計算結果
- 使用 `useCallback` 記憶化函數

---

## 安全考慮

### 1. 認證

- 使用 Firebase Authentication
- 支援多種登入方式
- 電話驗證確保用戶真實性

### 2. 數據保護

- 敏感數據存儲在 AsyncStorage（本地）
- 不傳輸敏感信息到外部服務（除 Firebase）

### 3. PayPal 整合

- 使用官方 PayPal SDK
- 不直接處理支付信息
- 支援 Sandbox 測試環境

---

## 故障排除

### 常見問題

1. **端口被佔用**
   - Expo 會自動使用其他端口
   - 查看終端輸出獲取正確 URL

2. **模組未找到**
   - 執行 `npm install`
   - 清除快取: `npm run web:clean`

3. **PayPal 按鈕不顯示**
   - 檢查 Client ID 是否正確
   - 確認 `dangerouslySetInnerHTML: true` 已設置
   - 檢查瀏覽器控制台錯誤

4. **字體未載入**
   - 檢查網路連接
   - 確認 Google Fonts 可訪問

---

## 總結

這是一個**功能完整的跨平台應用**，使用現代 React Native 技術棧構建。主要特點：

✅ **跨平台**: 同一套代碼運行在 Web、iOS、Android  
✅ **狀態管理**: 使用 Context API + useReducer  
✅ **數據持久化**: AsyncStorage 本地存儲  
✅ **認證系統**: Firebase Authentication  
✅ **訂閱系統**: PayPal 整合  
✅ **多語言**: 繁體/簡體中文  
✅ **主題系統**: 深色/淺色模式  
✅ **PWA 支援**: 可安裝為 Web App  

應用採用**組件化設計**，易於維護和擴展。所有狀態通過 Context 管理，數據自動持久化到本地存儲。












