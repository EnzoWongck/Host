-- =============================================
-- 啟用 Supabase Realtime 即時同步
-- =============================================
-- 在 Supabase SQL Editor 中執行此腳本

-- 確保所有相關表都添加到 realtime publication
-- 這樣當資料變更時，訂閱者會即時收到通知

-- 1. 啟用 games 表的 realtime
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- 2. 啟用 players 表的 realtime
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- 3. 啟用 dealers 表的 realtime
ALTER PUBLICATION supabase_realtime ADD TABLE dealers;

-- 4. 啟用 expenses 表的 realtime
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- 5. 啟用 rakes 表的 realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rakes;

-- 6. 啟用 insurances 表的 realtime
ALTER PUBLICATION supabase_realtime ADD TABLE insurances;

-- 7. 啟用 game_collaborations 表的 realtime
ALTER PUBLICATION supabase_realtime ADD TABLE game_collaborations;

-- 8. 啟用 profiles 表的 realtime（用於顯示協作者名稱）
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- 注意：如果表已經在 publication 中，會顯示錯誤，這是正常的
-- 你可以忽略 "relation already member of publication" 錯誤

-- 驗證：查看目前哪些表已啟用 realtime
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

