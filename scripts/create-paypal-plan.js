/**
 * PayPal 訂閱計劃創建腳本
 * 
 * 使用方法：
 * 1. 在 src/config/dev.ts 中設置您的 Client ID 和 Secret
 * 2. 運行：node scripts/create-paypal-plan.js
 * 
 * 注意：此腳本需要 PayPal Client ID 和 Secret
 */

const https = require('https');

// 從環境變數或直接設置（請替換為您的實際值）
// Sandbox Client ID (test)
const SANDBOX_CLIENT_ID = 'AQ1VvdEb7EI-w95pq5RNiYtXaL05cecchwK1y8dPRVo08nZcbOivk1LVbDvsxFRrjkcANZOsvtofxaPl';
// Live Client ID (LunChipstesting)
const LIVE_CLIENT_ID = 'ATrC_3LjDQgkH7GzsSdUe1mGpw3juXMC-BCxZJpFvQ0FQ61ocl-1V-gBoztcAtn2tC5b9pPheRPoZafT';

const SECRET = process.env.PAYPAL_SECRET || 'EGOZvIy1IdlWKP9s0E52QM7CUwS5XPClQGoTm-9uvAlxnchOQDOY4Vs3JL8l_s7mJc7soDyzV0qElpqf';
// 使用 Sandbox 環境
const USE_SANDBOX = true;

// 根據環境選擇對應的 Client ID
const CLIENT_ID = USE_SANDBOX ? SANDBOX_CLIENT_ID : LIVE_CLIENT_ID;

const BASE_URL = USE_SANDBOX 
  ? 'https://api.sandbox.paypal.com'
  : 'https://api.paypal.com';

console.log(`🌍 使用環境: ${USE_SANDBOX ? 'Sandbox' : 'Live'}`);
console.log(`🔗 API URL: ${BASE_URL}\n`);

// 步驟 1: 獲取 Access Token
function getAccessToken() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
    
    const options = {
      hostname: USE_SANDBOX ? 'api.sandbox.paypal.com' : 'api.paypal.com',
      path: '/v1/oauth2/token',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const tokenData = JSON.parse(data);
          console.log('✅ Access Token 獲取成功\n');
          resolve(tokenData.access_token);
        } else {
          console.error('❌ 獲取 Access Token 失敗:');
          console.error(`狀態碼: ${res.statusCode}`);
          console.error(`響應: ${data}`);
          reject(new Error(`Failed to get access token: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 請求錯誤:', error);
      reject(error);
    });

    req.write('grant_type=client_credentials');
    req.end();
  });
}

// 步驟 2: 創建產品
function createProduct(accessToken) {
  return new Promise((resolve, reject) => {
    const productData = JSON.stringify({
      name: 'Lunchips Premium Subscription',
      description: 'Premium subscription for Lunchips service',
      type: 'SERVICE',
      category: 'SOFTWARE'
    });

    const options = {
      hostname: USE_SANDBOX ? 'api.sandbox.paypal.com' : 'api.paypal.com',
      path: '/v1/catalogs/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          const product = JSON.parse(data);
          console.log('✅ 產品創建成功');
          console.log(`   Product ID: ${product.id}\n`);
          resolve(product.id);
        } else {
          console.error('❌ 創建產品失敗:');
          console.error(`狀態碼: ${res.statusCode}`);
          console.error(`響應: ${data}`);
          reject(new Error(`Failed to create product: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 請求錯誤:', error);
      reject(error);
    });

    req.write(productData);
    req.end();
  });
}

// 步驟 3: 創建訂閱計劃
function createPlan(accessToken, productId) {
  return new Promise((resolve, reject) => {
    const planData = JSON.stringify({
      product_id: productId,
      name: 'Monthly Premium Plan',
      description: 'Monthly subscription plan for Lunchips Premium',
      billing_cycles: [{
        frequency: {
          interval_unit: 'MONTH',
          interval_count: 1
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 0 = 無限循環
        pricing_scheme: {
          fixed_price: {
            value: '9.99',
            currency_code: 'USD'
          }
        }
      }],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: 'USD'
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3
      }
    });

    const options = {
      hostname: USE_SANDBOX ? 'api.sandbox.paypal.com' : 'api.paypal.com',
      path: '/v1/billing/plans',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          const plan = JSON.parse(data);
          console.log('✅ 訂閱計劃創建成功！');
          console.log(`\n📋 Plan ID: ${plan.id}`);
          console.log(`📋 Plan Name: ${plan.name}`);
          console.log(`📋 Status: ${plan.status}\n`);
          console.log('💡 請將此 Plan ID 複製到 src/config/dev.ts 中：');
          console.log(`   export const PAYPAL_SANDBOX_PLAN_ID = '${plan.id}';`);
          resolve(plan.id);
        } else {
          console.error('❌ 創建訂閱計劃失敗:');
          console.error(`狀態碼: ${res.statusCode}`);
          console.error(`響應: ${data}`);
          reject(new Error(`Failed to create plan: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 請求錯誤:', error);
      reject(error);
    });

    req.write(planData);
    req.end();
  });
}

// 主函數
async function main() {
  try {
    if (SECRET === 'YOUR_SECRET_KEY') {
      console.error('❌ 錯誤：請先設置 PayPal Secret');
      console.error('   方法 1: 設置環境變數 PAYPAL_SECRET');
      console.error('   方法 2: 直接編輯此腳本，替換 YOUR_SECRET_KEY');
      console.error('\n   獲取 Secret:');
      console.error('   1. 登入 https://developer.paypal.com/');
      console.error('   2. 進入 My Apps & Credentials');
      console.error('   3. 選擇 Sandbox 或 Live 環境');
      console.error('   4. 找到您的 App，點擊查看 Secret\n');
      process.exit(1);
    }

    console.log('🚀 開始創建 PayPal 訂閱計劃...\n');

    // 步驟 1: 獲取 Access Token
    console.log('步驟 1: 獲取 Access Token...');
    const accessToken = await getAccessToken();

    // 步驟 2: 創建產品
    console.log('步驟 2: 創建產品...');
    const productId = await createProduct(accessToken);

    // 步驟 3: 創建訂閱計劃
    console.log('步驟 3: 創建訂閱計劃...');
    await createPlan(accessToken, productId);

    console.log('✅ 完成！');
  } catch (error) {
    console.error('\n❌ 發生錯誤:', error.message);
    process.exit(1);
  }
}

main();

