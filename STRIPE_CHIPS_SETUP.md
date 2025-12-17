# 🎰 Stripe Chips 系統設定指南

## 概述

本指南將幫助你完成從 PayPal 轉換到 Stripe 支付系統，並實現 Chips token 系統。

### 系統邏輯

- **每個牌局消耗 1 個 Chip**
- **每個 Chip 有效時長 12 小時**
- **12 小時後彈出續費提醒**
- **如果不續費，只能查看數據但無法編輯**
- **新用戶註冊贈送 1 個免費 Chip**

### 價格方案

| 套餐 | Chips 數量 | 價格 (HKD) | 備註 |
|------|-----------|------------|------|
| 單個 | 1 | $30 | 基本方案 |
| 11個 | 11 | $300 | 節省 $30 |
| 35個 | 35 | $900 | 節省 $150 |

---

## Step 1: Stripe 帳號設定

### 1.1 登入 Stripe Dashboard

1. 前往 **[Stripe Dashboard](https://dashboard.stripe.com/)**
2. 使用你的 Stripe 帳號登入
3. 確認你在正確的環境（Test 或 Live）

### 1.2 創建產品

1. 前往 **Products** → **+ Add product**
2. 填寫產品資訊：
   - **Name**: `Lunchips Poker Chips`
   - **Description**: `Chips for poker game sessions`
3. 點擊 **Save product**

### 1.3 添加價格

在產品頁面，添加三個價格：

#### 價格 1: 單個 Chip
- **Price**: `30.00 HKD`
- **Type**: `One time`
- **Nickname**: `1_chip` (可選)

#### 價格 2: 11 Chips 套餐
- **Price**: `300.00 HKD`
- **Type**: `One time`
- **Nickname**: `11_chips` (可選)

#### 價格 3: 35 Chips 套餐
- **Price**: `900.00 HKD`
- **Type**: `One time`
- **Nickname**: `35_chips` (可選)

### 1.4 複製 Price IDs

創建價格後，複製每個價格的 **Price ID**（格式：`price_xxxxx`）

---

## Step 2: 獲取 API Keys

1. 前往 **Developers** → **API keys**
2. 複製以下資訊：

| 環境 | Key 類型 | 格式 |
|------|---------|------|
| Test | Publishable key | `pk_test_xxxxx` |
| Test | Secret key | `sk_test_xxxxx` |
| Live | Publishable key | `pk_live_xxxxx` |
| Live | Secret key | `sk_live_xxxxx` |

---

## Step 3: 設定 Webhook

### 3.1 創建 Webhook Endpoint

1. 前往 **Developers** → **Webhooks**
2. 點擊 **+ Add endpoint**
3. 填寫：
   - **Endpoint URL**: `https://你的域名.vercel.app/api/stripe/webhook`
   - **Events to send**: 選擇 `checkout.session.completed`
4. 點擊 **Add endpoint**

### 3.2 複製 Webhook Secret

創建後，點擊 Endpoint 查看詳情，複製 **Signing secret**（格式：`whsec_xxxxx`）

---

## Step 4: 設定 Vercel 環境變數

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案
3. 前往 **Settings** → **Environment Variables**
4. 添加以下環境變數：

| 變數名稱 | 值 | 說明 |
|---------|---|------|
| `STRIPE_SECRET_KEY` | `sk_live_xxxxx` 或 `sk_test_xxxxx` | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx` | Webhook Signing Secret |
| `FIREBASE_PROJECT_ID` | 你的 Firebase 專案 ID | Firebase 設定 |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Firebase Admin |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | Firebase Admin |

### 獲取 Firebase Service Account

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案
3. 前往 **Project Settings** → **Service accounts**
4. 點擊 **Generate new private key**
5. 下載 JSON 文件
6. 從 JSON 中獲取：
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

⚠️ **注意**: `FIREBASE_PRIVATE_KEY` 需要保留換行符（`\n`），在 Vercel 中直接貼上即可。

---

## Step 5: 更新代碼配置

### 5.1 更新 Stripe 配置

編輯 `src/config/stripe.ts`，更新以下值：

```typescript
// 測試環境
export const STRIPE_TEST_PUBLISHABLE_KEY = 'pk_test_你的測試密鑰';

// 正式環境
export const STRIPE_LIVE_PUBLISHABLE_KEY = 'pk_live_你的正式密鑰';

// 測試環境價格 ID
export const STRIPE_TEST_PRICES = {
  CHIP_1: 'price_你的1chip測試價格ID',
  CHIP_15: 'price_你的15chips測試價格ID',
  CHIP_35: 'price_你的35chips測試價格ID',
};

// 正式環境價格 ID
export const STRIPE_LIVE_PRICES = {
  CHIP_1: 'price_你的1chip正式價格ID',
  CHIP_15: 'price_你的15chips正式價格ID',
  CHIP_35: 'price_你的35chips正式價格ID',
};
```

### 5.2 更新 Webhook Price 映射

編輯 `api/stripe/webhook.js`，更新 `PRICE_TO_CHIPS` 映射：

```javascript
const PRICE_TO_CHIPS = {
  // 測試環境
  'price_你的1chip測試價格ID': 1,
  'price_你的15chips測試價格ID': 15,
  'price_你的35chips測試價格ID': 35,
  // 正式環境
  'price_你的1chip正式價格ID': 1,
  'price_你的15chips正式價格ID': 15,
  'price_你的35chips正式價格ID': 35,
};
```

---

## Step 6: 安裝依賴

在專案目錄執行：

```bash
# 安裝 Stripe SDK（用於後端 API）
npm install stripe

# 安裝 Firebase Admin SDK（用於後端存儲用戶 Chips）
npm install firebase-admin
```

---

## Step 7: 部署到 Vercel

```bash
# 構建專案
npx expo export --platform web

# 部署到 Vercel
vercel --prod
```

或者推送到 Git，讓 Vercel 自動部署。

---

## Step 8: 測試

### 8.1 本地測試

1. 確保使用 **Test** 環境的 API Keys
2. 在 Stripe Dashboard 中創建測試產品和價格
3. 使用 Stripe 測試卡進行測試：
   - 卡號：`4242 4242 4242 4242`
   - 過期日：任意未來日期
   - CVC：任意 3 位數

### 8.2 測試 Webhook（本地開發）

使用 Stripe CLI 進行本地 Webhook 測試：

```bash
# 安裝 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登入
stripe login

# 轉發 Webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 複製顯示的 webhook signing secret 用於測試
```

### 8.3 驗證流程

1. **新用戶註冊**：確認獲得 1 個免費 Chip
2. **創建牌局**：確認消耗 1 個 Chip
3. **12 小時後**：確認彈出續費提醒（可在代碼中暫時改為 1 分鐘測試）
4. **購買 Chips**：確認 Stripe Checkout 流程正常
5. **Webhook 接收**：確認購買後 Chips 餘額正確更新

---

## 常見問題

### Q: Webhook 沒有觸發？

1. 確認 Webhook URL 正確
2. 確認選擇了正確的事件類型
3. 在 Vercel 日誌中檢查錯誤

### Q: 購買後 Chips 沒有增加？

1. 檢查 Vercel 環境變數是否正確設定
2. 檢查 Firebase Admin 憑證是否正確
3. 查看 Vercel Functions 日誌

### Q: 本地測試時 API 404？

確保 `vercel.json` 正確配置了 API routes，並且使用 `vercel dev` 進行本地測試。

---

## 文件結構

```
api/
├── stripe/
│   ├── create-checkout-session.js  # 創建 Stripe Checkout
│   └── webhook.js                   # 處理 Stripe Webhook
└── chips/
    ├── balance.js                   # 獲取 Chips 餘額
    ├── consume.js                   # 消耗 Chips
    └── game-status.js               # 檢查遊戲 Chip 狀態

src/
├── config/
│   └── stripe.ts                    # Stripe 配置
├── context/
│   └── ChipsContext.tsx             # Chips 狀態管理
├── components/
│   ├── ChipsPurchaseModal.tsx       # 購買 Chips 彈窗
│   └── ChipsExpiredModal.tsx        # Chip 過期提醒彈窗
└── hooks/
    └── useGameChip.ts               # 遊戲 Chip 管理 Hook
```

---

## 下一步

1. ✅ 完成 Stripe Dashboard 設定
2. ✅ 設定 Vercel 環境變數
3. ✅ 更新代碼中的 Price IDs
4. ✅ 部署到 Vercel
5. ✅ 測試完整流程
6. 🔄 監控 Stripe Dashboard 和 Vercel 日誌

如有問題，請檢查 Vercel Functions 日誌和 Stripe Dashboard 的 Webhook 日誌。

