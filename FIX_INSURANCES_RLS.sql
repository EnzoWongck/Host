-- ============================================
-- 修復 Insurances 表 RLS INSERT 策略
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
  AND tablename = 'insurances'
  AND policyname LIKE '%_insert'
ORDER BY tablename, policyname;

-- ============================================
-- 步驟 2：刪除現有的 INSERT 策略
-- ============================================
DROP POLICY IF EXISTS "insurances_insert" ON public.insurances;
DROP POLICY IF EXISTS "insurances_collaborator_insert" ON public.insurances;

-- ============================================
-- 步驟 3：重新創建完整的 INSERT 策略
-- 支持遊戲擁有者和協作者
-- ============================================

-- Insurances 表 INSERT 策略（遊戲擁有者）
CREATE POLICY "insurances_insert" ON public.insurances
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM games 
        WHERE games.id = insurances.game_id 
        AND games.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM game_collaborations 
        WHERE game_collaborations.game_id = insurances.game_id 
        AND game_collaborations.collaborator_id = auth.uid()
        AND game_collaborations.status = 'accepted'
        AND game_collaborations.chip_consumed = TRUE
      )
    )
  );

-- ============================================
-- 步驟 4：驗證策略已正確創建
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
  AND tablename = 'insurances'
  AND policyname LIKE '%_insert'
ORDER BY tablename, policyname;

-- ============================================
-- 完成！
-- ============================================
-- 執行此腳本後，嘗試重新添加保險記錄
-- 如果仍有問題，請檢查：
-- 1. 當前用戶是否有有效的 session（auth.uid() 是否返回正確的值）
-- 2. game_id 是否正確存在於 games 表中
-- 3. games 表中的 user_id 是否與當前用戶匹配，或者用戶是協作者

