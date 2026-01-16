-- ============================================
-- 全面診斷和修復 RLS INSERT 策略問題
-- 解決持續的 403 Forbidden 錯誤
-- ============================================

-- ============================================
-- 步驟 1：檢查當前用戶 session
-- ============================================
-- 首先確認 auth.uid() 是否有效
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ 沒有有效的 session'
    ELSE '✅ Session 有效'
  END as session_status;

-- ============================================
-- 步驟 2：檢查所有相關策略（包括 SELECT, UPDATE, DELETE）
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING defined'
    ELSE 'No USING'
  END as has_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK defined'
    ELSE 'No WITH CHECK'
  END as has_with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('dealers', 'expenses', 'rakes')
ORDER BY tablename, policyname, cmd;

-- ============================================
-- 步驟 3：檢查 RLS 狀態
-- ============================================
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS 已啟用'
    ELSE '❌ RLS 未啟用'
  END as rls_status
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE schemaname = 'public'
  AND tablename IN ('dealers', 'expenses', 'rakes')
ORDER BY tablename;

-- ============================================
-- 步驟 4：完全清理所有策略（重新開始）
-- ============================================

-- Dealers 表 - 刪除所有策略
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'dealers'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.dealers', r.policyname);
  END LOOP;
END $$;

-- Expenses 表 - 刪除所有策略
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'expenses'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.expenses', r.policyname);
  END LOOP;
END $$;

-- Rakes 表 - 刪除所有策略
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'rakes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.rakes', r.policyname);
  END LOOP;
END $$;

-- ============================================
-- 步驟 5：確保 RLS 已啟用
-- ============================================
ALTER TABLE IF EXISTS public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rakes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 步驟 6：重新創建所有策略（完整版本）
-- ============================================

-- ========== DEALERS 表 ==========

-- SELECT 策略（擁有者）
CREATE POLICY "dealers_select" ON public.dealers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = dealers.game_id 
      AND games.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = dealers.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- INSERT 策略（擁有者）
CREATE POLICY "dealers_insert" ON public.dealers
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = dealers.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- INSERT 策略（協作者）
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

-- UPDATE 策略（擁有者）
CREATE POLICY "dealers_update" ON public.dealers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = dealers.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- DELETE 策略（擁有者）
CREATE POLICY "dealers_delete" ON public.dealers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = dealers.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- ========== EXPENSES 表 ==========

-- SELECT 策略（擁有者）
CREATE POLICY "expenses_select" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = expenses.game_id 
      AND games.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = expenses.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- INSERT 策略（擁有者）
CREATE POLICY "expenses_insert" ON public.expenses
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = expenses.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- INSERT 策略（協作者）
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

-- UPDATE 策略（擁有者）
CREATE POLICY "expenses_update" ON public.expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = expenses.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- DELETE 策略（擁有者）
CREATE POLICY "expenses_delete" ON public.expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = expenses.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- ========== RAKES 表 ==========

-- SELECT 策略（擁有者）
CREATE POLICY "rakes_select" ON public.rakes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = rakes.game_id 
      AND games.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = rakes.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- INSERT 策略（擁有者）
CREATE POLICY "rakes_insert" ON public.rakes
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = rakes.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- INSERT 策略（協作者）
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

-- UPDATE 策略（擁有者）
CREATE POLICY "rakes_update" ON public.rakes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = rakes.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- DELETE 策略（擁有者）
CREATE POLICY "rakes_delete" ON public.rakes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = rakes.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- ============================================
-- 步驟 7：驗證所有策略
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ WITH CHECK'
    WHEN qual IS NOT NULL THEN '✅ USING'
    ELSE '❌ 無條件'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('dealers', 'expenses', 'rakes')
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 步驟 8：診斷查詢
-- ============================================
-- 檢查當前用戶和遊戲關係
SELECT 
  '當前用戶 ID' as check_type,
  auth.uid()::text as value;

SELECT 
  '擁有的遊戲數量' as check_type,
  COUNT(*)::text as value
FROM games 
WHERE games.user_id = auth.uid();

SELECT 
  '協作遊戲數量' as check_type,
  COUNT(*)::text as value
FROM game_collaborations 
WHERE game_collaborations.collaborator_id = auth.uid()
  AND game_collaborations.status = 'accepted'
  AND game_collaborations.chip_consumed = TRUE;

-- ============================================
-- 完成！
-- ============================================
-- 如果仍然有錯誤，請檢查：
-- 1. auth.uid() 是否返回 null（步驟 1 會顯示）
-- 2. 策略是否正確創建（步驟 7 會顯示）
-- 3. 嘗試插入的 game_id 是否存在於 games 表中
-- 4. games 表中的 user_id 是否與當前用戶匹配

