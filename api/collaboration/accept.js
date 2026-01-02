const { createClient } = require('@supabase/supabase-js');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

module.exports = async (req, res) => {
  // 處理 CORS preflight
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
    // 解析請求體
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    const { inviteId, userId } = JSON.parse(body);

    if (!inviteId || !userId) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing inviteId or userId' }));
      return;
    }

    // 初始化 Supabase（使用 service role key 以繞過 RLS）
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server configuration error' }));
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 獲取邀請信息
    const { data: invite, error: fetchError } = await supabase
      .from('game_collaborations')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (fetchError || !invite) {
      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invitation not found' }));
      return;
    }

    // 檢查邀請是否已過期
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('game_collaborations')
        .update({ status: 'expired' })
        .eq('id', inviteId);

      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invitation has expired' }));
      return;
    }

    // 檢查邀請狀態
    if (invite.status !== 'pending') {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Invitation already ${invite.status}` }));
      return;
    }

    // 獲取接受者的用戶資料
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('email, chips')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }

    // 驗證邀請是給這個用戶的
    if (invite.collaborator_email.toLowerCase() !== userProfile.email.toLowerCase()) {
      res.writeHead(403, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'This invitation is not for you' }));
      return;
    }

    // 如果由協作者付費，檢查餘額並扣費
    if (invite.chip_payer === 'collaborator' && !invite.chip_consumed) {
      if (userProfile.chips < 1) {
        res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Insufficient chips',
          needsChip: true,
          message: '你需要 1 Chip 才能接受邀請'
        }));
        return;
      }

      // 扣除協作者的 chip
      const { error: chipError } = await supabase
        .from('profiles')
        .update({ chips: userProfile.chips - 1 })
        .eq('id', userId);

      if (chipError) {
        console.error('扣除 Chip 失敗:', chipError);
        res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to deduct chip' }));
        return;
      }
    }

    // 更新邀請狀態
    const { error: updateError } = await supabase
      .from('game_collaborations')
      .update({
        status: 'accepted',
        collaborator_id: userId,
        chip_consumed: true,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', inviteId);

    if (updateError) {
      console.error('更新邀請狀態失敗:', updateError);
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to accept invitation' }));
      return;
    }

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Invitation accepted',
      gameId: invite.game_id,
    }));

  } catch (error) {
    console.error('接受邀請錯誤:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
    }));
  }
};

