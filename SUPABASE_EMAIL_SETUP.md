# Supabase Auth Email 設定指南

## 設定驗證郵件發送者名稱為 "LunChips"

### 步驟 1：登入 Supabase Dashboard

1. 前往 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇您的專案：`plnghuqosljnezjfpvmc`

### 步驟 2：進入 Authentication 設定

1. 在左側選單中點擊 **Authentication**
2. 點擊 **Email Templates** 標籤

### 步驟 3：修改 Email 模板

#### 3.1 確認郵件模板（Confirm signup）

1. 找到 **Confirm signup** 模板
2. 在 **Subject** 欄位中，確保包含 "LunChips"：
   ```
   確認您的 LunChips 帳號
   ```
   或
   ```
   [LunChips] 請確認您的電子郵件地址
   ```

3. 在 **Body** 中，可以自訂郵件內容，例如：
   ```html
   <h2>歡迎使用 LunChips！</h2>
   <p>請點擊以下連結確認您的電子郵件地址：</p>
   <p><a href="{{ .ConfirmationURL }}">確認電子郵件</a></p>
   <p>如果按鈕無法點擊，請複製以下網址到瀏覽器：</p>
   <p>{{ .ConfirmationURL }}</p>
   <p>此連結將在 24 小時後過期。</p>
   <hr>
   <p>此郵件由 LunChips 自動發送，請勿回覆。</p>
   ```

#### 3.2 密碼重設郵件模板（Reset password）

1. 找到 **Reset password** 模板
2. 在 **Subject** 欄位中：
   ```
   [LunChips] 重設您的密碼
   ```

3. 在 **Body** 中：
   ```html
   <h2>LunChips 密碼重設</h2>
   <p>您要求重設 LunChips 帳號的密碼。</p>
   <p>請點擊以下連結重設密碼：</p>
   <p><a href="{{ .ConfirmationURL }}">重設密碼</a></p>
   <p>如果按鈕無法點擊，請複製以下網址到瀏覽器：</p>
   <p>{{ .ConfirmationURL }}</p>
   <p>此連結將在 1 小時後過期。</p>
   <p>如果您沒有要求重設密碼，請忽略此郵件。</p>
   <hr>
   <p>此郵件由 LunChips 自動發送，請勿回覆。</p>
   ```

#### 3.3 Magic Link 郵件模板（Magic Link）

1. 找到 **Magic Link** 模板
2. 在 **Subject** 欄位中：
   ```
   [LunChips] 您的登入連結
   ```

3. 在 **Body** 中：
   ```html
   <h2>LunChips 登入連結</h2>
   <p>請點擊以下連結登入您的 LunChips 帳號：</p>
   <p><a href="{{ .ConfirmationURL }}">登入 LunChips</a></p>
   <p>如果按鈕無法點擊，請複製以下網址到瀏覽器：</p>
   <p>{{ .ConfirmationURL }}</p>
   <p>此連結將在 1 小時後過期。</p>
   <hr>
   <p>此郵件由 LunChips 自動發送，請勿回覆。</p>
   ```

### 步驟 4：設定 SMTP 發送者資訊（可選）

如果您使用自訂 SMTP：

1. 在左側選單中點擊 **Settings**
2. 點擊 **Auth** 標籤
3. 捲動到 **SMTP Settings** 區塊
4. 設定：
   - **Sender email**: `noreply@lunchips.com`（或您的域名郵箱）
   - **Sender name**: `LunChips`

### 步驟 5：測試郵件

1. 在 **Authentication** > **Users** 中創建一個測試用戶
2. 檢查收到的驗證郵件
3. 確認發送者名稱顯示為 "LunChips"

## 可用的模板變數

在 Email 模板中可以使用以下變數：

- `{{ .ConfirmationURL }}` - 確認/重設連結
- `{{ .Token }}` - 驗證 token
- `{{ .TokenHash }}` - Token hash
- `{{ .SiteURL }}` - 網站 URL
- `{{ .Email }}` - 用戶電子郵件
- `{{ .RedirectTo }}` - 重定向 URL

## 注意事項

1. **郵件模板修改後立即生效**，無需重新部署
2. **HTML 格式支援**：可以使用 HTML 標籤美化郵件
3. **多語言支援**：可以為不同語言創建不同的模板
4. **測試建議**：修改後先發送測試郵件確認效果

## 相關文檔

- [Supabase Email Templates 文檔](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP 設定](https://supabase.com/docs/guides/auth/auth-smtp)

