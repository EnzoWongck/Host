-- 為 players 表添加 cash_out_host 字段
-- 用於記錄負責兌現的 Host 名稱

ALTER TABLE players 
ADD COLUMN IF NOT EXISTS cash_out_host TEXT;

-- 添加註釋
COMMENT ON COLUMN players.cash_out_host IS '負責兌現的 Host 名稱';

