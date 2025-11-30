# ⚡ DNS 快速配置指南

## 🎯 最簡單方法：使用 Vercel Nameserver

### 步驟 1：在 Vercel 獲取 Nameserver

1. 前往 https://vercel.com/dashboard
2. 選擇專案 → Settings → Domains
3. 添加 `host27o.com`
4. 選擇 **"Use Vercel DNS"**
5. 複製 Nameserver 地址（例如：`ns1.vercel-dns.com`）

### 步驟 2：在域名註冊商更新

#### GoDaddy
1. 登入 → My Products → Domains
2. 找到 `host27o.com` → 點擊 **DNS**
3. 找到 **Nameservers** → 選擇 **Custom**
4. 刪除舊的，添加 Vercel 的 Nameserver
5. 保存

#### Namecheap
1. 登入 → Domain List → 找到域名 → Manage
2. **Nameservers** → 選擇 **Custom DNS**
3. 輸入 Vercel Nameserver
4. 保存

### 步驟 3：等待 5-30 分鐘

完成！Vercel 會自動處理所有 DNS 記錄和 SSL 證書。

---

## 🔧 手動配置（如果需要）

### 在域名註冊商添加以下記錄：

```
A 記錄：
名稱：@
值：76.76.21.21

CNAME 記錄：
名稱：www
值：cname.vercel-dns.com
```

---

## ✅ 驗證

等待 10 分鐘後：

```powershell
nslookup host27o.com
```

或訪問：https://host27o.com

---

**詳細指南請查看：DNS_SETUP_GUIDE.md**


