-- ============================================
-- 緊急修復：創建更寬鬆的測試策略
-- 僅用於診斷問題，不建議長期使用
-- ============================================

-- ============================================
-- 先刪除現有策略
-- ============================================
DROP POLICY IF EXISTS "rakes_insert" ON public.rakes;
DROP POLICY IF EXISTS "rakes_collaborator_insert" ON public.rakes;
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_collaborator_insert" ON public.expenses;
DROP POLICY IF EXISTS "dealers_insert" ON public.dealers;
DROP POLICY IF EXISTS "dealers_collaborator_insert" ON public.dealers;

-- ============================================
-- 創建簡化的策略（只檢查 game_id 是否存在）
-- 這會允許任何已登入用戶插入，只要 game_id 存在
-- ⚠️ 警告：這是一個臨時測試策略，安全性較低
-- ============================================

-- Rakes 表
CREATE POLICY "rakes_insert" ON public.rakes
  FOR INSERT 
  WITH CHECK (
    -- 檢查 game_id 是否存在於 games 表中
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = rakes.game_id
    )
    AND
    -- 檢查用戶已登入
    auth.uid() IS NOT NULL
    AND
    (
      -- 用戶是遊戲擁有者
      EXISTS (
        SELECT 1 FROM games 
        WHERE games.id = rakes.game_id 
        AND games.user_id = auth.uid()
      )
      OR
      -- 或者用戶是協作者
      EXISTS (
        SELECT 1 FROM game_collaborations 
        WHERE game_collaborations.game_id = rakes.game_id 
        AND game_collaborations.collaborator_id = auth.uid()
        AND game_collaborations.status = 'accepted'
        AND game_collaborations.chip_consumed = TRUE
      )
    )
  );

-- Expenses 表
CREATE POLICY "expenses_insert" ON public.expenses
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = expenses.game_id
    )
    AND
    auth.uid() IS NOT NULL
    AND
    (
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
    )
  );

-- Dealers 表
CREATE POLICY "dealers_insert" ON public.dealers
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = dealers.game_id
    )
    AND
    auth.uid() IS NOT NULL
    AND
    (
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
    )
  );

-- ============================================
-- 驗證
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  '✅ 策略已創建' as status
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('dealers', 'expenses', 'rakes')
  AND cmd = 'INSERT'
ORDER BY tablename;

-- ============================================
-- 測試插入權限
-- ============================================
SELECT 
  '測試: Session 狀態' as test_name,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ 用戶已登入: ' || auth.uid()::text
    ELSE '❌ 用戶未登入 - 這是問題所在！'
  END as result;

