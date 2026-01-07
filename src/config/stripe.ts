// Stripe 配置
// ============================================
// 設定 Stripe API Keys 和產品價格 ID
// ============================================

// 環境檢測
const isProduction = typeof window !== 'undefined' && (
  window.location.hostname === 'lunchips.com' ||
  window.location.hostname === 'www.lunchips.com'
);

// ============================================
// Stripe API Keys
// 請從 Stripe Dashboard > Developers > API keys 獲取
// ============================================

// 測試環境 (Test Mode)
export const STRIPE_TEST_PUBLISHABLE_KEY = 'pk_live_51Sf2A3C059bhXtelq48gGAGKyhrD7m4NfGUfb9oklalL39PYx6ommvc6yq8YHG1EPG9SJs1m97mkIVr17jAYTQzQ00z3Cq3rg2';

// 正式環境 (Live Mode) - 部署到生產環境時使用
export const STRIPE_LIVE_PUBLISHABLE_KEY = 'pk_live_51Sf2A3C059bhXtelq48gGAGKyhrD7m4NfGUfb9oklalL39PYx6ommvc6yq8YHG1EPG9SJs1m97mkIVr17jAYTQzQ00z3Cq3rg2';

// 根據環境自動選擇
export const STRIPE_PUBLISHABLE_KEY = isProduction 
  ? STRIPE_LIVE_PUBLISHABLE_KEY 
  : STRIPE_TEST_PUBLISHABLE_KEY;

// ============================================
// Stripe 價格 ID (Price IDs)
// 請從 Stripe Dashboard > Products 獲取每個價格的 ID
// ============================================

// 測試環境價格 ID（使用相同的 Price ID，Stripe 會自動處理）
export const STRIPE_TEST_PRICES = {
  CHIP_1: 'price_1SfAAfC059bhXtelaE5o55PK',   // 1 Chip - $30 HKD
  CHIP_11: 'price_1SfOUnC059bhXtelb93CqfiC',  // 11 Chips - $299 HKD
  CHIP_36: 'price_1SfOUnC059bhXtelEWD2CFtq',  // 36 Chips - $899 HKD
};

// 正式環境價格 ID
export const STRIPE_LIVE_PRICES = {
  CHIP_1: 'price_1SfAAfC059bhXtelaE5o55PK',   // 1 Chip - $30 HKD
  CHIP_11: 'price_1SfOUnC059bhXtelb93CqfiC',  // 11 Chips - $299 HKD
  CHIP_36: 'price_1SfOUnC059bhXtelEWD2CFtq',  // 36 Chips - $899 HKD
};

// 根據環境自動選擇價格 ID
export const STRIPE_PRICES = isProduction ? STRIPE_LIVE_PRICES : STRIPE_TEST_PRICES;

// ============================================
// Chips 套餐配置
// ============================================
export interface ChipsPackage {
  id: string;
  name: string;
  chips: number;
  priceHKD: number;
  priceId: string;
  popular?: boolean;
  savings?: string;
}

export const CHIPS_PACKAGES: ChipsPackage[] = [
  {
    id: 'chip_1',
    name: '1 Chip',
    chips: 1,
    priceHKD: 30,
    priceId: STRIPE_PRICES.CHIP_1,
  },
  {
    id: 'chip_11',
    name: '買十送一',
    chips: 11,
    priceHKD: 299,
    priceId: STRIPE_PRICES.CHIP_11,
    popular: true,
    savings: '$27/Chip',
  },
  {
    id: 'chip_36',
    name: '超值套餐',
    chips: 36,
    priceHKD: 899,
    priceId: STRIPE_PRICES.CHIP_36,
    savings: '$25/Chip',
  },
];

// ============================================
// API Endpoints
// ============================================
export const STRIPE_API_ENDPOINTS = {
  CREATE_CHECKOUT: '/api/stripe/create-checkout-session',
  WEBHOOK: '/api/stripe/webhook',
  GET_BALANCE: '/api/chips/balance',
  CONSUME_CHIP: '/api/chips/consume',
};

// ============================================
// Chips 系統配置
// ============================================
export const CHIPS_CONFIG = {
  // 新用戶贈送的免費 Chips 數量
  FREE_CHIPS_FOR_NEW_USER: 1,
  
  // 牌局 Chip 有效時長（毫秒）- 24 小時
  CHIP_VALIDITY_DURATION: 24 * 60 * 60 * 1000,
  
  // 提前提醒時間（毫秒）- 提前 30 分鐘提醒
  REMINDER_BEFORE_EXPIRY: 30 * 60 * 1000,
};

