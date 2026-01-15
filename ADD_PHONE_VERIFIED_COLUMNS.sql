-- ============================================
-- 添加電話驗證相關字段到 profiles 表
-- 請在 Supabase Dashboard > SQL Editor 執行此腳本
-- ============================================

-- 添加 phone_verified 字段（布林值，默認為 false）
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- 添加 phone_verified_at 字段（時間戳，記錄驗證時間）
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- 將 phone 字段重命名為 phone_number（與代碼保持一致）
ALTER TABLE profiles 
RENAME COLUMN phone TO phone_number;

-- 添加索引以提高查詢性能
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON profiles(phone_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- 查看更新後的表結構
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;




