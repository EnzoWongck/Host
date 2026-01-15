-- ============================================
-- 修復 RLS INSERT 策略問題
-- 解決 dealers, expenses, rakes 表的 403 Forbidden 錯誤
-- 請在 Supabase Dashboard > SQL Editor 執行此腳本
-- ============================================

-- ============================================
-- 1. 修復 dealers 表 INSERT 策略
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
    OR
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = dealers.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- ============================================
-- 2. 修復 expenses 表 INSERT 策略
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
    OR
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = expenses.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- ============================================
-- 3. 修復 rakes 表 INSERT 策略
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
    OR
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = rakes.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- ============================================
-- 完成！
-- ============================================
-- 執行此腳本後，請測試添加發牌員、支出和抽水功能
-- 如果仍有問題，請檢查：
-- 1. 當前用戶是否有有效的 session
-- 2. game_id 是否正確
-- 3. games 表中的 user_id 是否與當前用戶匹配

