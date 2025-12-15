# 買入視窗（BuyInModal）顏色代碼清單

## 直接寫死的顏色代碼

### 淺色模式（Light Mode）
- `#E2E8F0` - 類型選擇按鈕激活狀態背景色（第55行）
- `#64748B` - 類型選擇按鈕激活狀態文字顏色（第65行）
- `#F8F9FA` - 輸入框背景色（第88行）
- `#E2E8F0` - 確認按鈕背景色（第351行）
- `#64748B` - 確認按鈕文字顏色（第364行）

### 深色模式（Dark Mode）
- `#303134` - 類型選擇按鈕激活狀態背景色（第55行）
- `#FFFFFF` - 類型選擇按鈕激活狀態文字顏色（第65行）
- `#202124` - 玩家狀態標籤背景色（第133行）

### 通用顏色（兩種模式共用）
- `#FFFFFF` - 玩家狀態文字顏色（activeStatus，第138行）
- `#FFFFFF` - 玩家狀態文字顏色（inactiveStatus，第141行，opacity: 0.7）
- `transparent` - 輸入框邊框顏色（淺色模式，第82行）
- `transparent` - 輸入框聚焦邊框顏色（淺色模式，第92行）
- `transparent` - placeholder 文字顏色（聚焦時隱藏，第297、338行）

## 從主題（Theme）引用的顏色

### 背景色
- `theme.colors.surface` - 類型選擇容器背景（第43行）
- `theme.colors.surface` - 類型選擇按鈕非激活狀態背景（第58行）
- `theme.colors.background` - 輸入框背景（深色模式，第88行）
- `theme.colors.background` - 玩家項目背景（第108行）
- `theme.colors.background` - 玩家狀態標籤背景（淺色模式，第133行）

### 文字顏色
- `theme.colors.text` - 標籤文字顏色（第76行）
- `theme.colors.text` - 輸入框文字顏色（第87行）
- `theme.colors.text` - 玩家名稱文字顏色（第120行）
- `theme.colors.textSecondary` - 類型選擇按鈕非激活狀態文字（第68行）
- `theme.colors.textSecondary` - 玩家統計文字顏色（第124行）
- `theme.colors.textSecondary` - placeholder 文字顏色（第298、339行）
- `theme.colors.textSecondary` - 空狀態文字顏色（第150行）

### 邊框顏色
- `theme.colors.border` - 輸入框邊框（深色模式，第82行）
- `theme.colors.border` - 玩家項目邊框（第105行）
- `theme.colors.border` - 玩家狀態標籤邊框（第135行）
- `theme.colors.primary` - 輸入框聚焦邊框（深色模式，第92行）
- `theme.colors.primary` - 選中玩家項目邊框（第111行）

### 其他
- `theme.colors.primary + '10'` - 選中玩家項目背景（透明度10%，第112行）

## 陰影效果顏色

### 確認按鈕陰影（淺色模式）
- `shadowColor: '#000'` - 陰影顏色（第352行）
- `shadowOpacity: 0.08` - 陰影透明度（第354行）

### 確認按鈕陰影（深色模式）
- `shadowColor: '#000'` - 陰影顏色（第358行）
- `shadowOpacity: 0.15` - 陰影透明度（第360行）

## 主題顏色對照表

### 淺色模式（lightTheme）
- `primary: '#E2E8F0'` - 深灰按鈕
- `secondary: '#8B5CF6'` - 紫色
- `background: '#FFFFFF'` - 白色背景
- `surface: '#F8FAFC'` - 卡片背景
- `text: '#1E293B'` - 深灰文字
- `textSecondary: '#64748B'` - 次要文字
- `border: '#E2E8F0'` - 邊框顏色
- `success: '#10B981'` - 綠色
- `error: '#EF4444'` - 紅色
- `warning: '#F59E0B'` - 橙色
- `info: '#3B82F6'` - 藍色

### 深色模式（darkTheme）
- `primary: '#303134'` - 深灰按鈕
- `secondary: '#303134'` - 深灰
- `background: '#1A1A1A'` - 深灰色背景
- `surface: '#202124'` - 卡片背景
- `text: '#FFFFFF'` - 白色文字
- `textSecondary: '#D1D5DB'` - 更亮的次要文字
- `border: '#3A3A3A'` - 邊框顏色
- `success: '#FFFFFF'` - 白色（深色模式下替代綠色文字）
- `error: '#EF4444'` - 紅色
- `warning: '#F59E0B'` - 橙色
- `info: '#6B7280'` - 灰色

## 顏色使用位置總結

1. **類型選擇區域**（第40-69行）
   - 容器背景：`theme.colors.surface`
   - 激活按鈕背景：淺色 `#E2E8F0` / 深色 `#303134`
   - 激活按鈕文字：淺色 `#64748B` / 深色 `#FFFFFF`
   - 非激活按鈕文字：`theme.colors.textSecondary`

2. **輸入框**（第79-94行）
   - 背景：淺色 `#F8F9FA` / 深色 `theme.colors.background`
   - 邊框：淺色 `transparent` / 深色 `theme.colors.border`
   - 聚焦邊框：淺色 `transparent` / 深色 `theme.colors.primary`
   - 文字：`theme.colors.text`
   - placeholder：`theme.colors.textSecondary`（聚焦時 `transparent`）

3. **玩家列表**（第99-143行）
   - 項目背景：`theme.colors.background`
   - 項目邊框：`theme.colors.border`
   - 選中項目邊框：`theme.colors.primary`
   - 選中項目背景：`theme.colors.primary + '10'`
   - 玩家名稱：`theme.colors.text`
   - 玩家統計：`theme.colors.textSecondary`
   - 狀態標籤背景：淺色 `theme.colors.background` / 深色 `#202124`
   - 狀態標籤邊框：`theme.colors.border`
   - 狀態文字：`#FFFFFF`（激活）或 `#FFFFFF` opacity 0.7（非激活）

4. **確認按鈕**（第346-365行）
   - 背景：淺色 `#E2E8F0` / 深色（使用主題）
   - 文字：淺色 `#64748B` / 深色（使用主題）
   - 陰影：`#000`（淺色 opacity 0.08，深色 opacity 0.15）


