-- ============================================
-- 診斷並修復 RLS INSERT 策略問題
-- 解決 403 Forbidden 錯誤
-- ============================================

-- ============================================
-- 步驟 1：檢查當前策略狀態
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('dealers', 'expenses', 'rakes')
  AND policyname LIKE '%_insert'
ORDER BY tablename, policyname;

-- ============================================
-- 步驟 2：檢查 RLS 是否啟用
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE schemaname = 'public'
  AND tablename IN ('dealers', 'expenses', 'rakes')
ORDER BY tablename;

-- ============================================
-- 步驟 3：刪除所有現有的 INSERT 策略（重新開始）
-- ============================================

-- Dealers 表
DROP POLICY IF EXISTS "dealers_insert" ON public.dealers;
DROP POLICY IF EXISTS "dealers_collaborator_insert" ON public.dealers;

-- Expenses 表
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_collaborator_insert" ON public.expenses;

-- Rakes 表
DROP POLICY IF EXISTS "rakes_insert" ON public.rakes;
DROP POLICY IF EXISTS "rakes_collaborator_insert" ON public.rakes;

-- ============================================
-- 步驟 4：重新創建完整的 INSERT 策略
-- 支持遊戲擁有者和協作者
-- ============================================

-- Dealers 表 INSERT 策略（遊戲擁有者）
CREATE POLICY "dealers_insert" ON public.dealers
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = dealers.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- Dealers 表 INSERT 策略（協作者）
CREATE POLICY "dealers_collaborator_insert" ON public.dealers
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = dealers.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- Expenses 表 INSERT 策略（遊戲擁有者）
CREATE POLICY "expenses_insert" ON public.expenses
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = expenses.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- Expenses 表 INSERT 策略（協作者）
CREATE POLICY "expenses_collaborator_insert" ON public.expenses
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = expenses.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- Rakes 表 INSERT 策略（遊戲擁有者）
CREATE POLICY "rakes_insert" ON public.rakes
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = rakes.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- Rakes 表 INSERT 策略（協作者）
CREATE POLICY "rakes_collaborator_insert" ON public.rakes
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = rakes.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- ============================================
-- 步驟 5：驗證策略已正確創建
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK defined'
    ELSE 'No WITH CHECK'
  END as has_with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('dealers', 'expenses', 'rakes')
  AND policyname LIKE '%_insert'
ORDER BY tablename, policyname;

-- ============================================
-- 步驟 6：診斷查詢（可選）
-- ============================================
-- 如果您想要測試策略是否工作，可以運行以下查詢：
-- （替換 'YOUR_GAME_ID' 和 'YOUR_USER_ID'）
-- 
-- SELECT 
--   EXISTS (
--     SELECT 1 FROM games 
--     WHERE games.id = 'YOUR_GAME_ID' 
--     AND games.user_id = 'YOUR_USER_ID'::uuid
--   ) as game_owner_check,
--   EXISTS (
--     SELECT 1 FROM game_collaborations 
--     WHERE game_collaborations.game_id = 'YOUR_GAME_ID' 
--     AND game_collaborations.collaborator_id = auth.uid()
--     AND game_collaborations.status = 'accepted'
--     AND game_collaborations.chip_consumed = TRUE
--   ) as collaborator_check;

-- ============================================
-- 完成！
-- ============================================
-- 執行此腳本後，嘗試重新添加抽水、支出和發牌員
-- 如果仍有問題，請檢查：
-- 1. 當前用戶是否有有效的 session（auth.uid() 是否返回正確的值）
-- 2. game_id 是否正確存在於 games 表中
-- 3. games 表中的 user_id 是否與當前用戶匹配

