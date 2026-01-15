-- ============================================
-- 修復 Supabase RLS 安全問題
-- 解決 56 個問題中的安全相關錯誤
-- 請在 Supabase Dashboard > SQL Editor 執行此腳本
-- ============================================

-- ============================================
-- 步驟 1：啟用已存在策略但未啟用 RLS 的表
-- ============================================

-- 修復 dealers 表（有策略但 RLS 未啟用）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dealers') THEN
    ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 修復 expenses 表（有策略但 RLS 未啟用）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
    ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 修復 insurances 表（有策略但 RLS 未啟用）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'insurances') THEN
    ALTER TABLE public.insurances ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 修復 rakes 表（有策略但 RLS 未啟用）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rakes') THEN
    ALTER TABLE public.rakes ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- 步驟 2：啟用 game_chips 表的 RLS
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_chips') THEN
    ALTER TABLE public.game_chips ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 確認 game_chips 表是否有必要的 RLS 策略
-- 如果沒有，創建基本策略（允許用戶查看和更新自己的記錄）
DO $$
BEGIN
  -- 檢查是否存在策略，如果不存在則創建
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_chips' 
    AND policyname = 'game_chips_select'
  ) THEN
    CREATE POLICY "game_chips_select" ON public.game_chips
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_chips' 
    AND policyname = 'game_chips_insert'
  ) THEN
    CREATE POLICY "game_chips_insert" ON public.game_chips
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_chips' 
    AND policyname = 'game_chips_update'
  ) THEN
    CREATE POLICY "game_chips_update" ON public.game_chips
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_chips' 
    AND policyname = 'game_chips_delete'
  ) THEN
    CREATE POLICY "game_chips_delete" ON public.game_chips
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 步驟 3：處理 users 表（如果存在）
-- ============================================
-- 注意：users 表可能是系統表或自定義表
-- 如果是自定義表，需要啟用 RLS 並創建策略

-- 檢查是否存在 public.users 表
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) THEN
    -- 啟用 RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- 創建基本策略（根據您的業務邏輯調整）
    -- 這裡假設 users 表有 user_id 或 id 欄位
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'users_select'
    ) THEN
      -- 嘗試使用 id 欄位
      BEGIN
        CREATE POLICY "users_select" ON public.users
          FOR SELECT USING (auth.uid()::text = id::text);
      EXCEPTION WHEN OTHERS THEN
        -- 如果失敗，可能是欄位名稱不同，需要手動調整
        RAISE NOTICE '無法自動創建 users 表策略，請手動檢查表結構';
      END;
    END IF;
  ELSE
    RAISE NOTICE 'public.users 表不存在，跳過此表的 RLS 設置';
  END IF;
END $$;

-- ============================================
-- 步驟 4：驗證所有表的 RLS 狀態
-- ============================================
-- 查詢所有 public schema 中的表及其 RLS 狀態
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE schemaname = 'public'
  AND tablename IN ('dealers', 'expenses', 'insurances', 'rakes', 'game_chips', 'users')
ORDER BY tablename;

-- ============================================
-- 完成！
-- ============================================
-- 執行此腳本後，請在 Supabase Dashboard 中刷新 Advisor
-- 確認所有安全相關的錯誤已解決

