// Vercel Serverless Function - 發送 OTP 驗證碼
// POST /api/phone/send-otp

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

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
    const { phoneNumber } = JSON.parse(body);

    if (!phoneNumber) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing phoneNumber' }));
      return;
    }

    // 發送 OTP
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });

    console.log(`OTP 已發送到 ${phoneNumber}, Status: ${verification.status}`);

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      status: verification.status,
      message: '驗證碼已發送',
    }));

  } catch (error) {
    console.error('發送 OTP 失敗:', error);
    
    // 處理 Twilio 特定錯誤
    let errorMessage = '發送驗證碼失敗，請稍後再試';
    let errorCode = error.code || error.status;
    
    // Twilio 錯誤代碼處理
    if (error.code === 60200 || error.message?.includes('Invalid parameter')) {
      errorMessage = '電話號碼格式不正確，請檢查後重試';
    } else if (error.code === 60203 || error.message?.includes('Max check attempts')) {
      errorMessage = '驗證次數過多，請稍後再試';
    } else if (error.code === 20429 || error.message?.includes('Too Many Requests')) {
      errorMessage = '請求過於頻繁，請稍後再試';
    } else if (error.message?.includes('not verified') || error.message?.includes('unverified')) {
      errorMessage = '此電話號碼未在 Twilio 驗證。Free Trial 模式只能發送到已驗證的號碼。請在 Twilio Console 驗證此號碼，或升級到 Pay as you go 帳戶。';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Failed to send OTP',
      message: errorMessage,
      code: errorCode,
    }));
  }
};

