# 深色模式支出視窗背景顏色代碼

## 視窗背景（Modal Container Background）

**位置：** `src/components/Modal.tsx` (第51行)

**深色模式顏色代碼：**
- `#202124` - 通過 `theme.colors.surface` 引用

**代碼：**
```typescript
modalContainer: {
  backgroundColor: theme.colorMode === 'light' ? '#FFFFFF' : theme.colors.surface,
  // ...
}
```

**說明：**
- 深色模式下，視窗背景使用 `theme.colors.surface`
- 根據 `src/types/theme.ts`，深色模式的 `surface` 值為 `#202124`
- 這是卡片背景色，比主背景色（`#1A1A1A`）稍亮，用於保持視覺層次感

---

## 輸入欄背景（Input Field Background）

**位置：** `src/components/ExpenseModal.tsx` (第149行)

**深色模式顏色代碼：**
- `#1A1A1A` - 通過 `theme.colors.background` 引用

**代碼：**
```typescript
input: {
  backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.background,
  // ...
}
```

**說明：**
- 深色模式下，輸入欄背景使用 `theme.colors.background`
- 根據 `src/types/theme.ts`，深色模式的 `background` 值為 `#1A1A1A`
- 這是應用程式的主背景色

---

## 完整輸入欄樣式（深色模式）

**位置：** `src/components/ExpenseModal.tsx` (第140-155行)

```typescript
input: {
  borderWidth: 1,                                    // 有邊框
  borderColor: theme.colors.border,                  // #3A3A3A
  borderRadius: theme.borderRadius.sm,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  fontSize: theme.fontSize.md,
  color: theme.colors.text,                         // #FFFFFF
  backgroundColor: theme.colors.background,         // #1A1A1A
},
inputFocused: {
  borderColor: theme.colors.primary,                // #303134
  borderWidth: 1,
},
```

---

## 顏色代碼總結

### 深色模式支出視窗顏色

| 元素 | 顏色代碼 | 主題引用 | 說明 |
|------|---------|---------|------|
| **視窗背景** | `#202124` | `theme.colors.surface` | Modal 容器背景 |
| **輸入欄背景** | `#1A1A1A` | `theme.colors.background` | 輸入框背景 |
| **輸入欄邊框** | `#3A3A3A` | `theme.colors.border` | 輸入框邊框 |
| **輸入欄聚焦邊框** | `#303134` | `theme.colors.primary` | 聚焦時的邊框 |
| **輸入欄文字** | `#FFFFFF` | `theme.colors.text` | 輸入文字顏色 |

---

## 視覺層次說明

在深色模式下，支出視窗的視覺層次：

1. **最外層（視窗背景）：** `#202124` (surface) - 較亮的灰色
2. **內層（輸入欄背景）：** `#1A1A1A` (background) - 較暗的灰色

這種設計創造了視覺深度，讓視窗內容與背景有明顯區分。


