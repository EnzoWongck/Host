# UI 樣式備份

## 當前主題配置 (原始版本)

### 淺色主題
```typescript
export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#007AFF',
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
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};
```

### 深色主題
```typescript
export const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    info: '#0A84FF',
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
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};
```

## 當前組件樣式

### Card 組件
- 背景色：淺色模式為 #FFFFFF，深色模式為 theme.colors.surface
- 圓角：theme.borderRadius.md (8px)
- 邊框：0.5px solid theme.colors.border
- 陰影：輕微陰影效果 (shadowOpacity: 0.1, shadowRadius: 3, elevation: 2)

### Button 組件
- 圓角：theme.borderRadius.sm (4px)
- 字重：600
- 尺寸：sm (12x8), md (16x12), lg (24x16)
- 字體大小：sm (14), md (16), lg (18)

### DoubleTabBar 組件
- 背景色：theme.colors.background
- 標籤字體大小：12px
- 標籤字重：600
- 圖標大小：24px

### HomeScreen 樣式
- 標題字體大小：theme.fontSize.xxl (24px)
- 標題字重：bold
- 區段標題字體大小：theme.fontSize.lg (18px)
- 區段標題字重：600

## 恢復方法

如果需要恢復到原始樣式，請將 `/src/types/theme.ts` 文件中的主題配置替換為上述原始配置。

## 修改記錄

- 2025-01-09: 創建備份，準備進行UI現代化改進




