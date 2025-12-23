// Vercel Serverless Function - 檢查遊戲的 Chip 狀態
// GET /api/chips/game-status?userId=xxx&gameId=xxx

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
    // 從 URL 獲取參數
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const gameId = url.searchParams.get('gameId');

    if (!userId || !gameId) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing userId or gameId parameter' }));
      return;
    }

    // 獲取遊戲的 Chip 狀態
    // 與其他地方保持一致：按 user_id + game_id 查詢最新一筆紀錄
    // 注意：game_chips 表使用 consumed_at 而不是 created_at
    const { data: gameChip, error: fetchError } = await supabase
      .from('game_chips')
      .select('*')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .order('consumed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('獲取遊戲 Chip 狀態失敗:', fetchError);
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to get game chip status' }));
      return;
    }

    if (!gameChip) {
      // 沒有 Chip 記錄，需要消耗新的 Chip
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        hasValidChip: false,
        needsChip: true,
        reason: 'no_chip_record',
      }));
      return;
    }

    const now = Date.now();
    const expiresAt = new Date(gameChip.expires_at);
    const expiresAtMs = expiresAt.getTime();

    if (now >= expiresAtMs) {
      // Chip 已過期
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        hasValidChip: false,
        needsChip: true,
        reason: 'chip_expired',
        expiredAt: expiresAt.toISOString(),
      }));
      return;
    }

    // Chip 仍然有效
    const remainingMs = expiresAtMs - now;
    const remainingMinutes = Math.floor(remainingMs / (60 * 1000));
    const remainingHours = Math.floor(remainingMinutes / 60);

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      hasValidChip: true,
      needsChip: false,
      expiresAt: expiresAt.toISOString(),
      remainingMinutes: remainingMinutes,
      remainingHours: remainingHours,
      // 如果剩餘時間少於 30 分鐘，發出警告
      shouldWarn: remainingMinutes <= 30,
    }));

  } catch (error) {
    console.error('檢查遊戲 Chip 狀態錯誤:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Failed to check game chip status',
      message: error.message,
    }));
  }
};
