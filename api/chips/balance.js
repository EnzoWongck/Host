// Vercel Serverless Function - 獲取用戶 Chips 餘額
// GET /api/chips/balance?userId=xxx

const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 新用戶贈送的免費 Chips 數量
const FREE_CHIPS_FOR_NEW_USER = 1;

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    // 從 URL 獲取 userId
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing userId parameter' }));
      return;
    }

    // 獲取用戶數據
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('chips')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = 找不到記錄
      console.error('獲取用戶數據失敗:', fetchError);
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to get user data' }));
      return;
    }

    if (user) {
      // 用戶存在
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        chips: user.chips || 0,
        isNewUser: false,
      }));
    } else {
      // 新用戶：創建記錄並贈送免費 Chips
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          chips: FREE_CHIPS_FOR_NEW_USER,
          created_at: new Date().toISOString(),
          is_new_user: true
        });

      if (insertError) {
        console.error('創建用戶記錄失敗:', insertError);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to create user' }));
        return;
      }

      // 記錄免費贈送交易
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'free_gift',
          chips_amount: FREE_CHIPS_FOR_NEW_USER,
          reason: 'new_user_welcome',
          created_at: new Date().toISOString()
        });

      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        chips: FREE_CHIPS_FOR_NEW_USER,
        isNewUser: true,
        message: `歡迎！您獲得了 ${FREE_CHIPS_FOR_NEW_USER} 個免費 Chip！`,
      }));
    }

  } catch (error) {
    console.error('獲取 Chips 餘額錯誤:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Failed to get chips balance',
      message: error.message,
    }));
  }
};
