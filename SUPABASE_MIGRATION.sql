-- ============================================
-- Supabase 完整數據表設計（清理重建版）
-- 請在 Supabase Dashboard > SQL Editor 執行此腳本
-- ============================================

-- ============================================
-- 步驟 1：清理所有現有表和觸發器
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS game_chips CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS insurances CASCADE;
DROP TABLE IF EXISTS rakes CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- 步驟 2：啟用 UUID 擴展
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 步驟 3：創建用戶資料表
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMPTZ,
  chips INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 4：創建觸發器函數
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, chips)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    1
  );
  RETURN NEW;
END;
$$;

-- 創建觸發器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 步驟 5：創建牌局表
-- ============================================
CREATE TABLE games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hosts JSONB DEFAULT '[]'::jsonb,
  small_blind INTEGER DEFAULT 0,
  big_blind INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  actual_collection INTEGER,
  final_notes TEXT,
  game_mode TEXT DEFAULT 'rake' CHECK (game_mode IN ('rake', 'noRake')),
  entry_fee_mode TEXT CHECK (entry_fee_mode IN ('fixed', 'custom', 'hourly')),
  fixed_entry_fee INTEGER,
  hourly_rate INTEGER,
  default_insurance_partners JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 6：創建玩家表
-- ============================================
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  buy_in INTEGER DEFAULT 0,
  buy_ins JSONB DEFAULT '[]'::jsonb,
  profit INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cashed_out')),
  buy_in_time TIMESTAMPTZ,
  cash_out_time TIMESTAMPTZ,
  cash_out_amount INTEGER,
  entry_fee_deducted BOOLEAN DEFAULT FALSE,
  custom_entry_fee INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 7：創建發牌員表
-- ============================================
CREATE TABLE dealers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tip_share INTEGER DEFAULT 50 CHECK (tip_share IN (50, 100)),
  hourly_rate INTEGER DEFAULT 0,
  work_hours NUMERIC DEFAULT 0,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'working' CHECK (status IN ('working', 'off_duty')),
  total_tips INTEGER DEFAULT 0,
  estimated_salary INTEGER DEFAULT 0,
  host TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 8：創建支出表
-- ============================================
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('takeout', 'miscellaneous', 'taxi', 'venue', 'other')),
  description TEXT,
  amount INTEGER NOT NULL,
  host TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 9：創建抽水記錄表
-- ============================================
CREATE TABLE rakes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  note TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 10：創建保險記錄表
-- ============================================
CREATE TABLE insurances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  partners JSONB DEFAULT '[]'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 11：創建 Chips 交易記錄表
-- ============================================
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id UUID,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'consume', 'free_gift', 'refund')),
  chips_amount INTEGER NOT NULL,
  price_id TEXT,
  session_id TEXT,
  amount_paid INTEGER,
  currency TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 步驟 12：創建遊戲 Chip 狀態表
-- ============================================
CREATE TABLE game_chips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  consumed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, game_id)
);

-- ============================================
-- 步驟 13：創建索引
-- ============================================
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_dealers_game_id ON dealers(game_id);
CREATE INDEX idx_expenses_game_id ON expenses(game_id);
CREATE INDEX idx_rakes_game_id ON rakes(game_id);
CREATE INDEX idx_insurances_game_id ON insurances(game_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_game_chips_user_id ON game_chips(user_id);
CREATE INDEX idx_game_chips_expires_at ON game_chips(expires_at);

-- ============================================
-- 步驟 14：啟用 Row Level Security
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_chips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 步驟 15：創建 RLS 政策 - Profiles
-- ============================================
CREATE POLICY "profiles_select" ON profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 步驟 16：創建 RLS 政策 - Games
-- ============================================
CREATE POLICY "games_select" ON games 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "games_insert" ON games 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "games_update" ON games 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "games_delete" ON games 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 步驟 17：創建 RLS 政策 - Players
-- ============================================
CREATE POLICY "players_select" ON players 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = players.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "players_insert" ON players 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE games.id = players.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "players_update" ON players 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = players.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "players_delete" ON players 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = players.game_id AND games.user_id = auth.uid())
  );

-- ============================================
-- 步驟 18：創建 RLS 政策 - Dealers
-- ============================================
CREATE POLICY "dealers_select" ON dealers 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = dealers.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "dealers_insert" ON dealers 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE games.id = dealers.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "dealers_update" ON dealers 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = dealers.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "dealers_delete" ON dealers 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = dealers.game_id AND games.user_id = auth.uid())
  );

-- ============================================
-- 步驟 19：創建 RLS 政策 - Expenses
-- ============================================
CREATE POLICY "expenses_select" ON expenses 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = expenses.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "expenses_insert" ON expenses 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE games.id = expenses.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "expenses_update" ON expenses 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = expenses.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "expenses_delete" ON expenses 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = expenses.game_id AND games.user_id = auth.uid())
  );

-- ============================================
-- 步驟 20：創建 RLS 政策 - Rakes
-- ============================================
CREATE POLICY "rakes_select" ON rakes 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = rakes.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "rakes_insert" ON rakes 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE games.id = rakes.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "rakes_update" ON rakes 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = rakes.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "rakes_delete" ON rakes 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = rakes.game_id AND games.user_id = auth.uid())
  );

-- ============================================
-- 步驟 21：創建 RLS 政策 - Insurances
-- ============================================
CREATE POLICY "insurances_select" ON insurances 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = insurances.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "insurances_insert" ON insurances 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE games.id = insurances.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "insurances_update" ON insurances 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = insurances.game_id AND games.user_id = auth.uid())
  );
CREATE POLICY "insurances_delete" ON insurances 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM games WHERE games.id = insurances.game_id AND games.user_id = auth.uid())
  );

-- ============================================
-- 步驟 22：創建 RLS 政策 - Transactions
-- ============================================
CREATE POLICY "transactions_select" ON transactions 
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 步驟 23：創建 RLS 政策 - Game Chips
-- ============================================
CREATE POLICY "game_chips_select" ON game_chips 
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 完成！所有表和政策已創建
-- ============================================
