-- ============================================
-- 恢復 Supabase RLS 策略到修復腳本前的狀態
-- 將 INSERT 策略恢復為僅檢查遊戲擁有者（不包含協作者）
-- ============================================

-- ============================================
-- 1. 恢復 dealers 表 INSERT 策略
-- ============================================
DROP POLICY IF EXISTS "dealers_insert" ON public.dealers;

CREATE POLICY "dealers_insert" ON public.dealers
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = dealers.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- ============================================
-- 2. 恢復 expenses 表 INSERT 策略
-- ============================================
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;

CREATE POLICY "expenses_insert" ON public.expenses
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = expenses.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. 恢復 rakes 表 INSERT 策略
-- ============================================
DROP POLICY IF EXISTS "rakes_insert" ON public.rakes;

CREATE POLICY "rakes_insert" ON public.rakes
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = rakes.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- ============================================
-- 注意：
-- ============================================
-- 這個腳本會將 INSERT 策略恢復為僅檢查遊戲擁有者
-- 協作者仍然可以通過 "collaborator_insert" 策略插入數據
-- 如果您的系統需要協作者支持，請保留協作策略
-- ============================================

-- ============================================
-- 驗證策略狀態
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

