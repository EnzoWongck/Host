# 檢查瀏覽器中的 Session 狀態

## 問題診斷
在 Supabase SQL Editor 中 `auth.uid()` 返回 NULL 是正常的，因為它使用 `postgres` 角色執行。

真正的問題可能在於前端應用中插入數據時，session 沒有正確傳遞。

## 檢查步驟

### 1. 在瀏覽器控制台檢查 Session

打開瀏覽器開發者工具（F12），在 Console 中執行：

```javascript
// 檢查 localStorage 中的 Supabase session
const supabaseSession = localStorage.getItem('sb-plnghuqosljnezjfpvmc-auth-token');
console.log('Supabase Session:', supabaseSession ? JSON.parse(supabaseSession) : 'Not found');

// 或者使用項目中的 supabase client（如果在 window 上可用）
// 如果 supabase 對象在 window 上可用
if (window.supabase) {
  window.supabase.auth.getSession().then(({ data, error }) => {
    console.log('Current Session:', data.session);
    console.log('Session Error:', error);
    console.log('User ID:', data.session?.user?.id);
  });
}
```

### 2. 檢查 Network 請求

1. 打開瀏覽器開發者工具 → Network 標籤
2. 嘗試添加抽水/支出/發牌員
3. 查看對 Supabase 的請求：
   - 請求 URL
   - Request Headers（檢查是否有 `Authorization: Bearer <token>`）
   - Response（查看具體的錯誤信息）

### 3. 檢查錯誤訊息

如果看到 403 錯誤，查看 Response 中的詳細訊息：
- 錯誤代碼
- 錯誤訊息
- 是否有 hint 或 details

## 可能的原因

1. **Session 過期**
   - Session token 可能已過期
   - 需要重新登入或刷新 token

2. **Token 未正確傳遞**
   - Supabase client 可能沒有自動附加認證 header
   - 檢查請求 headers

3. **RLS 策略條件不滿足**
   - `auth.uid()` 在策略執行時返回 NULL
   - 即使前端有 session，策略中可能無法讀取

## 解決方案

如果確認 session 存在但仍有 403 錯誤，可能需要：
1. 確保 Supabase client 正確初始化
2. 檢查 RLS 策略是否正確
3. 嘗試重新登入以刷新 session

