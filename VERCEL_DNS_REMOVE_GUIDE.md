# 🗑️ 在 Vercel 移除 A 記錄指南

## 📍 當前狀態

您的域名 `host27o.com` 使用 **Vercel DNS**（Nameserver: `ns1.vercel-dns.com`）

**需要移除的 A 記錄：**
- `host27o.com` → `216.198.79.1`
- `host27o.com` → `216.198.79.65`

---

## 🚀 步驟：在 Vercel Dashboard 移除 A 記錄

### 步驟 1：登入 Vercel Dashboard

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 使用您的帳號登入

### 步驟 2：進入域名設置

1. 在 Dashboard 中，選擇專案 **host27o**（或您的專案名稱）
2. 點擊 **Settings**（設置）
3. 在左側選單中，點擊 **Domains**（域名）

### 步驟 3：查看 DNS 記錄

1. 找到域名 `host27o.com`
2. 點擊域名旁邊的 **...**（三個點）或 **Manage**（管理）
3. 選擇 **DNS Records**（DNS 記錄）或 **DNS Configuration**（DNS 配置）

### 步驟 4：移除 A 記錄

1. 在 DNS 記錄列表中，找到以下 A 記錄：
   - `host27o.com` → `216.198.79.1`
   - `host27o.com` → `216.198.79.65`
2. 點擊每個記錄旁邊的 **刪除** 圖標（垃圾桶 🗑️）或 **Remove**（移除）
3. 確認刪除

### 步驟 5：保存更改

1. 點擊 **Save**（保存）或更改會自動保存
2. 等待 5-10 分鐘讓 DNS 傳播

---

## 🔍 替代方法：如果找不到 DNS 記錄設置

### 方法 A：通過專案設置

1. 前往 **Settings** > **Domains**
2. 點擊 `host27o.com` 域名
3. 查看 **DNS Records** 部分
4. 移除相關的 A 記錄

### 方法 B：通過域名管理頁面

1. 在 **Domains** 頁面，點擊 `host27o.com`
2. 如果看到 **DNS Configuration** 或 **DNS Records** 選項卡，點擊它
3. 找到並刪除 A 記錄

### 方法 C：如果使用外部 DNS 供應商

如果您的域名實際上使用的是外部 DNS 供應商（如 GoDaddy、Namecheap），那麼：

1. **登入您的 DNS 供應商**（不是 Vercel）
2. 找到 **DNS 管理** 或 **DNS 記錄** 頁面
3. 刪除以下 A 記錄：
   - `host27o.com` → `216.198.79.1`
   - `host27o.com` → `216.198.79.65`

---

## ✅ 驗證記錄已移除

等待 5-10 分鐘後，檢查 DNS 記錄：

```powershell
# Windows PowerShell
nslookup host27o.com
```

如果記錄已移除，您應該看不到 `216.198.79.1` 和 `216.198.79.65` 這兩個 IP 地址。

---

## 🔄 下一步：配置 Firebase DNS

移除 A 記錄後：

1. 返回 [Firebase Console](https://console.firebase.google.com/)
2. 前往 **Hosting** > **添加自定義域**
3. Firebase 會檢測到記錄已移除
4. 按照 Firebase 的指示添加新的 DNS 記錄

---

## 📞 需要幫助？

如果無法在 Vercel Dashboard 找到 DNS 記錄設置：

1. **檢查域名註冊商**：A 記錄可能在域名註冊商處（如 GoDaddy、Namecheap）
2. **聯繫 Vercel 支援**：如果確定使用 Vercel DNS 但找不到設置
3. **查看 Vercel 文檔**：[Vercel DNS 文檔](https://vercel.com/docs/concepts/projects/domains/dns)

---

## 🎯 快速檢查清單

- [ ] 登入 Vercel Dashboard
- [ ] 前往 Settings > Domains
- [ ] 找到 `host27o.com` 的 DNS 記錄
- [ ] 移除 `216.198.79.1` 的 A 記錄
- [ ] 移除 `216.198.79.65` 的 A 記錄
- [ ] 等待 5-10 分鐘
- [ ] 驗證記錄已移除
- [ ] 返回 Firebase Console 繼續配置

**完成後，告訴我，我會協助您完成 Firebase 的 DNS 配置！** 🚀

