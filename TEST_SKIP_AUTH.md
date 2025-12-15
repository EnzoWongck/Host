# 測試跳過登入功能

## 當前配置

- `src/config/dev.ts`: `SKIP_AUTH_ON_WEB = true`
- 邏輯：在 Web 平台上自動跳過登入，直接顯示主頁面

## 測試步驟

### 1. 清除緩存並重新啟動

```bash
# 停止當前運行的應用
# 然後重新啟動
npm run web:clean
```

或

```bash
npm run kill
npm run web
```

### 2. 檢查配置

確認 `src/config/dev.ts` 文件：
```typescript
export const SKIP_AUTH_ON_WEB = true;
```

### 3. 驗證邏輯

在 `App.tsx` 中，第 130-132 行應該有：
```typescript
if (shouldSkipAuth) {
  return <MainTabNavigator />;
}
```

這意味著如果 `Platform.OS === 'web'` 且 `SKIP_AUTH_ON_WEB === true`，會直接返回主頁面。

## 如果仍然需要登入

### 可能的原因：

1. **緩存問題**：瀏覽器或 Metro bundler 緩存了舊代碼
   - 解決：清除瀏覽器緩存（Ctrl+Shift+Delete）或使用無痕模式
   - 解決：重新啟動 Metro bundler

2. **平台檢測問題**：`Platform.OS` 可能沒有正確識別為 'web'
   - 檢查：在瀏覽器控制台查看 `Platform.OS` 的值

3. **配置未生效**：TypeScript 編譯緩存
   - 解決：刪除 `.expo` 文件夾並重新啟動

### 調試方法：

在 `App.tsx` 中添加臨時日誌：

```typescript
console.log('Platform.OS:', Platform.OS);
console.log('SKIP_AUTH_ON_WEB:', SKIP_AUTH_ON_WEB);
console.log('shouldSkipAuth:', shouldSkipAuth);
```

## 強制跳過登入（臨時方案）

如果上述方法都不行，可以臨時修改 `App.tsx`：

```typescript
// 強制跳過登入（臨時）
const shouldSkipAuth = true; // 強制為 true
```

然後重新啟動應用。

