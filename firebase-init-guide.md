# Firebase 初始化指南

## 步驟 1：登入 Firebase

在終端機執行：
```bash
firebase login
```

這會打開瀏覽器，請使用您的 Google 帳號登入。

## 步驟 2：初始化 Firebase 專案

登入後，執行：
```bash
firebase init
```

### 初始化選項建議：

1. **選擇功能**：
   - ✅ **Hosting** - 用於部署到 host27o.com
   - ✅ **Authentication** - 如果需要配置認證設定

2. **選擇專案**：
   - 選擇現有專案：`host-7b3ce`

3. **Hosting 設定**：
   - **Public directory**: `dist` 或 `pokerhost-production`（根據您的構建輸出目錄）
   - **Single-page app**: `Yes`
   - **Set up automatic builds and deploys with GitHub**: `No`（或根據需要選擇）

4. **Authentication 設定**：
   - 按照提示配置認證設定

## 步驟 3：配置自定義域名

初始化完成後，在 Firebase Console 中：

1. 前往 **Hosting**
2. 點擊 **添加自定義域**
3. 輸入：`host27o.com`
4. 按照指示配置 DNS 記錄

## 步驟 4：更新授權域

1. 前往 **Authentication** > **Settings** > **授權域**
2. 添加：`host27o.com`

完成後，Google 登入會顯示 "繼續使用 host27o.com"。

