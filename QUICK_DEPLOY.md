# 🚀 快速部署到 Vercel (host27o.com)

## 一鍵部署步驟

### 1. 安裝 Vercel CLI（如果還沒安裝）

```powershell
npm install -g vercel@latest
```

### 2. 登入 Vercel（第一次才需要）

```powershell
vercel login
```

### 3. 執行部署腳本

```powershell
.\deploy-vercel.ps1
```

或手動執行：

```powershell
# 構建應用程式
npx expo export --platform web

# 部署到 Vercel
vercel --prod --yes
```

### 4. 配置域名

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇專案 `host27o`
3. 點擊 **Settings** > **Domains**
4. 添加 `host27o.com` 和 `www.host27o.com`
5. 按照指示配置 DNS：
   - **方式 A（推薦）**：使用 Vercel Nameserver
   - **方式 B**：手動設置：
     - CNAME `www` → `cname.vercel-dns.com`
     - A `@` → `76.76.21.21`

### 5. 等待完成

- DNS 傳播：5-30 分鐘
- SSL 證書：1-2 分鐘（自動）

### 6. 測試

```powershell
# 測試主頁
curl https://host27o.com

# 測試 API
curl https://host27o.com/api/health
```

---

## ✅ 完成！

您的應用現在運行在：**https://host27o.com**

---

## 📋 已準備的文件

- ✅ `vercel.json` - Vercel 配置
- ✅ `api/index.js` - 靜態文件服務器
- ✅ `api/health.js` - 健康檢查 API
- ✅ `app.json` - 已更新為 host27o
- ✅ `deploy-vercel.ps1` - 部署腳本
- ✅ `VERCEL_DEPLOYMENT.md` - 詳細部署指南

---

## 🔄 更新部署

每次更新後：

```powershell
.\deploy-vercel.ps1
```

或：

```powershell
npx expo export --platform web
vercel --prod --yes
```

---

**祝部署順利！🎉**


