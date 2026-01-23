-- ============================================
-- 診斷 Insurances 表 RLS 問題
-- ============================================

-- 1. 檢查 RLS 是否啟用
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE schemaname = 'public'
  AND tablename = 'insurances';

-- 2. 檢查所有現有策略
SELECT 
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'insurances'
ORDER BY policyname;

-- 3. 檢查當前用戶的 session（在 SQL Editor 中會返回 NULL，這是正常的）
SELECT 
  auth.uid() as current_user_id,
  '⚠️ 在 SQL Editor 中 auth.uid() 返回 NULL 是正常的' as note;

-- 4. 檢查 games 表結構
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'games'
ORDER BY ordinal_position;

-- 5. 檢查 insurances 表結構
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'insurances'
ORDER BY ordinal_position;

-- 6. 列出所有遊戲（用於測試）
SELECT 
  id as game_id,
  name as game_name,
  user_id as owner_id,
  status
FROM games
LIMIT 10;

-- ============================================
-- 重要提示
-- ============================================
-- 1. 在 SQL Editor 中，auth.uid() 返回 NULL 是正常的
-- 2. 真正的測試應該在前端應用中進行
-- 3. 如果前端仍然有 403 錯誤，請檢查：
--    - 瀏覽器 Console 中的錯誤訊息
--    - Network 標籤中的請求詳情
--    - localStorage 中的 session token

