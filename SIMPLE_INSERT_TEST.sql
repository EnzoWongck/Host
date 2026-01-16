-- ============================================
-- 簡單的插入權限測試
-- 這個腳本會檢查插入條件是否滿足
-- ============================================

-- ============================================
-- 檢查 1：當前用戶 session
-- ============================================
SELECT 
  '檢查 1: 當前用戶 ID' as check_name,
  COALESCE(auth.uid()::text, '❌ NULL - 沒有有效的 session') as result;

-- ============================================
-- 檢查 2：當前用戶擁有的遊戲
-- ============================================
SELECT 
  '檢查 2: 擁有的遊戲' as check_name,
  g.id as game_id,
  g.name as game_name,
  g.user_id as owner_id,
  CASE 
    WHEN g.user_id = auth.uid() THEN '✅ 是擁有者'
    ELSE '❌ 不是擁有者'
  END as ownership
FROM games g
WHERE g.user_id = auth.uid()
LIMIT 5;

-- ============================================
-- 檢查 3：rakes 表的 INSERT 策略條件測試
-- 使用實際的 game_id 測試策略條件
-- ============================================
SELECT 
  '檢查 3: Rakes INSERT 策略測試' as check_name,
  g.id as test_game_id,
  g.name as game_name,
  -- 測試擁有者策略條件
  EXISTS (
    SELECT 1 FROM games 
    WHERE games.id = g.id 
    AND games.user_id = auth.uid()
  ) as owner_policy_check,
  -- 測試協作者策略條件
  EXISTS (
    SELECT 1 FROM game_collaborations 
    WHERE game_collaborations.game_id = g.id 
    AND game_collaborations.collaborator_id = auth.uid()
    AND game_collaborations.status = 'accepted'
    AND game_collaborations.chip_consumed = TRUE
  ) as collaborator_policy_check,
  -- 綜合檢查（任一策略滿足即可）
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = g.id 
      AND games.user_id = auth.uid()
    ) THEN '✅ 可以插入（擁有者）'
    WHEN EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = g.id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    ) THEN '✅ 可以插入（協作者）'
    ELSE '❌ 無法插入 - 策略條件不滿足'
  END as insert_permission_status
FROM games g
WHERE g.user_id = auth.uid()
LIMIT 5;

-- ============================================
-- 檢查 4：嘗試一個測試插入（但不會真的插入）
-- ============================================
-- 這會檢查策略是否允許插入，但使用一個不存在的臨時數據
-- 注意：這只會檢查策略條件，不會實際插入數據
SELECT 
  '檢查 4: 策略條件語法檢查' as check_name,
  CASE 
    WHEN auth.uid() IS NULL THEN '❌ auth.uid() 返回 NULL'
    WHEN NOT EXISTS (
      SELECT 1 FROM games WHERE games.user_id = auth.uid() LIMIT 1
    ) THEN '❌ 沒有找到屬於當前用戶的遊戲'
    ELSE '✅ 基本條件滿足，可以嘗試實際插入測試'
  END as status;

-- ============================================
-- 如果上面的檢查都通過但仍然無法插入，請執行以下測試：
-- （替換 'YOUR_GAME_ID' 為實際的 game_id）
-- ============================================
/*
-- 實際插入測試（請謹慎使用，會真正插入數據）
-- 替換 YOUR_GAME_ID 為實際的 game_id，然後取消註釋執行

INSERT INTO rakes (game_id, amount, note, timestamp)
VALUES (
  'YOUR_GAME_ID'::uuid,
  100,
  '測試插入',
  NOW()
)
RETURNING id, game_id, amount;
*/

