// 開發配置
// 設置為 true 時，在 Web 平台上自動跳過登入流程
// 設置為 false 時，需要正常登入（用於測試登入系統）

export const SKIP_AUTH_ON_WEB = false; // 設為 true 以跳過登入（方便直接使用牌局記錄功能）

// 預覽模式：設置為 true 時，在 Web 平台上直接顯示 Grok 風格預覽
export const SHOW_GROK_PREVIEW = false; // 設置為 true 來直接顯示預覽

// 訂閱模式測試：設置為 true 時，在 localhost 上強制啟用訂閱模式（試用到期）
export const ENABLE_SUBSCRIPTION_MODE = true; // 設置為 true 來測試訂閱功能

// 強制已訂閱模式：設置為 true 時，在 localhost 上強制設置為已訂閱狀態
export const FORCE_SUBSCRIBED = true; // 設置為 true 來測試已訂閱狀態

// PayPal 配置
// ============================================
// 如何獲取 PayPal Client ID:
// 1. 登入 PayPal Developer Dashboard: https://developer.paypal.com/
// 2. 進入 "My Apps & Credentials"
// 3. 選擇 Sandbox (測試) 或 Live (正式) 環境
// 4. 在 "REST API apps" 區塊中找到你的 App
// 5. 複製 "Client ID" 並貼到下方
// ============================================

// PayPal 環境配置
// ============================================
// 是否使用 Sandbox 測試環境
// true = 使用 Sandbox (測試環境，URL: https://www.sandbox.paypal.com)
// false = 使用 Live (正式環境，URL: https://www.paypal.com)
// 
// 自動檢測環境：localhost 使用 Sandbox，生產環境使用 Live
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.endsWith('.local')
);

const isProduction = typeof window !== 'undefined' && (
  window.location.hostname === 'lunchips.com' ||
  window.location.hostname === 'www.lunchips.com'
);

// 自動選擇環境：生產環境使用 Live，其他使用 Sandbox
export const PAYPAL_USE_SANDBOX = !isProduction; // 生產環境自動使用 Live，其他使用 Sandbox

// Sandbox 測試環境配置
export const PAYPAL_SANDBOX_CLIENT_ID = 'AQ1VvdEb7EI-w95pq5RNiYtXaL05cecchwK1y8dPRVo08nZcbOivk1LVbDvsxFRrjkcANZOsvtofxaPl';
export const PAYPAL_SANDBOX_PLAN_ID = 'P-1CB1091574864081BNE7P3YY';

// Live 正式環境配置 (lunchips.com)
export const PAYPAL_LIVE_CLIENT_ID = 'AdONrxmjU1VFgNTLu8Al7z5j9RNMwoKUNfUL9ZxYk8-1VFW7l4RxLX8KDB0BxT4gJlND_Xw9VrjORyC3';
export const PAYPAL_LIVE_PLAN_ID = 'P-53786539UG299980ANEY2VEA';

// 根據環境自動選擇配置
export const PAYPAL_CLIENT_ID = PAYPAL_USE_SANDBOX ? PAYPAL_SANDBOX_CLIENT_ID : PAYPAL_LIVE_CLIENT_ID;
export const PAYPAL_SUBSCRIPTION_PLAN_ID = PAYPAL_USE_SANDBOX ? PAYPAL_SANDBOX_PLAN_ID : PAYPAL_LIVE_PLAN_ID;
export const PAYPAL_SDK_URL = PAYPAL_USE_SANDBOX 
  ? 'https://www.sandbox.paypal.com/sdk/js'
  : 'https://www.paypal.com/sdk/js';

// ============================================
// 如何獲取 PayPal Client ID:
// 1. 登入 PayPal Developer Dashboard: https://developer.paypal.com/
// 2. 進入 "My Apps & Credentials"
// 3. 選擇 Sandbox (測試) 或 Live (正式) 環境
// 4. 在 "REST API apps" 區塊中找到你的 App
// 5. 複製 "Client ID" 並貼到上方對應的環境配置
// 
// 如何創建 PayPal 訂閱計劃：
// 1. 登入 PayPal Developer Dashboard: https://developer.paypal.com/
// 2. 前往 Products > Subscriptions
// 3. 創建新的訂閱計劃（Product + Plan）
// 4. 複製 Plan ID（格式：P-XXXXXXXXXXXXX）
// 5. 將 Plan ID 貼到上方對應的環境配置
// 
// 注意：
// - Sandbox 和 Live 環境的 Plan ID 不同，需要分別創建
// - 如果看到 "RESOURCE_NOT_FOUND" 錯誤，表示 Plan ID 無效或不存在
// - 請確保 Plan ID 與當前環境（Sandbox/Live）匹配
// ============================================
