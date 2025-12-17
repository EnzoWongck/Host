# 🚀 Launchips.com 部署狀態

## ✅ 已完成步驟

1. ✅ **構建 Web 應用程式** - 已完成
   - 構建輸出位於 `dist/` 目錄
   - 所有資源文件已正確打包

2. ✅ **更新配置文件** - 已完成
   - `dist/manifest.json` 已更新為 `https://launchips.com`
   - `dist/index.html` 已更新，包含：
     - Open Graph 標籤
     - Twitter 標籤
     - Google Analytics

3. ✅ **部署到 Vercel** - 已完成
   - 部署 URL: https://host27o-6vsxjvl9q-enzos-projects-c5fe6943.vercel.app
   - 檢查 URL: https://vercel.com/enzos-projects-c5fe6943/host27o/DW5oqeCJL2zdKj7ghLQdhqUT3RZL

---

## 📋 下一步：配置域名

### 步驟 1：在 Vercel 創建或選擇專案

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 如果已有 `launchips` 專案，選擇它
3. 如果沒有，創建新專案：
   - 點擊 **Add New...** > **Project**
   - 專案名稱：`launchips`
   - 或者將現有的 `host27o` 專案重命名為 `launchips`

### 步驟 2：添加自定義域名

1. 在專案中，點擊 **Settings** > **Domains**
2. 添加以下域名：
   - `launchips.com`
   - `www.launchips.com`
3. 點擊 **Add**

### 步驟 3：配置 DNS

Vercel 會顯示兩種配置方式，選擇其中一種：

#### 方式 1：使用 Vercel Nameserver（推薦，最簡單）

1. 在 Vercel 選擇 **"Use Vercel DNS"**
2. 複製顯示的 Nameserver 地址（例如：`ns1.vercel-dns.com`）
3. 前往您的域名註冊商（GoDaddy、Namecheap 等）的 DNS 設置
4. 將 Nameserver 改為 Vercel 提供的地址
5. 等待 DNS 傳播（通常 5-30 分鐘）

#### 方式 2：手動配置 DNS 記錄

在域名註冊商添加以下 DNS 記錄：

```
類型    名稱    值
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

---

## ⏱️ DNS 傳播時間

- **通常時間**：5-30 分鐘
- **最長時間**：最多 48 小時（取決於 DNS 服務商）

### 檢查 DNS 傳播狀態

使用以下工具檢查全球 DNS 傳播：
- [DNS Checker](https://dnschecker.org/#A/launchips.com)
- 在命令行執行：`nslookup launchips.com`

### 清除本地 DNS 快取

如果 DNS 已傳播但本地仍無法訪問：

**Windows:**
```powershell
ipconfig /flushdns
```

**macOS:**
```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
```

---

## ✅ 部署後驗證

部署完成並配置 DNS 後，請驗證以下功能：

### 1. 基本訪問
- [ ] 訪問 https://launchips.com
- [ ] 訪問 https://www.launchips.com（應重定向到主域名）

### 2. PWA 功能
- [ ] 檢查 manifest：https://launchips.com/manifest.json
- [ ] 檢查 Service Worker：https://launchips.com/sw.js
- [ ] 測試「添加到主畫面」功能

### 3. API 端點
- [ ] 測試健康檢查：https://launchips.com/api/health

### 4. SSL 證書
- [ ] 確認 HTTPS 正常工作
- [ ] 檢查瀏覽器顯示「安全」鎖圖標

---

## 🔧 功能配置（可選）

### 跳過登入（方便直接使用牌局記錄）

如果需要用戶直接使用牌局記錄功能而不需要登入：

1. 編輯 `src/config/dev.ts`
2. 將 `SKIP_AUTH_ON_WEB` 設為 `true`：
   ```typescript
   export const SKIP_AUTH_ON_WEB = true;
   ```
3. 重新構建並部署：
   ```powershell
   cmd /c "npx expo export --platform web"
   cmd /c "vercel --prod --yes"
   ```

---

## 🔄 更新部署

每次更新後，執行以下命令：

```powershell
# 1. 構建
cmd /c "npx expo export --platform web"

# 2. 更新 manifest.json 和 HTML（如果需要）
# 或使用部署腳本：.\deploy-launchips.ps1

# 3. 部署
cmd /c "vercel --prod --yes"
```

---

## 🐛 疑難排解

### 問題 1：DNS 未生效

**解決方法：**
- 確認 DNS 記錄已正確設置
- 使用 [DNS Checker](https://dnschecker.org/) 檢查全球傳播狀態
- 清除本地 DNS 快取
- 等待更長時間（最多 48 小時）

### 問題 2：SSL 證書未生效

**解決方法：**
- 確認 DNS 記錄已正確配置
- 等待 Vercel 自動配置 SSL（通常 1-2 分鐘）
- 在 Vercel Dashboard 檢查域名狀態

### 問題 3：部署後顯示 404

**解決方法：**
- 確認 `dist` 目錄已正確構建
- 檢查 `vercel.json` 配置是否正確
- 確認 `api/index.js` 存在且正確

### 問題 4：無法訪問牌局記錄

**解決方法：**
- 檢查 `SKIP_AUTH_ON_WEB` 設置
- 檢查瀏覽器控制台是否有錯誤
- 確認所有依賴已正確安裝

---

## 📊 有用的連結

- **Vercel Dashboard**: https://vercel.com/dashboard
- **專案設置**: https://vercel.com/dashboard → 選擇專案 → Settings
- **域名管理**: https://vercel.com/dashboard → 選擇專案 → Settings → Domains
- **部署日誌**: https://vercel.com/dashboard → 選擇專案 → Deployments
- **DNS Checker**: https://dnschecker.org/#A/launchips.com

---

## 🎉 完成！

完成 DNS 配置後，您的應用將在 **https://launchips.com** 上正式運行！

**當前部署狀態：**
- ✅ 應用已構建
- ✅ 已部署到 Vercel
- ⏳ 等待配置域名和 DNS

---

**最後更新時間**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")






