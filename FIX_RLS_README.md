# 🔒 Supabase RLS 安全問題修復指南

## 問題概述

Supabase Dashboard 顯示了 9 個安全級別的錯誤，全部與 Row Level Security (RLS) 相關：

### 問題類型 1：有策略但 RLS 未啟用
- ✅ `dealers` - 已有協作策略但 RLS 未啟用
- ✅ `expenses` - 已有協作策略但 RLS 未啟用
- ✅ `insurances` - 已有協作策略但 RLS 未啟用
- ✅ `rakes` - 已有協作策略但 RLS 未啟用

### 問題類型 2：public schema 中的表未啟用 RLS
- ✅ `game_chips` - RLS 未啟用
- ✅ `insurances` - RLS 未啟用（與問題類型 1 重疊）
- ✅ `dealers` - RLS 未啟用（與問題類型 1 重疊）
- ✅ `expenses` - RLS 未啟用（與問題類型 1 重疊）
- ✅ `rakes` - RLS 未啟用（與問題類型 1 重疊）
- ⚠️ `users` - 需要檢查是否存在此表

## 修復步驟

### 1. 執行修復腳本

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 前往 **SQL Editor**
4. 複製 `FIX_RLS_SECURITY_ISSUES.sql` 的內容
5. 貼上並執行

### 2. 驗證修復結果

執行腳本後，最後的查詢會顯示所有相關表的 RLS 狀態：

```sql
SELECT 
  tablename,
  rls_enabled
FROM ...
```

所有表應該顯示 `rls_enabled = true`

### 3. 檢查 Dashboard

1. 刷新 Supabase Dashboard
2. 前往 **Advisor** 或 **Database Linter**
3. 確認所有安全相關的錯誤已解決

## 修復內容說明

### ✅ 已修復的表

#### `dealers`, `expenses`, `insurances`, `rakes`
- **問題**：這些表有協作相關的 RLS 策略（`*_collaborator_*`），但 RLS 本身未啟用
- **修復**：執行 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- **影響**：這些策略現在會生效，確保協作功能的安全性

#### `game_chips`
- **問題**：表存在但 RLS 未啟用
- **修復**：
  1. 啟用 RLS
  2. 如果缺少策略，自動創建基本策略（允許用戶訪問自己的記錄）

#### `users` 表（如果存在）
- **問題**：可能是系統表或自定義表
- **處理**：
  - 腳本會檢查表是否存在
  - 如果存在，會啟用 RLS 並嘗試創建基本策略
  - 如果表結構不同，可能需要手動調整策略

## 注意事項

⚠️ **重要**：執行此腳本後，請測試以下功能：

1. ✅ **遊戲創建和管理** - 確保用戶仍可正常創建和管理遊戲
2. ✅ **協作功能** - 測試協作邀請和接受功能
3. ✅ **Chips 系統** - 確認 chips 的消費和查詢正常
4. ✅ **玩家、發牌員、支出管理** - 確認所有 CRUD 操作正常

## 如果遇到問題

### RLS 策略過於嚴格
如果某些操作被阻止，可能需要調整策略：

```sql
-- 查看現有策略
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- 刪除並重新創建策略（謹慎操作）
DROP POLICY IF EXISTS "policy_name" ON table_name;
-- 然後根據需求重新創建
```

### 查看 RLS 日誌
在 Supabase Dashboard 中：
1. 前往 **Logs** > **Postgres Logs**
2. 查看是否有 RLS 相關的錯誤訊息

## 相關文件

- `SUPABASE_MIGRATION.sql` - 原始數據庫遷移腳本
- `SUPABASE_COLLABORATION_MIGRATION.sql` - 協作功能遷移腳本

## 完成後

執行修復腳本後，請：
1. ✅ 確認所有 9 個安全錯誤已解決
2. ✅ 測試應用功能是否正常
3. ✅ 檢查剩餘的 47 個問題（可能是性能優化建議）

---

**修復腳本位置**：`FIX_RLS_SECURITY_ISSUES.sql`

