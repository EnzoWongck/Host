// Vercel Serverless Function - 驗證 OTP
// POST /api/phone/verify-otp

const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

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
    const { phoneNumber, code, userId } = JSON.parse(body);

    if (!phoneNumber || !code) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing phoneNumber or code' }));
      return;
    }

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
      if (userId) {
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

