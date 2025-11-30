# 🌐 DNS 配置指南 - host27o.com

## 📋 前置準備

在配置 DNS 之前，請確保：
- ✅ 已購買 `host27o.com` 域名
- ✅ 已知道域名註冊商（例如：GoDaddy、Namecheap、Cloudflare）
- ✅ 已登入域名註冊商的控制台

---

## 🎯 兩種配置方式

### 方式 A：使用 Vercel Nameserver（推薦 ⭐）

**優點**：
- ✅ 最簡單，只需一步
- ✅ Vercel 自動管理所有 DNS 記錄
- ✅ 自動配置 SSL 證書
- ✅ 無需手動維護 DNS 記錄

**缺點**：
- ⚠️ 無法使用其他 DNS 服務（如 Cloudflare CDN）

---

### 方式 B：手動配置 DNS 記錄

**優點**：
- ✅ 可以同時使用其他 DNS 服務
- ✅ 更靈活的控制

**缺點**：
- ⚠️ 需要手動配置每個記錄
- ⚠️ 需要手動更新（如果 Vercel IP 變更）

---

## 🚀 方式 A：使用 Vercel Nameserver（推薦）

### 步驟 1：在 Vercel 獲取 Nameserver

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇專案 `host27o`
3. 點擊 **Settings** > **Domains**
4. 點擊 **Add** 添加 `host27o.com`
5. 選擇 **"Use Vercel DNS"** 選項
6. 複製顯示的 Nameserver 地址，例如：
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

### 步驟 2：在域名註冊商更新 Nameserver

#### GoDaddy

1. 登入 [GoDaddy](https://www.godaddy.com)
2. 點擊 **My Products** > **Domains**
3. 找到 `host27o.com`，點擊 **DNS** 或 **Manage DNS**
4. 找到 **Nameservers** 部分
5. 選擇 **"Custom"** 或 **"Change"**
6. 刪除現有的 Nameserver
7. 添加 Vercel 提供的 Nameserver：
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
8. 點擊 **Save** 保存

#### Namecheap

1. 登入 [Namecheap](https://www.namecheap.com)
2. 前往 **Domain List**
3. 找到 `host27o.com`，點擊 **Manage**
4. 在 **Nameservers** 部分選擇 **"Custom DNS"**
5. 輸入 Vercel 提供的 Nameserver：
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
6. 點擊 **✓** 保存

#### Cloudflare

1. 登入 [Cloudflare](https://dash.cloudflare.com)
2. 選擇域名 `host27o.com`
3. 前往 **DNS** > **Nameservers**
4. 點擊 **Change**
5. 選擇 **"Custom nameservers"**
6. 輸入 Vercel 提供的 Nameserver
7. 點擊 **Save**

#### 其他註冊商

一般步驟：
1. 找到 **DNS 設置** 或 **Nameserver 設置**
2. 將 Nameserver 改為 Vercel 提供的地址
3. 保存更改

### 步驟 3：等待 DNS 傳播

- ⏱️ **通常需要**：5-30 分鐘
- ⏱️ **最多可能需要**：24-48 小時（極少見）

### 步驟 4：驗證配置

等待 10-15 分鐘後，檢查 DNS 是否已更新：

```powershell
# Windows PowerShell
nslookup host27o.com

# 或使用在線工具
# https://www.whatsmydns.net/#NS/host27o.com
```

如果看到 Vercel 的 Nameserver，表示配置成功！

---

## 🔧 方式 B：手動配置 DNS 記錄

### 步驟 1：在 Vercel 添加域名

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇專案 `host27o`
3. 點擊 **Settings** > **Domains**
4. 點擊 **Add** 添加 `host27o.com` 和 `www.host27o.com`
5. 選擇 **"Use existing DNS"** 或 **"Configure manually"**

### 步驟 2：獲取 Vercel DNS 記錄

Vercel 會顯示需要添加的 DNS 記錄，通常包括：

#### 對於根域名 (host27o.com)
```
類型：A
名稱：@ 或 (空白)
值：76.76.21.21
TTL：3600（或自動）
```

#### 對於 www 子域名 (www.host27o.com)
```
類型：CNAME
名稱：www
值：cname.vercel-dns.com
TTL：3600（或自動）
```

### 步驟 3：在域名註冊商添加記錄

#### GoDaddy

1. 登入 [GoDaddy](https://www.godaddy.com)
2. 點擊 **My Products** > **Domains**
3. 找到 `host27o.com`，點擊 **DNS** 或 **Manage DNS**
4. 在 **Records** 部分，點擊 **Add**
5. 添加 A 記錄：
   - **Type**: A
   - **Name**: @
   - **Value**: 76.76.21.21
   - **TTL**: 600（或預設值）
6. 點擊 **Save**
7. 添加 CNAME 記錄：
   - **Type**: CNAME
   - **Name**: www
   - **Value**: cname.vercel-dns.com
   - **TTL**: 600（或預設值）
8. 點擊 **Save**

#### Namecheap

1. 登入 [Namecheap](https://www.namecheap.com)
2. 前往 **Domain List**
3. 找到 `host27o.com`，點擊 **Manage**
4. 前往 **Advanced DNS** 標籤
5. 在 **Host Records** 部分，點擊 **Add New Record**
6. 添加 A 記錄：
   - **Type**: A Record
   - **Host**: @
   - **Value**: 76.76.21.21
   - **TTL**: Automatic
7. 點擊 **✓** 保存
8. 添加 CNAME 記錄：
   - **Type**: CNAME Record
   - **Host**: www
   - **Value**: cname.vercel-dns.com
   - **TTL**: Automatic
9. 點擊 **✓** 保存

#### Cloudflare

1. 登入 [Cloudflare](https://dash.cloudflare.com)
2. 選擇域名 `host27o.com`
3. 前往 **DNS** > **Records**
4. 點擊 **Add record**
5. 添加 A 記錄：
   - **Type**: A
   - **Name**: @
   - **IPv4 address**: 76.76.21.21
   - **Proxy status**: DNS only（關閉代理，顯示灰色雲朵）
   - **TTL**: Auto
6. 點擊 **Save**
7. 添加 CNAME 記錄：
   - **Type**: CNAME
   - **Name**: www
   - **Target**: cname.vercel-dns.com
   - **Proxy status**: DNS only（關閉代理）
   - **TTL**: Auto
8. 點擊 **Save**

#### 其他註冊商

一般步驟：
1. 找到 **DNS 管理** 或 **DNS 記錄** 頁面
2. 添加 A 記錄：`@` → `76.76.21.21`
3. 添加 CNAME 記錄：`www` → `cname.vercel-dns.com`
4. 保存更改

### 步驟 4：等待 DNS 傳播

- ⏱️ **通常需要**：5-30 分鐘
- ⏱️ **最多可能需要**：24-48 小時

### 步驟 5：驗證配置

等待 10-15 分鐘後，檢查 DNS 記錄：

```powershell
# 檢查 A 記錄
nslookup host27o.com

# 檢查 CNAME 記錄
nslookup www.host27o.com

# 或使用在線工具
# https://www.whatsmydns.net/#A/host27o.com
```

---

## ✅ 驗證 DNS 配置

### 方法 1：使用 nslookup（Windows）

```powershell
# 檢查根域名
nslookup host27o.com

# 檢查 www 子域名
nslookup www.host27o.com

# 檢查 Nameserver（如果使用方式 A）
nslookup -type=NS host27o.com
```

### 方法 2：使用在線工具

- **What's My DNS**: https://www.whatsmydns.net
- **DNS Checker**: https://dnschecker.org
- **MXToolbox**: https://mxtoolbox.com/DNSLookup.aspx

### 方法 3：在 Vercel Dashboard 檢查

1. 前往 Vercel Dashboard
2. 選擇專案 > Settings > Domains
3. 查看域名狀態：
   - ✅ **Valid Configuration** - DNS 配置正確
   - ⚠️ **Pending** - 等待 DNS 傳播
   - ❌ **Invalid Configuration** - 需要檢查 DNS 記錄

---

## 🔍 常見問題

### 問題 1：DNS 記錄已添加，但 Vercel 顯示 "Invalid Configuration"

**可能原因**：
- DNS 記錄尚未傳播
- 記錄值輸入錯誤
- TTL 設置過長

**解決方法**：
1. 等待 10-30 分鐘
2. 檢查記錄值是否正確
3. 將 TTL 設置為較小值（如 600）

### 問題 2：使用 Cloudflare 時，網站無法訪問

**原因**：Cloudflare 代理（橙色雲朵）可能與 Vercel 衝突

**解決方法**：
1. 在 Cloudflare DNS 記錄中，點擊雲朵圖標
2. 確保顯示為 **灰色雲朵**（DNS only）
3. 不要使用 **橙色雲朵**（Proxied）

### 問題 3：DNS 傳播時間過長

**原因**：DNS 快取或 TTL 設置過長

**解決方法**：
1. 清除本地 DNS 快取：
   ```powershell
   ipconfig /flushdns
   ```
2. 使用不同的 DNS 服務器測試（如 8.8.8.8）
3. 等待 TTL 時間過期

### 問題 4：www 子域名無法訪問

**原因**：CNAME 記錄未正確配置

**解決方法**：
1. 確認 CNAME 記錄存在
2. 確認值為 `cname.vercel-dns.com`
3. 在 Vercel 中確保已添加 `www.host27o.com` 域名

---

## 📊 DNS 記錄說明

### A 記錄
- **用途**：將域名指向 IP 地址
- **用於**：根域名（host27o.com）
- **值**：`76.76.21.21`（Vercel 的 IP）

### CNAME 記錄
- **用途**：將子域名指向另一個域名
- **用於**：www 子域名（www.host27o.com）
- **值**：`cname.vercel-dns.com`

### TTL（Time To Live）
- **建議值**：600 秒（10 分鐘）或自動
- **作用**：控制 DNS 記錄的快取時間
- **較小值**：更新更快，但查詢次數增加
- **較大值**：查詢次數減少，但更新較慢

---

## 🎉 完成！

DNS 配置完成後：

1. ✅ 等待 5-30 分鐘讓 DNS 傳播
2. ✅ Vercel 會自動配置 SSL 證書（1-2 分鐘）
3. ✅ 訪問 `https://host27o.com` 測試網站
4. ✅ 訪問 `https://www.host27o.com` 測試 www 子域名

---

## 📞 需要幫助？

如果遇到問題：
1. 檢查 [Vercel DNS 文檔](https://vercel.com/docs/concepts/projects/domains)
2. 聯繫域名註冊商客服
3. 在 Vercel Dashboard 查看域名狀態和錯誤訊息

**祝配置順利！🎊**


