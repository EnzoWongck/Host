# 輸入欄（TextInput）顏色代碼清單

## 通用輸入欄樣式（多數組件共用）

### 1. BuyInModal（買入視窗）
**位置：** `src/components/BuyInModal.tsx` (第79-94行)

#### 淺色模式（Light Mode）
- **邊框寬度：** `0`（無邊框）
- **邊框顏色：** `transparent`
- **背景色：** `#F8F9FA`
- **文字顏色：** `theme.colors.text` (`#1E293B`)
- **聚焦邊框：** `transparent`（無邊框）

#### 深色模式（Dark Mode）
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border` (`#3A3A3A`)
- **背景色：** `theme.colors.background` (`#1A1A1A`)
- **文字顏色：** `theme.colors.text` (`#FFFFFF`)
- **聚焦邊框：** `theme.colors.primary` (`#303134`)

#### Placeholder 顏色
- **未聚焦：** `theme.colors.textSecondary`
- **聚焦時：** `transparent`（隱藏）

---

### 2. CashOutModal（兌現視窗）
**位置：** `src/components/CashOutModal.tsx` (第69-84行)

**與 BuyInModal 完全相同**

#### 淺色模式
- **邊框寬度：** `0`
- **邊框顏色：** `transparent`
- **背景色：** `#F8F9FA`
- **文字顏色：** `theme.colors.text`
- **聚焦邊框：** `transparent`

#### 深色模式
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border` (`#3A3A3A`)
- **背景色：** `theme.colors.background` (`#1A1A1A`)
- **文字顏色：** `theme.colors.text` (`#FFFFFF`)
- **聚焦邊框：** `theme.colors.primary` (`#303134`)

---

### 3. ExpenseModal（支出視窗）
**位置：** `src/components/ExpenseModal.tsx` (第140-155行)

**與 BuyInModal 完全相同**

#### 淺色模式
- **邊框寬度：** `0`
- **邊框顏色：** `transparent`
- **背景色：** `#F8F9FA`
- **文字顏色：** `theme.colors.text`
- **聚焦邊框：** `transparent`

#### 深色模式
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border` (`#3A3A3A`)
- **背景色：** `theme.colors.background` (`#1A1A1A`)
- **文字顏色：** `theme.colors.text` (`#FFFFFF`)
- **聚焦邊框：** `theme.colors.primary` (`#303134`)

---

### 4. RakeModal（抽水視窗）
**位置：** `src/components/RakeModal.tsx` (第48-69行)

**與 BuyInModal 完全相同**

#### 淺色模式
- **邊框寬度：** `0`
- **邊框顏色：** `transparent`
- **背景色：** `#F8F9FA`
- **文字顏色：** `theme.colors.text`
- **聚焦邊框：** `transparent`

#### 深色模式
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border` (`#3A3A3A`)
- **背景色：** `theme.colors.background` (`#1A1A1A`)
- **文字顏色：** `theme.colors.text` (`#FFFFFF`)
- **聚焦邊框：** `theme.colors.primary` (`#303134`)

---

## 特殊輸入欄樣式

### 5. NewGameModal（新增牌局視窗）
**位置：** `src/components/NewGameModal.tsx` (第57-71行)

#### 淺色模式（Light Mode）
- **邊框寬度：** `1`
- **邊框顏色：** `#E5E7EB`
- **背景色：** `#F8F9FA`
- **文字顏色：** `theme.colors.text` (`#1E293B`)
- **聚焦邊框：** `#E5E7EB`（保持不變）

#### 深色模式（Dark Mode）
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border` (`#3A3A3A`)
- **背景色：** `theme.colors.background` (`#1A1A1A`)
- **文字顏色：** `theme.colors.text` (`#FFFFFF`)
- **聚焦邊框：** `theme.colors.primary` (`#303134`)

#### 盲注輸入欄（Blind Input）
**位置：** `src/components/NewGameModal.tsx` (第138-154行)

##### 淺色模式
- **邊框寬度：** `1`
- **邊框顏色：** `#E5E7EB`
- **聚焦邊框：** `#E2E8F0`
- **聚焦背景：** `#F8F9FA`

##### 深色模式
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border` (`#3A3A3A`)
- **聚焦邊框：** `theme.colors.primary` (`#303134`)
- **聚焦背景：** `theme.colors.background` (`#1A1A1A`)

---

### 6. InsuranceModal（保險視窗）
**位置：** `src/components/InsuranceModal.tsx` (第65-74行)

#### 淺色模式（Light Mode）
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border` (`#E2E8F0`)
- **背景色：** `#F8F9FA`
- **文字顏色：** `theme.colors.text` (`#1E293B`)

#### 深色模式（Dark Mode）
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border` (`#3A3A3A`)
- **背景色：** `theme.colors.background` (`#1A1A1A`)
- **文字顏色：** `theme.colors.text` (`#FFFFFF`)

---

### 7. EndGameModal（結束牌局視窗）
**位置：** `src/components/EndGameModal.tsx` (第110-118行)

#### 兩種模式共用
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border`
- **背景色：** `theme.colors.background`
- **文字顏色：** `theme.colors.text`

#### 淺色模式
- **邊框顏色：** `#E2E8F0`
- **背景色：** `#FFFFFF`
- **文字顏色：** `#1E293B`

#### 深色模式
- **邊框顏色：** `#3A3A3A`
- **背景色：** `#1A1A1A`
- **文字顏色：** `#FFFFFF`

---

### 8. DealerModal（荷官視窗）
**位置：** `src/components/DealerModal.tsx`

#### 時間輸入欄
- **邊框顏色：** `theme.colors.border`
- **背景色：** `theme.colors.background`

#### 時薪輸入欄
- **邊框顏色：** `theme.colors.border`
- **背景色：** `theme.colors.background`

#### 工時輸入欄
- **邊框顏色：** `theme.colors.border`
- **背景色：** `theme.colors.background`

---

### 9. EntryFeeModal（入場費視窗）
**位置：** `src/components/EntryFeeModal.tsx`

#### 兩種模式共用
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border`
- **背景色：** `theme.colors.background`
- **文字顏色：** `theme.colors.text`
- **聚焦邊框：** `theme.colors.primary`

---

### 10. GameCollaborationModal（協作視窗）
**位置：** `src/components/GameCollaborationModal.tsx` (第282-288行)

#### 兩種模式共用
- **邊框寬度：** `1`
- **邊框顏色：** `theme.colors.border`
- **背景色：** `theme.colors.background`
- **文字顏色：** `theme.colors.text`

---

### 11. AddDealerForm（新增荷官表單）
**位置：** `src/components/AddDealerForm.tsx`

#### 淺色模式
- **邊框寬度：** `0`
- **邊框顏色：** `transparent`
- **背景色：** `#F8F9FA`

#### 深色模式
- **邊框寬度：** `0`
- **邊框顏色：** `transparent`
- **背景色：** `theme.colors.background`

---

## 顏色代碼總結表

### 直接寫死的顏色代碼

#### 淺色模式專用
- `#F8F9FA` - 輸入框背景色（多數組件）
- `#E5E7EB` - 邊框顏色（NewGameModal）
- `#E2E8F0` - 聚焦邊框顏色（NewGameModal 盲注輸入）
- `transparent` - 無邊框輸入框邊框顏色

#### 深色模式專用
- `#1A1A1A` - 背景色（通過 `theme.colors.background`）
- `#3A3A3A` - 邊框顏色（通過 `theme.colors.border`）
- `#303134` - 聚焦邊框顏色（通過 `theme.colors.primary`）

### 主題顏色引用

#### 背景色
- `theme.colors.background` - 深色模式輸入框背景
- `theme.colors.surface` - 某些特殊輸入欄背景

#### 邊框顏色
- `theme.colors.border` - 標準邊框顏色
- `theme.colors.primary` - 聚焦邊框顏色

#### 文字顏色
- `theme.colors.text` - 輸入文字顏色
- `theme.colors.textSecondary` - Placeholder 文字顏色

### 主題顏色值對照

#### 淺色模式（lightTheme）
- `background: '#FFFFFF'`
- `surface: '#F8FAFC'`
- `text: '#1E293B'`
- `textSecondary: '#64748B'`
- `border: '#E2E8F0'`
- `primary: '#E2E8F0'`

#### 深色模式（darkTheme）
- `background: '#1A1A1A'`
- `surface: '#202124'`
- `text: '#FFFFFF'`
- `textSecondary: '#D1D5DB'`
- `border: '#3A3A3A'`
- `primary: '#303134'`

---

## 輸入欄樣式模式分類

### 模式 A：無邊框樣式（淺色模式）
**使用組件：** BuyInModal, CashOutModal, ExpenseModal, RakeModal, AddDealerForm

**特點：**
- 淺色模式：無邊框，淡灰色背景
- 深色模式：有邊框，深色背景

### 模式 B：始終有邊框樣式
**使用組件：** NewGameModal, InsuranceModal, EndGameModal, EntryFeeModal, GameCollaborationModal

**特點：**
- 兩種模式都有邊框
- 邊框顏色根據模式變化

### 模式 C：特殊樣式
**使用組件：** NewGameModal 盲注輸入欄

**特點：**
- 聚焦時改變邊框顏色和背景色
- 淺色模式聚焦邊框：`#E2E8F0`
- 深色模式聚焦邊框：`theme.colors.primary`

---

## 常用輸入欄樣式代碼模板

### 模板 1：無邊框樣式（淺色模式）
```typescript
input: {
  borderWidth: colorMode === 'light' ? 0 : 1,
  borderColor: colorMode === 'light' ? 'transparent' : theme.colors.border,
  borderRadius: theme.borderRadius.sm,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  fontSize: theme.fontSize.md,
  color: theme.colors.text,
  backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.background,
},
inputFocused: {
  borderColor: colorMode === 'light' ? 'transparent' : theme.colors.primary,
  borderWidth: colorMode === 'light' ? 0 : 1,
},
```

### 模板 2：始終有邊框樣式
```typescript
input: {
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: theme.borderRadius.sm,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  fontSize: theme.fontSize.md,
  color: theme.colors.text,
  backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.background,
},
inputFocused: {
  borderColor: theme.colors.primary,
  borderWidth: 1,
},
```

### 模板 3：NewGameModal 樣式
```typescript
input: {
  borderWidth: 1,
  borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
  borderRadius: theme.borderRadius.sm,
  paddingVertical: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  fontSize: theme.fontSize.md,
  color: theme.colors.text,
  backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.background,
},
inputFocused: {
  borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.primary,
  borderWidth: 1,
},
```


