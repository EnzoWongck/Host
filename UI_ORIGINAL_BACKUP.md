# UI 原始狀態備份

本文檔記錄了當前 UI 的完整狀態，作為原始版本基準，用於後續 UI 更改的參考。

**備份日期**: 2024年（當前）

---

## 1. 主題配置 (src/types/theme.ts)

### 淺色主題 (lightTheme)
```typescript
colors: {
  primary: '#E2E8F0',      // 深灰按鈕
  secondary: '#8B5CF6',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
},
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
},
fontSize: {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
},
borderRadius: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 24,  // 已從 16 增加到 24
  xl: 28,  // 已從 20 增加到 28
},
fontFamily: {
  default: 'SF Pro Display',
  zhTW: 'PingFang TC',
  zhCN: 'Microsoft YaHei',
},
colorMode: 'light',
```

### 深色主題 (darkTheme)
```typescript
colors: {
  primary: '#303134',      // 深灰按鈕
  secondary: '#303134',    // 深灰
  background: '#121212',   // 深灰色背景
  surface: '#202124',      // 卡片背景（比背景稍亮，保持層次感）
  text: '#FFFFFF',         // 純白色文字（已從 #DDDDDD 改為 #FFFFFF）
  textSecondary: '#F5F5F5', // 次要文字（已改為 #F5F5F5）
  border: '#3A3A3A',       // 邊框顏色
  success: '#007A5E',      // 牌桌綠（新增重點色）
  error: '#D70015',        // 深寶石紅（已從 #EF4444 改為 #D70015）
  warning: '#D4AF37',      // 賭場金（新增重點色）
  info: '#6B7280',         // 灰色
},
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
},
fontSize: {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
},
borderRadius: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 24,  // 已從 16 增加到 24
  xl: 28,  // 已從 20 增加到 28
},
fontFamily: {
  default: 'SF Pro Display',
  zhTW: 'PingFang TC',
  zhCN: 'Microsoft YaHei',
},
colorMode: 'dark',
```

---

## 2. 字體配置 (src/utils/fonts.ts)

### 字體族
- **Web 平台**: `"Jinxuan 75", "Jinxuan 65", "字由優設標題黑", "Noto Sans TC", "PingFang TC", sans-serif`
- **移動平台繁體中文**: `Jinxuan`
- **移動平台簡體中文**: `Microsoft YaHei`

### 字體粗細
- **所有語言**: `700` (粗體，匹配金萱體 75 黑)

---

## 3. 組件樣式

### 3.1 Button 組件 (src/components/Button.tsx)

#### 尺寸
- **sm**: `paddingHorizontal: 12, paddingVertical: 8, fontSize: 14`
- **md**: `paddingHorizontal: 16, paddingVertical: 12, fontSize: 16`
- **lg**: `paddingHorizontal: 24, paddingVertical: 16, fontSize: 18`

#### 樣式變體
- **primary**:
  - 背景色: `theme.colors.primary`
  - 文字顏色: 淺色模式 `#64748B`，深色模式 `#FFFFFF`
  - 圓角: `theme.borderRadius.md` (12px)
  - 陰影: `shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15/0.25, shadowRadius: 8, elevation: 5`
  - 內陰影效果: 頂部高光 `rgba(255, 255, 255, 0.1)`，底部陰影 `rgba(0, 0, 0, 0.2)`
  
- **danger**:
  - 背景色: `theme.colors.error` (#D70015)
  - 文字顏色: `#FFFFFF`
  - 陰影: `shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1/0.2, shadowRadius: 4, elevation: 3`

- **secondary**:
  - 背景色: `theme.colors.textSecondary`
  - 文字顏色: `theme.colors.background`
  - 陰影: `shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05/0.1, shadowRadius: 2, elevation: 1`

- **outline**:
  - 背景色: `transparent`
  - 邊框: `1.5px solid theme.colors.primary`
  - 文字顏色: `theme.colors.primary`

#### 通用樣式
- 字重: `600`
- 字間距: `0.3`
- 對齊: `center`
- `activeOpacity: 1` (無點擊透明度變化)

---

### 3.2 Card 組件 (src/components/Card.tsx)

#### 樣式
- **背景色**: 淺色模式 `#FFFFFF`，深色模式 `theme.colors.surface`
- **圓角**: `theme.borderRadius.lg` (24px)
- **邊框**: `0` (無邊框)
- **陰影**: 
  - `shadowOffset: { width: 0, height: 4 }`
  - `shadowOpacity: 0.08 (淺色) / 0.15 (深色)`
  - `shadowRadius: 12`
  - `elevation: 6`
- **間距**: `marginBottom: theme.spacing.md + 4` (20px)

#### 內邊距選項
- **xs**: `4px`
- **sm**: `8px`
- **md**: `16px` (默認)
- **lg**: `24px`
- **xl**: `32px`

---

### 3.3 TopTabBar 組件 (src/components/TopTabBar.tsx)

#### 容器樣式
- **高度**: `72px`
- **背景色**: `theme.colors.background` (可設置 `transparent`)
- **內邊距**: `paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, paddingTop: theme.spacing.xs`
- **邊框**: `borderBottomWidth: 0`
- **z-index**: `1000`

#### Logo 按鈕
- **尺寸**: `60x60px`
- **圓角**: `14px`
- **圖片**: `assets/icons/icon.front.png`

#### 標題樣式
- **字體大小**: `30px` (已從 18px 增加)
- **字重**: `700` (已從 600 增加)
- **顏色**: `theme.colors.text`
- **字間距**: `0.5`
- **對齊**: `center`

#### 設置按鈕
- **尺寸**: `44x44px`
- **三點圖標**: 每個點 `4x4px`，間距 `2px`

---

### 3.4 DoubleTabBar 組件 (src/components/DoubleTabBar.tsx)

#### 容器樣式
- **背景色**: `theme.colors.background`
- **頂部內邊距**: `12px`
- **頂部邊框**: `0.5px solid theme.colors.border`
- **底部內邊距**: `20px`

#### 標籤樣式
- **字體大小**: `11px`
- **字重**: `500` (未選中) / `600` (選中)
- **字間距**: `0.2`
- **圖標大小**: `24px`

#### 選中狀態背景
- **尺寸**: `40x40px`
- **圓角**: `20px` (圓形)
- **背景色**: 
  - Home: `rgba(16, 185, 129, 0.15)` (綠色半透明)
  - Game: `rgba(59, 130, 246, 0.15)` (藍色半透明)
  - Settings: `rgba(139, 92, 246, 0.15)` (紫色半透明)

#### 標籤顏色
- **未選中**: `theme.colors.textSecondary`
- **選中**:
  - Home: `#10B981` (綠色)
  - Game: `#3B82F6` (藍色)
  - Settings: `#8B5CF6` (紫色)

---

## 4. 屏幕樣式

### 4.1 GameScreen (src/screens/GameScreen.tsx)

#### 標題顯示
- **格式**: 兩行文字（主標題 + 副標題）
- **主標題字體大小**: `30px`
- **副標題字體大小**: `24px`
- **字重**: `700`
- **左側 Logo**: 已移除（根據最新更改）

#### 玩家列表
- **分隔線**: 在「進行中」標題下方，`0.5px solid #333333` (極細霧面分隔線)
- **項目高度**: 每個玩家項目約 `70px`

#### 金額顯示
- **字體變體**: `fontVariant: ['tabular-nums']` (等寬數字)

---

### 4.2 HomeScreen (src/screens/HomeScreen.tsx)

#### 金額顯示
- **字體變體**: `fontVariant: ['tabular-nums']` (等寬數字)

---

## 5. 全局樣式 (App.tsx)

### Web 平台字體載入
- **Gilroy**: 用於英文
- **Satoshi**: 用於英文（備用）
- **Noto Sans TC**: 繁體中文
- **Noto Sans SC**: 簡體中文

### 全局 CSS 注入
- **等寬數字**: `font-variant-numeric: tabular-nums`
- **輸入框樣式**: 移除默認 `outline`

---

## 6. 已實施的 UI 優化

### 已完成的優化項目
1. ✅ 字體更新為金萱體 65-75 中黑
2. ✅ 標題排版改為兩行（主標題 + 副標題）
3. ✅ 主要文字顏色改為純白色 (#FFFFFF)
4. ✅ 紅色按鈕改為深寶石紅 (#D70015)
5. ✅ 卡片圓角增加到 24-28pt
6. ✅ 卡片間距增加 4pt
7. ✅ 金額數字使用等寬數字 (tabular-nums)
8. ✅ 頂部玩家區塊添加極細分隔線
9. ✅ 底部導航欄添加選中狀態的填充背景
10. ✅ 主按鈕添加微光和內陰影效果（3D 擬物風格）
11. ✅ 財務報表頁 icon 放大到 42px
12. ✅ 添加重點色：牌桌綠 (#007A5E) 和賭場金 (#D4AF37)

---

## 7. 當前 UI 狀態總結

### 設計風格
- **整體風格**: 3D 擬物風格，帶有微光和內陰影效果
- **配色方案**: 深色模式為主，使用純白色文字和高對比度
- **圓角設計**: 大圓角 (24-28px)，柔軟舒適
- **字體**: 金萱體 75 黑，字重 700
- **間距**: 寬鬆的間距設計，呼吸感強

### 主要顏色
- **背景**: 深色模式 `#121212`，淺色模式 `#FFFFFF`
- **表面**: 深色模式 `#202124`，淺色模式 `#F8FAFC`
- **文字**: 深色模式 `#FFFFFF`，淺色模式 `#1E293B`
- **重點色**: 
  - 成功/牌桌綠: `#007A5E`
  - 錯誤/深寶石紅: `#D70015`
  - 警告/賭場金: `#D4AF37`

---

## 8. 文件結構

### 主要 UI 文件
- `src/types/theme.ts` - 主題配置
- `src/context/ThemeContext.tsx` - 主題上下文
- `src/components/Button.tsx` - 按鈕組件
- `src/components/Card.tsx` - 卡片組件
- `src/components/TopTabBar.tsx` - 頂部導航欄
- `src/components/DoubleTabBar.tsx` - 底部導航欄
- `src/utils/fonts.ts` - 字體工具函數
- `App.tsx` - 全局樣式配置

---

**備註**: 此備份文檔記錄了當前 UI 的完整狀態。後續所有 UI 更改都應基於此原始版本進行，並在更改後更新此文檔。











