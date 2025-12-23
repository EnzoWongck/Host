// Vercel Serverless Function - 消耗 Chips
// POST /api/chips/consume

const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Chip 有效時長（毫秒）- 12 小時
const CHIP_VALIDITY_DURATION = 12 * 60 * 60 * 1000;

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    // Parse request body
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    const { userId, gameId, reason } = JSON.parse(body);

    if (!userId || !gameId) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required fields: userId, gameId' }));
      return;
    }

    // 獲取用戶當前 Chips（從 profiles 表）
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('chips')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('獲取用戶數據失敗:', fetchError);
      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found', success: false }));
      return;
    }

    const currentChips = profile.chips || 0;

    if (currentChips < 1) {
      res.writeHead(402, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Insufficient chips', success: false }));
      return;
    }

    // 扣除 1 個 Chip（更新 profiles 表）
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        chips: currentChips - 1,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('更新用戶 Chips 失敗:', updateError);
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to consume chip', success: false }));
      return;
    }

    // 計算到期時間
    const now = Date.now();
    const expiresAt = new Date(now + CHIP_VALIDITY_DURATION);

    // 更新或創建遊戲的 Chip 狀態
    // 先檢查是否已存在記錄
    const { data: existingRecord } = await supabase
      .from('game_chips')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .maybeSingle();
    
    let upsertError = null;
    if (existingRecord) {
      // 更新現有記錄
      const { error } = await supabase
        .from('game_chips')
        .update({
          expires_at: expiresAt.toISOString(),
          reason: reason || 'game_session',
        })
        .eq('user_id', userId)
        .eq('game_id', gameId);
      upsertError = error;
    } else {
      // 創建新記錄
      const { error } = await supabase
        .from('game_chips')
        .insert({
          user_id: userId,
          game_id: gameId,
          expires_at: expiresAt.toISOString(),
          reason: reason || 'game_session',
        });
      upsertError = error;
    }

    if (upsertError) {
      console.error('更新遊戲 Chip 狀態失敗:', upsertError);
      // 如果創建 game_chips 失敗，回滾 chips 扣除
      await supabase
        .from('profiles')
        .update({ chips: currentChips })
        .eq('id', userId);
      
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Failed to create game chip record', 
        success: false,
        details: upsertError.message || null,
        code: upsertError.code || null,
        hint: upsertError.hint || null,
      }));
      return;
    }

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      remainingChips: currentChips - 1,
      expiresAt: expiresAt.toISOString(),
      validityHours: CHIP_VALIDITY_DURATION / (60 * 60 * 1000),
    }));

  } catch (error) {
    console.error('消耗 Chips 錯誤:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: error.message,
      success: false,
    }));
  }
};
