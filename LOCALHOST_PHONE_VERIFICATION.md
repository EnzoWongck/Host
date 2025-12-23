# 📱 Localhost 電話驗證設置指南

## 問題說明

在 localhost 上無法驗證電話號碼，因為電話驗證 API 是 Vercel serverless functions，需要正確的環境變數配置才能在本地運行。

## ✅ 解決方案

我已經修改了 `server.js`，使其可以在 localhost 上處理 API 路由。現在您需要設置環境變數。

## 🔧 設置步驟

### 1. 安裝 dotenv（可選，但推薦）

```bash
npm install dotenv
```

### 2. 創建 `.env` 文件

在項目根目錄創建 `.env` 文件，並添加以下環境變數：

```env
# Twilio 配置（用於電話驗證）
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid

# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. 獲取 Twilio 憑證

1. 登入 [Twilio Console](https://console.twilio.com/)
2. 在 Dashboard 中找到：
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`
3. 前往 **Verify** → **Services**，創建或選擇一個 Verify Service
4. 複製 **Service SID** → `TWILIO_VERIFY_SERVICE_SID`

### 4. 獲取 Supabase 憑證

1. 登入 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇您的項目
3. 前往 **Settings** → **API**
4. 複製：
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 5. 啟動服務器

使用修改後的 `server.js`：

```bash
node server.js
```

或者使用 Expo：

```bash
npm run web
```

## 🧪 測試

1. 打開瀏覽器，訪問 `http://localhost:3000`
2. 嘗試發送電話驗證碼
3. 檢查終端機輸出，應該看到：
   - `✅ 環境變數已加載`
   - `✅ API 路由已加載`
   - API 請求日誌

## ⚠️ 注意事項

1. **Twilio Free Trial 限制**：
   - Free Trial 帳戶只能發送驗證碼到已驗證的電話號碼
   - 需要在 Twilio Console 中驗證您的電話號碼
   - 或升級到 Pay as you go 帳戶

2. **環境變數安全**：
   - **不要**將 `.env` 文件提交到 Git
   - 確保 `.env` 在 `.gitignore` 中

3. **生產環境**：
   - 在 Vercel 上，環境變數應該在 Vercel Dashboard 中設置
   - 不需要 `.env` 文件

## 🔍 故障排除

### 問題：API 返回 500 錯誤

**檢查：**
1. 環境變數是否正確設置
2. Twilio 憑證是否有效
3. Supabase 憑證是否有效
4. 終端機是否有錯誤訊息

### 問題：無法加載 API 路由

**檢查：**
1. `api/phone/send-otp.js` 文件是否存在
2. `api/phone/verify-otp.js` 文件是否存在
3. 終端機是否有模塊加載錯誤

### 問題：Twilio 錯誤 "未在 Twilio 驗證"

**解決方案：**
1. 登入 Twilio Console
2. 前往 **Phone Numbers** → **Verified Caller IDs**
3. 添加並驗證您的電話號碼

## 📝 相關文件

- `server.js` - 本地開發服務器（已修改以支持 API 路由）
- `api/phone/send-otp.js` - 發送 OTP API
- `api/phone/verify-otp.js` - 驗證 OTP API

