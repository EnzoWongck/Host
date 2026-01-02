-- ============================================
-- Supabase 協作功能數據表設計
-- 請在 Supabase Dashboard > SQL Editor 執行此腳本
-- ============================================

-- ============================================
-- 步驟 1：創建協作邀請表
-- ============================================
CREATE TABLE IF NOT EXISTS game_collaborations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  collaborator_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  chip_payer TEXT DEFAULT 'owner' CHECK (chip_payer IN ('owner', 'collaborator')),
  chip_consumed BOOLEAN DEFAULT FALSE,
  invite_code TEXT UNIQUE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 2：創建索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_game_collaborations_game_id ON game_collaborations(game_id);
CREATE INDEX IF NOT EXISTS idx_game_collaborations_owner_id ON game_collaborations(owner_id);
CREATE INDEX IF NOT EXISTS idx_game_collaborations_collaborator_id ON game_collaborations(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_game_collaborations_collaborator_email ON game_collaborations(collaborator_email);
CREATE INDEX IF NOT EXISTS idx_game_collaborations_invite_code ON game_collaborations(invite_code);
CREATE INDEX IF NOT EXISTS idx_game_collaborations_status ON game_collaborations(status);

-- ============================================
-- 步驟 3：啟用 RLS
-- ============================================
ALTER TABLE game_collaborations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 步驟 4：創建 RLS 政策
-- ============================================

-- 遊戲擁有者可以查看和管理自己遊戲的所有協作邀請
CREATE POLICY "collaborations_owner_select" ON game_collaborations
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "collaborations_owner_insert" ON game_collaborations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "collaborations_owner_update" ON game_collaborations
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "collaborations_owner_delete" ON game_collaborations
  FOR DELETE USING (auth.uid() = owner_id);

-- 被邀請者可以查看和更新自己的邀請（根據 email 或 collaborator_id）
CREATE POLICY "collaborations_collaborator_select" ON game_collaborations
  FOR SELECT USING (
    auth.uid() = collaborator_id OR 
    collaborator_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "collaborations_collaborator_update" ON game_collaborations
  FOR UPDATE USING (
    auth.uid() = collaborator_id OR 
    collaborator_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- ============================================
-- 步驟 5：更新 games 表的 RLS 政策以支持協作者訪問
-- ============================================

-- 先刪除舊政策（如果存在）
DROP POLICY IF EXISTS "games_collaborator_select" ON games;
DROP POLICY IF EXISTS "games_collaborator_update" ON games;

-- 協作者可以查看已接受邀請的遊戲
CREATE POLICY "games_collaborator_select" ON games
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = games.id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- 協作者可以更新已接受邀請的遊戲
CREATE POLICY "games_collaborator_update" ON games
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = games.id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- ============================================
-- 步驟 6：更新相關子表的 RLS 政策
-- ============================================

-- Players 表
DROP POLICY IF EXISTS "players_collaborator_select" ON players;
DROP POLICY IF EXISTS "players_collaborator_insert" ON players;
DROP POLICY IF EXISTS "players_collaborator_update" ON players;
DROP POLICY IF EXISTS "players_collaborator_delete" ON players;

CREATE POLICY "players_collaborator_select" ON players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = players.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "players_collaborator_insert" ON players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = players.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "players_collaborator_update" ON players
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = players.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "players_collaborator_delete" ON players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = players.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- Dealers 表
DROP POLICY IF EXISTS "dealers_collaborator_select" ON dealers;
DROP POLICY IF EXISTS "dealers_collaborator_insert" ON dealers;
DROP POLICY IF EXISTS "dealers_collaborator_update" ON dealers;
DROP POLICY IF EXISTS "dealers_collaborator_delete" ON dealers;

CREATE POLICY "dealers_collaborator_select" ON dealers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = dealers.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "dealers_collaborator_insert" ON dealers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = dealers.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "dealers_collaborator_update" ON dealers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = dealers.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "dealers_collaborator_delete" ON dealers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = dealers.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- Expenses 表
DROP POLICY IF EXISTS "expenses_collaborator_select" ON expenses;
DROP POLICY IF EXISTS "expenses_collaborator_insert" ON expenses;
DROP POLICY IF EXISTS "expenses_collaborator_update" ON expenses;
DROP POLICY IF EXISTS "expenses_collaborator_delete" ON expenses;

CREATE POLICY "expenses_collaborator_select" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = expenses.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "expenses_collaborator_insert" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = expenses.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "expenses_collaborator_update" ON expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = expenses.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "expenses_collaborator_delete" ON expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = expenses.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- Rakes 表
DROP POLICY IF EXISTS "rakes_collaborator_select" ON rakes;
DROP POLICY IF EXISTS "rakes_collaborator_insert" ON rakes;
DROP POLICY IF EXISTS "rakes_collaborator_update" ON rakes;
DROP POLICY IF EXISTS "rakes_collaborator_delete" ON rakes;

CREATE POLICY "rakes_collaborator_select" ON rakes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = rakes.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "rakes_collaborator_insert" ON rakes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = rakes.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "rakes_collaborator_update" ON rakes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = rakes.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "rakes_collaborator_delete" ON rakes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = rakes.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- Insurances 表
DROP POLICY IF EXISTS "insurances_collaborator_select" ON insurances;
DROP POLICY IF EXISTS "insurances_collaborator_insert" ON insurances;
DROP POLICY IF EXISTS "insurances_collaborator_update" ON insurances;
DROP POLICY IF EXISTS "insurances_collaborator_delete" ON insurances;

CREATE POLICY "insurances_collaborator_select" ON insurances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = insurances.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "insurances_collaborator_insert" ON insurances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = insurances.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "insurances_collaborator_update" ON insurances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = insurances.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

CREATE POLICY "insurances_collaborator_delete" ON insurances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM game_collaborations 
      WHERE game_collaborations.game_id = insurances.game_id 
      AND game_collaborations.collaborator_id = auth.uid()
      AND game_collaborations.status = 'accepted'
      AND game_collaborations.chip_consumed = TRUE
    )
  );

-- ============================================
-- 步驟 7：啟用 Realtime 發布
-- ============================================

-- 啟用 games 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- 啟用 players 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- 啟用 dealers 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE dealers;

-- 啟用 expenses 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- 啟用 rakes 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rakes;

-- 啟用 insurances 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE insurances;

-- 啟用 game_collaborations 表的 Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_collaborations;

-- ============================================
-- 完成！協作功能數據表已創建
-- ============================================

