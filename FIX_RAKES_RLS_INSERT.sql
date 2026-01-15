-- ============================================
-- 修復 rakes 表 INSERT RLS 策略問題
-- 解決 403 Forbidden 錯誤
-- 請在 Supabase Dashboard > SQL Editor 執行此腳本
-- ============================================

-- ============================================
-- 步驟 1：檢查並啟用 RLS（如果未啟用）
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rakes') THEN
    -- 檢查 RLS 是否已啟用
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'rakes' 
      AND n.nspname = 'public'
      AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE public.rakes ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE '已啟用 rakes 表的 RLS';
    ELSE
      RAISE NOTICE 'rakes 表的 RLS 已經啟用';
    END IF;
  END IF;
END $$;

-- ============================================
-- 步驟 2：檢查現有策略
-- ============================================
-- 查看所有 rakes 表的策略
SELECT 
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'rakes'
ORDER BY policyname;

-- ============================================
-- 步驟 3：刪除並重新創建 INSERT 策略（確保正確）
-- ============================================
-- 刪除現有的 rakes_insert 策略（如果存在）
DROP POLICY IF EXISTS "rakes_insert" ON public.rakes;

-- 重新創建 INSERT 策略
CREATE POLICY "rakes_insert" ON public.rakes
  FOR INSERT 
  WITH CHECK (
    -- 檢查：遊戲必須存在且屬於當前用戶
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = rakes.game_id 
      AND games.user_id = auth.uid()
    )
    OR
    -- 或者：用戶是該遊戲的協作者
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = rakes.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- ============================================
-- 步驟 4：驗證策略已創建
-- ============================================
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK defined'
    ELSE 'No WITH CHECK'
  END as has_with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'rakes'
  AND policyname = 'rakes_insert';

-- ============================================
-- 完成！
-- ============================================
-- 執行此腳本後，嘗試重新添加抽水
-- 如果仍有問題，請檢查：
-- 1. 當前用戶是否有有效的 session
-- 2. game_id 是否正確
-- 3. games 表中的 user_id 是否與當前用戶匹配

