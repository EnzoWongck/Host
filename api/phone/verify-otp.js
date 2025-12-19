// Vercel Serverless Function - 驗證 OTP
// POST /api/phone/verify-otp

const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// 檢查環境變量
if (!accountSid || !authToken || !verifyServiceSid) {
  console.error('Twilio 環境變量未設置:', {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasVerifyServiceSid: !!verifyServiceSid,
  });
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// 初始化 Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 環境變量未設置:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
  });
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  try {
    // 檢查 Twilio 配置
    if (!client || !verifyServiceSid) {
      res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Twilio configuration missing',
        message: 'Twilio 服務未正確配置，請檢查環境變量設置',
      }));
      return;
    }

    // Parse request body
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    
    if (!body) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing request body' }));
      return;
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
      return;
    }

    const { phoneNumber, code, userId } = parsedBody;

    if (!phoneNumber || !code) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing phoneNumber or code' }));
      return;
    }

    console.log('開始驗證 OTP:', { phoneNumber, codeLength: code.length, userId });

    // 驗證 OTP
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      });

    console.log(`OTP 驗證結果: ${verificationCheck.status}`);

    if (verificationCheck.status === 'approved') {
      // 如果提供了 userId，更新用戶的電話號碼
      let profileUpdated = false;
      if (userId && supabase) {
        try {
          const { data: profileData, error: updateError } = await supabase
            .from('profiles')
            .update({ 
              phone_number: phoneNumber,
              phone_verified: true,
              phone_verified_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .select()
            .single();

          if (updateError) {
            console.error('更新用戶電話失敗:', updateError);
          } else {
            profileUpdated = true;
            console.log('用戶電話已更新:', profileData);
          }

          // 同時更新 auth.users 表的 user_metadata（如果可能）
          try {
            const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
              userId,
              {
                phone: phoneNumber,
                user_metadata: {
                  phone_verified: true,
                },
              }
            );
            if (authError) {
              console.error('更新 auth.users 失敗:', authError);
            } else {
              console.log('auth.users 已更新:', authData);
            }
          } catch (adminError) {
            // 如果沒有 admin 權限，忽略這個錯誤
            console.warn('無法更新 auth.users（可能需要 admin 權限）:', adminError);
          }
        } catch (dbError) {
          console.error('數據庫更新錯誤:', dbError);
          // 即使數據庫更新失敗，也返回成功（因為 OTP 驗證已成功）
        }
      } else if (userId && !supabase) {
        console.warn('Supabase 未配置，無法更新用戶資料');
      }

      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        status: 'approved',
        message: '電話驗證成功',
        profileUpdated: profileUpdated,
      }));
    } else {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        status: verificationCheck.status,
        message: '驗證碼錯誤或已過期',
      }));
    }

  } catch (error) {
    console.error('驗證 OTP 失敗:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Failed to verify OTP',
      message: error.message,
    }));
  }
};

