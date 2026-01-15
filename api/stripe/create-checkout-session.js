// Vercel Serverless Function - 創建 Stripe Checkout Session
// POST /api/stripe/create-checkout-session

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    const { priceId, userId, userEmail, successUrl, cancelUrl } = JSON.parse(body);

    if (!priceId || !userId) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required fields: priceId, userId' }));
      return;
    }

    // 創建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.origin || 'https://lunchips.com'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'https://lunchips.com'}/?payment=cancelled`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        priceId: priceId,
      },
      // 設置貨幣為 HKD
      currency: 'hkd',
    });

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      sessionId: session.id,
      url: session.url,
    }));

  } catch (error) {
    console.error('創建 Checkout Session 錯誤:', error);
    res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Failed to create checkout session',
      message: error.message,
    }));
  }
};




