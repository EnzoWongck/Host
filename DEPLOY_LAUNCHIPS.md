# 🚀 部署牌局記錄功能到 launchips.com

## ⏱️ 時間評估

### 實際操作時間：**15-20 分鐘**
- 構建應用程式：2-3 分鐘
- 部署到 Vercel：2-3 分鐘
- 配置 Vercel 域名：5 分鐘
- 配置 DNS：5-10 分鐘

### DNS 傳播時間：**5-30 分鐘**（可能需要更長，取決於 DNS 服務商）

**總計：約 20-50 分鐘可完全上線**

---

## 📋 部署步驟

### 步驟 1：確保跳過登入（可選，方便直接使用牌局記錄）

如果需要用戶直接使用牌局記錄功能而不需要登入，請修改 `src/config/dev.ts`：

```typescript
export const SKIP_AUTH_ON_WEB = true; // 設為 true 以跳過登入
```

**注意**：如果保持 `false`，用戶需要先登入才能使用。

---

### 步驟 2：執行部署腳本

在 PowerShell 中執行：

```powershell
.\deploy-launchips.ps1
```

這個腳本會自動：
1. ✅ 檢查 Vercel CLI
2. ✅ 構建 Web 版本
3. ✅ 更新 manifest.json 為 launchips.com
4. ✅ 部署到 Vercel

---

### 步驟 3：在 Vercel 配置域名

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇或創建專案（建議命名為 `launchips`）
3. 進入 **Settings** > **Domains**
4. 添加域名：
   - `launchips.com`
   - `www.launchips.com`

---

### 步驟 4：配置 DNS

根據 Vercel 的指示配置 DNS，有兩種方式：

#### 方式 1：使用 Vercel Nameserver（推薦）
- 在域名註冊商處將 Nameserver 改為 Vercel 提供的地址
- Vercel 會自動處理所有 DNS 記錄

#### 方式 2：手動配置 DNS 記錄
- **A 記錄**：`@` → `76.76.21.21`
- **CNAME 記錄**：`www` → `cname.vercel-dns.com`

---

## ✅ 功能確認

部署完成後，訪問 https://launchips.com 應該可以看到：

1. ✅ **牌局列表**：顯示所有牌局記錄
2. ✅ **新增牌局**：可以創建新牌局
3. ✅ **牌局詳情**：點擊牌局可查看詳情
4. ✅ **牌局統計**：顯示總買入、玩家數、盈虧等

---

## 🔧 疑難排解

### DNS 未生效
- 檢查 DNS 記錄是否正確設置
- 使用 [DNS Checker](https://dnschecker.org/) 檢查全球 DNS 傳播
- 清除本地 DNS 快取：`ipconfig /flushdns` (Windows)

### 部署失敗
- 確保已安裝 Node.js 16+
- 確保 Vercel CLI 已安裝：`npm install -g vercel`
- 確保已登入 Vercel：`vercel login`

### 無法訪問牌局記錄
- 檢查 `SKIP_AUTH_ON_WEB` 設置
- 檢查瀏覽器控制台是否有錯誤
- 確認所有依賴已正確安裝

---

## 📝 後續優化建議

1. **環境變量**：使用 Vercel 環境變量管理不同環境的配置
2. **自動部署**：連接 GitHub，設置自動部署
3. **監控**：添加 Google Analytics 或其他監控工具
4. **性能優化**：啟用 Vercel 的 Edge Network 和 CDN

---

## 🎯 快速部署命令

```powershell
# 1. 修改配置（如果需要跳過登入）
# 編輯 src/config/dev.ts，將 SKIP_AUTH_ON_WEB 設為 true

# 2. 執行部署
.\deploy-launchips.ps1

# 3. 在 Vercel Dashboard 配置域名
# 4. 在域名註冊商配置 DNS
```

---

**完成後，牌局記錄功能將在 https://launchips.com 上線！** 🎉







