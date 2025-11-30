# 🚀 Vercel 部署指南 - host27o.com

## 📋 前置準備

### 1. 購買域名
- 前往 GoDaddy 或其他域名註冊商購買 `host27o.com`
- 購買完成後，等待域名激活（通常幾分鐘）

### 2. 安裝 Vercel CLI
```powershell
npm install -g vercel@latest
```

### 3. 登入 Vercel
```powershell
vercel login
```
會自動打開瀏覽器，使用 GitHub/Google/Email 登入

---

## 🚀 快速部署

### 方法 1：使用部署腳本（推薦）

```powershell
# 在專案根目錄執行
.\deploy-vercel.ps1
```

### 方法 2：手動部署

```powershell
# 1. 構建應用程式
npx expo export --platform web

# 2. 部署到 Vercel
vercel --prod --yes
```

---

## 🔧 域名配置

### 步驟 1：在 Vercel 添加域名

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇專案 `host27o`
3. 點擊 **Settings** > **Domains**
4. 輸入 `host27o.com` 和 `www.host27o.com`
5. 點擊 **Add**

### 步驟 2：配置 DNS

Vercel 會顯示兩種配置方式：

#### 方式 A：使用 Vercel Nameserver（推薦，最簡單）

1. 在 Vercel 選擇 "Use Vercel DNS"
2. 複製顯示的 Nameserver 地址（例如：`ns1.vercel-dns.com`）
3. 前往域名註冊商（GoDaddy）的 DNS 設置
4. 將 Nameserver 改為 Vercel 提供的地址
5. 等待 DNS 傳播（通常 5-30 分鐘）

#### 方式 B：手動配置 DNS 記錄

在域名註冊商添加以下記錄：

```
類型    名稱    值
CNAME   www     cname.vercel-dns.com
A       @       76.76.21.21
```

---

## ✅ 部署後檢查

### 1. 基本功能測試

```powershell
# 測試主頁
curl https://host27o.com

# 測試 API
curl https://host27o.com/api/health
```

### 2. PWA 功能測試

- [ ] 訪問 `https://host27o.com`
- [ ] 檢查 manifest：`https://host27o.com/manifest.json`
- [ ] 檢查 Service Worker：`https://host27o.com/sw.js`
- [ ] 測試添加到主畫面功能

### 3. SSL 證書

Vercel 會自動配置 SSL 證書，通常 1-2 分鐘內完成。

---

## 📁 專案結構

```
Host/
├── api/
│   ├── index.js          # Vercel serverless function（服務靜態文件）
│   └── health.js         # 健康檢查 API
├── dist/                 # Expo 構建輸出（自動生成）
├── vercel.json           # Vercel 配置文件
├── app.json              # Expo 配置（已更新為 host27o）
└── deploy-vercel.ps1     # 部署腳本
```

---

## 🔄 更新部署

每次更新後，只需執行：

```powershell
# 重新構建
npx expo export --platform web

# 重新部署
vercel --prod --yes
```

或直接使用部署腳本：

```powershell
.\deploy-vercel.ps1
```

---

## 🐛 常見問題

### 問題 1：部署後顯示 404

**原因**：`dist` 目錄未正確構建

**解決**：
```powershell
# 重新構建
npx expo export --platform web

# 檢查 dist 目錄
Test-Path dist
```

### 問題 2：API 路由不工作

**原因**：`api/` 目錄結構不正確

**解決**：確保 `api/index.js` 和 `api/health.js` 存在

### 問題 3：DNS 不解析

**原因**：DNS 傳播需要時間

**解決**：
- 等待 5-30 分鐘
- 使用 `nslookup host27o.com` 檢查 DNS 狀態
- 清除 DNS 快取：`ipconfig /flushdns`

### 問題 4：SSL 證書未生效

**原因**：DNS 未正確配置

**解決**：
- 確認 DNS 記錄已正確設置
- 等待 Vercel 自動配置 SSL（通常 1-2 分鐘）
- 在 Vercel Dashboard 檢查域名狀態

---

## 📊 Vercel 優勢

- ✅ **免費 SSL**：自動配置 HTTPS
- ✅ **全球 CDN**：快速載入速度
- ✅ **自動部署**：Git push 自動部署
- ✅ **Serverless**：無需管理伺服器
- ✅ **無限帶寬**：免費方案已足夠

---

## 🎉 完成！

部署完成後，您的應用將在 `https://host27o.com` 上運行！

### 有用的連結

- **Vercel Dashboard**: https://vercel.com/dashboard
- **專案設置**: https://vercel.com/dashboard → 選擇專案 → Settings
- **域名管理**: https://vercel.com/dashboard → 選擇專案 → Settings → Domains
- **部署日誌**: https://vercel.com/dashboard → 選擇專案 → Deployments

---

**祝您部署順利！🎊**


