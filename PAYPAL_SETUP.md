# PayPal 訂閱計劃設置指南

## 🔴 當前問題

如果遇到 `RESOURCE_NOT_FOUND` 錯誤，表示 Plan ID 在 PayPal Sandbox 環境中不存在。

## 📋 解決步驟

### 1. 登入 PayPal Developer Dashboard

1. 前往 [PayPal Developer Dashboard](https://developer.paypal.com/)
2. 使用您的 PayPal 開發者帳號登入
3. 確保選擇 **Sandbox** 環境（測試環境）

### 2. 創建訂閱產品和計劃

PayPal Developer Dashboard 的界面可能因版本而異。請嘗試以下方法：

#### 方法 1：通過 Dashboard 創建（如果可用）

1. 登入 [PayPal Developer Dashboard](https://developer.paypal.com/)
2. 確保選擇 **Sandbox** 環境（測試）或 **Live** 環境（正式）
3. 在左側選單中查找以下選項之一：
   - **Products** > **Subscriptions**
   - **My Apps & Credentials** > **Products**
   - **Dashboard** > **Products**
   - **Subscriptions**（直接在左側選單）

4. 如果找到，點擊 **Create product** 或 **Create subscription**
5. 填寫產品和計劃資訊

#### 方法 2：通過 PayPal 商業帳戶創建

1. 登入您的 PayPal 商業帳戶（不是 Developer Dashboard）
2. 前往 **Pay & Get Paid** > **Accept Payments**
3. 點擊 **Subscriptions** 標籤
4. 創建新的訂閱計劃

#### 方法 3：使用 PayPal API 創建（推薦）

如果 Dashboard 中找不到選項，可以使用 PayPal REST API 創建：

**步驟 1：創建產品（Product）**

使用以下 API 請求：

```bash
curl -X POST https://api.sandbox.paypal.com/v1/catalogs/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Lunchips Premium Subscription",
    "description": "Premium subscription for Lunchips",
    "type": "SERVICE",
    "category": "SOFTWARE"
  }'
```

**步驟 2：創建訂閱計劃（Plan）**

使用產品 ID 創建計劃：

```bash
curl -X POST https://api.sandbox.paypal.com/v1/billing/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "product_id": "PROD-XXXXXXXXXXXXX",
    "name": "Monthly Premium Plan",
    "description": "Monthly subscription plan",
    "billing_cycles": [{
      "frequency": {
        "interval_unit": "MONTH",
        "interval_count": 1
      },
      "tenure_type": "REGULAR",
      "sequence": 1,
      "total_cycles": 0,
      "pricing_scheme": {
        "fixed_price": {
          "value": "9.99",
          "currency_code": "USD"
        }
      }
    }],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "setup_fee": {
        "value": "0",
        "currency_code": "USD"
      }
    }
  }'
```

**獲取 Access Token：**

```bash
curl -X POST https://api.sandbox.paypal.com/v1/oauth2/token \
  -H "Accept: application/json" \
  -H "Accept-Language: en_US" \
  -u "YOUR_CLIENT_ID:YOUR_SECRET" \
  -d "grant_type=client_credentials"
```

#### 方法 4：使用 PayPal Postman Collection

1. 下載 [PayPal Postman Collection](https://developer.paypal.com/docs/api/overview/#postman)
2. 導入到 Postman
3. 設置環境變數（Client ID、Secret）
4. 使用 "Create Product" 和 "Create Plan" 請求

### 3. 獲取 Plan ID

無論使用哪種方法創建計劃，獲取 Plan ID 的方式：

1. **通過 Dashboard**：
   - 在產品/計劃列表中，找到您創建的計劃
   - Plan ID 會顯示在計劃詳情中
   - 格式為：`P-XXXXXXXXXXXXXXXXXXXXX`

2. **通過 API**：
   - API 響應中會包含 `id` 欄位，這就是 Plan ID
   - 例如：`"id": "P-24U34883P2169593VNE7PPPY"`

3. **通過 PayPal 商業帳戶**：
   - 在 Subscriptions 頁面中，點擊計劃詳情
   - Plan ID 會顯示在計劃資訊中

**重要**：請確保複製完整的 Plan ID（包括 `P-` 前綴）

### 5. 更新代碼中的 Plan ID

更新以下文件中的 `PAYPAL_PLAN_ID`：

1. **src/components/PayPalSubscriptionButton.tsx**
   ```typescript
   const PAYPAL_PLAN_ID = 'P-您的計劃ID';
   ```

2. **src/components/PayPalSubscriptionModal.tsx**
   ```typescript
   const PAYPAL_PLAN_ID = 'P-您的計劃ID';
   ```

3. **src/components/TrialEndedPaywall.tsx**
   ```typescript
   const PAYPAL_PLAN_ID = 'P-您的計劃ID';
   ```

4. **src/config/dev.ts**
   ```typescript
   export const PAYPAL_SUBSCRIPTION_PLAN_ID = 'P-您的計劃ID';
   ```

### 6. 重新構建和部署

```bash
# 清除緩存
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 重新構建
npx expo export --platform web

# 部署（如果需要）
.\deploy-launchips.ps1
```

## ⚠️ 重要注意事項

1. **環境匹配**：
   - Sandbox 環境的 Plan ID 只能在 Sandbox 環境使用
   - Live 環境的 Plan ID 只能在 Live 環境使用
   - 兩個環境的 Plan ID **不能互換使用**

2. **Client ID 匹配**：
   - 確保使用的 Client ID 與 Plan ID 屬於同一個 PayPal 帳號
   - Sandbox Client ID 必須配對 Sandbox Plan ID

3. **計劃狀態**：
   - 確保計劃狀態為 **Active**
   - 如果計劃被暫停或刪除，會出現 `RESOURCE_NOT_FOUND` 錯誤

## 🧪 測試

1. 在瀏覽器中打開應用程式
2. 觸發訂閱流程
3. 檢查瀏覽器控制台是否有錯誤
4. 如果仍有錯誤，確認：
   - Plan ID 是否正確複製（沒有多餘空格）
   - 是否在正確的環境（Sandbox/Live）
   - 計劃是否為 Active 狀態

## 📞 需要幫助？

如果按照以上步驟仍無法解決問題，請：
1. 檢查 PayPal Developer Dashboard 中的計劃狀態
2. 確認 Client ID 和 Plan ID 是否匹配
3. 查看瀏覽器控制台的完整錯誤訊息
4. 聯繫 PayPal 支援（如果問題持續）

