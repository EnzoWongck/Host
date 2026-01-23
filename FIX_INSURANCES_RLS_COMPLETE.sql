-- ============================================
-- 完整修復 Insurances 表所有 RLS 策略
-- 解決 403 Forbidden 錯誤（SELECT, INSERT, UPDATE, DELETE）
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
ORDER BY tablename, policyname, cmd;

-- ============================================
-- 步驟 2：刪除所有現有策略
-- ============================================
DROP POLICY IF EXISTS "insurances_select" ON public.insurances;
DROP POLICY IF EXISTS "insurances_insert" ON public.insurances;
DROP POLICY IF EXISTS "insurances_update" ON public.insurances;
DROP POLICY IF EXISTS "insurances_delete" ON public.insurances;
DROP POLICY IF EXISTS "insurances_collaborator_insert" ON public.insurances;

-- ============================================
-- 步驟 3：重新創建所有策略
-- 支持遊戲擁有者和協作者
-- ============================================

-- SELECT 策略（查詢保險記錄）
CREATE POLICY "insurances_select" ON public.insurances
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND (
      -- 用戶是遊戲擁有者
      EXISTS (
        SELECT 1 FROM games 
        WHERE games.id = insurances.game_id 
        AND games.user_id = auth.uid()
      )
      OR
      -- 或者用戶是協作者（如果 game_collaborations 表存在）
      (
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_collaborations')
        AND EXISTS (
          SELECT 1 FROM game_collaborations 
          WHERE game_collaborations.game_id = insurances.game_id 
          AND game_collaborations.collaborator_id = auth.uid()
          AND game_collaborations.status = 'accepted'
          AND game_collaborations.chip_consumed = TRUE
        )
      )
    )
  );

-- INSERT 策略（添加保險記錄）
CREATE POLICY "insurances_insert" ON public.insurances
  FOR INSERT 
  WITH CHECK (
    -- 確保用戶已登入
    auth.uid() IS NOT NULL 
    AND
    -- 檢查遊戲是否存在
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = insurances.game_id
    )
    AND
    (
      -- 用戶是遊戲擁有者
      EXISTS (
        SELECT 1 FROM games 
        WHERE games.id = insurances.game_id 
        AND games.user_id = auth.uid()
      )
      OR
      -- 或者用戶是協作者（如果 game_collaborations 表存在）
      (
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_collaborations')
        AND EXISTS (
          SELECT 1 FROM game_collaborations 
          WHERE game_collaborations.game_id = insurances.game_id 
          AND game_collaborations.collaborator_id = auth.uid()
          AND game_collaborations.status = 'accepted'
          AND game_collaborations.chip_consumed = TRUE
        )
      )
    )
  );

-- UPDATE 策略（更新保險記錄）
CREATE POLICY "insurances_update" ON public.insurances
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL 
    AND (
      -- 用戶是遊戲擁有者
      EXISTS (
        SELECT 1 FROM games 
        WHERE games.id = insurances.game_id 
        AND games.user_id = auth.uid()
      )
      OR
      -- 或者用戶是協作者（如果 game_collaborations 表存在）
      (
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_collaborations')
        AND EXISTS (
          SELECT 1 FROM game_collaborations 
          WHERE game_collaborations.game_id = insurances.game_id 
          AND game_collaborations.collaborator_id = auth.uid()
          AND game_collaborations.status = 'accepted'
          AND game_collaborations.chip_consumed = TRUE
        )
      )
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (
      -- 用戶是遊戲擁有者
      EXISTS (
        SELECT 1 FROM games 
        WHERE games.id = insurances.game_id 
        AND games.user_id = auth.uid()
      )
      OR
      -- 或者用戶是協作者（如果 game_collaborations 表存在）
      (
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_collaborations')
        AND EXISTS (
          SELECT 1 FROM game_collaborations 
          WHERE game_collaborations.game_id = insurances.game_id 
          AND game_collaborations.collaborator_id = auth.uid()
          AND game_collaborations.status = 'accepted'
          AND game_collaborations.chip_consumed = TRUE
        )
      )
    )
  );

-- DELETE 策略（刪除保險記錄）
CREATE POLICY "insurances_delete" ON public.insurances
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL 
    AND (
      -- 用戶是遊戲擁有者
      EXISTS (
        SELECT 1 FROM games 
        WHERE games.id = insurances.game_id 
        AND games.user_id = auth.uid()
      )
      OR
      -- 或者用戶是協作者（如果 game_collaborations 表存在）
      (
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_collaborations')
        AND EXISTS (
          SELECT 1 FROM game_collaborations 
          WHERE game_collaborations.game_id = insurances.game_id 
          AND game_collaborations.collaborator_id = auth.uid()
          AND game_collaborations.status = 'accepted'
          AND game_collaborations.chip_consumed = TRUE
        )
      )
    )
  );

-- ============================================
-- 步驟 4：驗證所有策略已正確創建
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN using_ IS NOT NULL THEN 'USING defined'
    ELSE 'No USING'
  END as has_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK defined'
    ELSE 'No WITH CHECK'
  END as has_with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'insurances'
ORDER BY tablename, cmd, policyname;

-- ============================================
-- 完成！
-- ============================================
-- 執行此腳本後，嘗試：
-- 1. 查詢保險記錄（SELECT）
-- 2. 添加保險記錄（INSERT）
-- 3. 更新保險記錄（UPDATE）
-- 4. 刪除保險記錄（DELETE）
-- 
-- 如果仍有問題，請檢查：
-- 1. 當前用戶是否有有效的 session（auth.uid() 是否返回正確的值）
-- 2. game_id 是否正確存在於 games 表中
-- 3. games 表中的 user_id 是否與當前用戶匹配，或者用戶是協作者

