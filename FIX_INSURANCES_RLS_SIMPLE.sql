-- ============================================
-- 簡化版：修復 Insurances 表 RLS INSERT 策略
-- 只檢查遊戲擁有者，不檢查協作者
-- 如果此版本可以工作，再使用完整版本
-- ============================================

-- 刪除現有的 INSERT 策略
DROP POLICY IF EXISTS "insurances_insert" ON public.insurances;
DROP POLICY IF EXISTS "insurances_collaborator_insert" ON public.insurances;

-- 創建簡化的 INSERT 策略（只檢查遊戲擁有者）
CREATE POLICY "insurances_insert" ON public.insurances
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = insurances.game_id 
      AND games.user_id = auth.uid()
    )
  );

-- 驗證策略已創建
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

