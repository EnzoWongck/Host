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
-- 重要說明
-- ============================================
-- ⚠️ 在 SQL Editor 中 auth.uid() 返回 NULL 是正常的！
-- SQL Editor 使用 postgres 角色執行，不是認證用戶
-- 
-- 真正的測試應該在前端應用中進行：
-- 1. 打開瀏覽器開發者工具
-- 2. 在 Console 中檢查 localStorage
-- 3. 嘗試插入數據並查看 Network 請求
-- 
-- 如果前端仍然有 403 錯誤，可能是：
-- 1. Session 過期 - 需要重新登入
-- 2. Token 未正確傳遞 - 檢查 Network headers
-- 3. game_id 不匹配 - 確認插入的 game_id 屬於當前用戶

