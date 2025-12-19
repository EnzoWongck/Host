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
      if (userId) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            phone_number: phoneNumber,
            phone_verified: true,
            phone_verified_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('更新用戶電話失敗:', updateError);
        }
      }

      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        status: 'approved',
        message: '電話驗證成功',
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

