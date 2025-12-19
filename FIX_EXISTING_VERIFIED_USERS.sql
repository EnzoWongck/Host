-- ============================================
-- 修復現有用戶的電話驗證狀態
-- 如果用戶有 phone_verified_at，視為已驗證並設置 phone_verified = true
-- 請在 Supabase Dashboard > SQL Editor 執行此腳本
-- ============================================

-- 步驟 1：確保字段存在（如果還沒有執行 ADD_PHONE_VERIFIED_COLUMNS.sql）
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- 步驟 2：如果有 phone_verified_at，設置 phone_verified 為 true
UPDATE profiles
SET phone_verified = true
WHERE phone_verified_at IS NOT NULL
  AND (phone_verified IS NULL OR phone_verified = false);

-- 步驟 3：查看更新結果
SELECT 
  id,
  email,
  phone_number,
  phone_verified,
  phone_verified_at,
  created_at
FROM profiles
WHERE phone_number IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

-- 步驟 4：統計信息
SELECT 
  COUNT(*) as total_users,
  COUNT(phone_number) as users_with_phone,
  COUNT(CASE WHEN phone_verified = true THEN 1 END) as verified_users,
  COUNT(CASE WHEN phone_verified = false OR phone_verified IS NULL THEN 1 END) as unverified_users,
  COUNT(CASE WHEN phone_verified_at IS NOT NULL THEN 1 END) as users_with_verified_at
FROM profiles;

