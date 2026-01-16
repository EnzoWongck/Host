-- ============================================
-- 臨時測試腳本 - 診斷 RLS 問題
-- 請在執行修復腳本後運行此腳本
-- ============================================

-- ============================================
-- 測試 1：檢查是否可以查詢 games 表
-- ============================================
SELECT 
  '測試 1: 查詢 games 表' as test_name,
  COUNT(*) as game_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 可以查詢'
    ELSE '❌ 無法查詢'
  END as result
FROM games
WHERE games.user_id = auth.uid();

-- ============================================
-- 測試 2：檢查是否可以查詢 rakes 表
-- ============================================
SELECT 
  '測試 2: 查詢 rakes 表' as test_name,
  COUNT(*) as rake_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ 可以查詢'
    ELSE '❌ 無法查詢'
  END as result
FROM rakes
WHERE EXISTS (
  SELECT 1 FROM games 
  WHERE games.id = rakes.game_id 
  AND games.user_id = auth.uid()
);

-- ============================================
-- 測試 3：檢查 INSERT 權限（模擬）
-- ============================================
-- 這個查詢會檢查策略條件是否滿足，但不會實際插入
SELECT 
  '測試 3: 檢查 INSERT 權限' as test_name,
  g.id as test_game_id,
  g.name as game_name,
  CASE 
    WHEN g.user_id = auth.uid() THEN '✅ 是遊戲擁有者，應該可以插入'
    ELSE '❌ 不是遊戲擁有者'
  END as ownership_status
FROM games g
WHERE g.user_id = auth.uid()
LIMIT 1;

-- ============================================
-- 測試 4：檢查策略條件（詳細）
-- ============================================
SELECT 
  '測試 4: 策略條件檢查' as test_name,
  g.id as game_id,
  g.user_id as game_owner_id,
  auth.uid() as current_user_id,
  CASE 
    WHEN g.user_id = auth.uid() THEN '✅ 匹配'
    ELSE '❌ 不匹配'
  END as user_match,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = g.id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    ) THEN '✅ 是協作者'
    ELSE '❌ 不是協作者'
  END as collaborator_status
FROM games g
WHERE g.user_id = auth.uid()
LIMIT 1;

-- ============================================
-- 測試 5：檢查是否有衝突的策略
-- ============================================
SELECT 
  '測試 5: 策略衝突檢查' as test_name,
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('dealers', 'expenses', 'rakes')
  AND cmd = 'INSERT'
GROUP BY tablename;

-- ============================================
-- 如果所有測試都通過但仍然無法插入，請提供：
-- 1. 測試 1-4 的結果
-- 2. 嘗試插入時的具體錯誤訊息
-- 3. 您嘗試插入的 game_id
-- ============================================

