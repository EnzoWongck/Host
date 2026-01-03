// Vercel Serverless Function - Stripe Webhook Handler
// POST /api/stripe/webhook

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 價格 ID 對應的 Chips 數量
const PRICE_TO_CHIPS = {
  'price_1SfAAfC059bhXtelaE5o55PK': 1,   // 1 Chip - $30 HKD
  'price_1SfOUnC059bhXtelb93CqfiC': 11,  // 11 Chips - $299 HKD
  'price_1SfOUnC059bhXtelEWD2CFtq': 36,  // 36 Chips - $899 HKD
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
};

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

  // 獲取 raw body 用於簽名驗證
  let rawBody = '';
  for await (const chunk of req) {
    rawBody += chunk;
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // 驗證 Webhook 簽名
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook 簽名驗證失敗:', err.message);
    res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Webhook Error: ${err.message}` }));
    return;
  }

  // 處理事件
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        console.log('收到付款完成事件:', session.id);
        
        const userId = session.metadata?.userId;
        const priceId = session.metadata?.priceId;
        
        if (!userId || !priceId) {
          console.error('缺少必要的 metadata:', { userId, priceId });
          break;
        }

        // 獲取購買的 Chips 數量
        const chipsToAdd = PRICE_TO_CHIPS[priceId] || 0;
        
        if (chipsToAdd === 0) {
          console.error('未知的 priceId:', priceId);
          break;
        }

        // 檢查用戶是否存在（使用 profiles 表）
        const { data: existingUser, error: fetchError } = await supabase
          .from('profiles')
          .select('chips')
          .eq('id', userId)
          .single();

        console.log('查詢用戶資料:', { userId, existingUser, fetchError });

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = 找不到記錄，其他錯誤需要處理
          console.error('獲取用戶數據失敗:', fetchError);
          break;
        }

        if (existingUser) {
          // 更新現有用戶的 Chips
          const newChips = (existingUser.chips || 0) + chipsToAdd;
          console.log('更新 Chips:', { 原始: existingUser.chips, 增加: chipsToAdd, 新餘額: newChips });
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              chips: newChips,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (updateError) {
            console.error('更新用戶 Chips 失敗:', updateError);
            break;
          }
          
          console.log(`成功更新用戶 ${userId} 的 Chips 餘額為 ${newChips}`);
        } else {
          // 創建新用戶記錄（profiles 表）
          console.log('用戶不存在，創建新記錄');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              chips: chipsToAdd,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('創建用戶記錄失敗:', insertError);
            break;
          }
          
          console.log(`成功為新用戶 ${userId} 創建記錄，Chips: ${chipsToAdd}`);
        }

        // 記錄交易
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'purchase',
            chips_amount: chipsToAdd,
            price_id: priceId,
            session_id: session.id,
            amount_paid: session.amount_total,
            currency: session.currency,
            created_at: new Date().toISOString()
          });

        if (transactionError) {
          console.error('記錄交易失敗:', transactionError);
        }

        console.log(`成功為用戶 ${userId} 增加 ${chipsToAdd} Chips`);
        break;
      }

      default:
        console.log(`未處理的事件類型: ${event.type}`);
    }

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ received: true }));

  } catch (error) {
    console.error('處理 Webhook 事件錯誤:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Webhook handler failed' }));
  }
};

// 配置：禁用 body parser（需要 raw body 進行簽名驗證）
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
