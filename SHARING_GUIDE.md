# 📤 專案分享指南

## ✅ 可以分享的內容

您的專案可以安全分享，但需要注意以下事項：

---

## ⚠️ 分享前檢查清單

### 1. **敏感資訊檢查**

#### ✅ 已安全（可以分享）
- **Firebase API Key**: `<YOUR_FIREBASE_WEB_API_KEY>`
  - 請在 Firebase Console 中取得實際的 Web API key，**不要在公開文件或程式碼庫中寫出完整值**
  - 可以分享此應用程式，但務必在 Firebase Console 設置適當的安全規則（網域限制、API 限制）

- **Google OAuth Client IDs**: 
  - 這些是公開的 Client ID，可以分享
  - 但建議在 Google Cloud Console 設置授權域限制

#### ⚠️ 需要注意
- **Firebase Project ID**: `host-7b3ce`
  - 這是公開的，但建議確認 Firebase 安全規則已正確設置

- **package.json**: 標記為 `"private": true`
  - 如果分享到 npm，需要移除或改為 `false`

### 2. **已排除的敏感文件**

`.gitignore` 已正確排除：
- `.env` 文件（環境變數）
- `.env.local` 文件
- `node_modules/`（依賴包）
- 構建文件（`dist/`, `build/`）
- 密鑰文件（`.keystore`, `.p8`, `.p12`）

---

## 🚀 分享方式

### 方式 1：GitHub（推薦）

#### 步驟：

1. **檢查敏感資訊**
   ```bash
   # 確認沒有提交敏感文件
   git status
   ```

2. **創建 .env.example 文件**（如果使用環境變數）
   ```bash
   # 創建範例文件
   echo "FIREBASE_API_KEY=your_api_key_here" > .env.example
   ```

3. **推送到 GitHub**
   ```bash
   git add .
   git commit -m "準備分享專案"
   git push origin main
   ```

4. **設置 GitHub Repository**
   - 前往 GitHub 創建新 Repository
   - 或使用現有的 Repository: `EnzoWongck/Host`

#### 分享連結格式：
```
https://github.com/EnzoWongck/Host
```

---

### 方式 2：壓縮檔案分享

#### 步驟：

1. **創建分享包**
   ```bash
   # 排除 node_modules 和構建文件
   tar -czf host27o-project.tar.gz \
     --exclude='node_modules' \
     --exclude='dist' \
     --exclude='.expo' \
     --exclude='.env*' \
     --exclude='.git' \
     .
   ```

2. **或使用 PowerShell（Windows）**
   ```powershell
   # 創建壓縮檔（排除不需要的文件）
   Compress-Archive -Path * -DestinationPath host27o-project.zip \
     -Exclude node_modules,dist,.expo,.env*,.git
   ```

---

### 方式 3：部署連結分享

#### 已部署的連結：

- **Firebase Hosting**: `https://host-7b3ce.web.app`
- **自定義域名**: `https://host27o.com`（配置完成後）

#### 分享部署連結：
```
訪問：https://host27o.com
```

---

## 📝 分享時應包含的資訊

### README.md 更新建議

在分享時，建議更新 README.md 包含：

1. **專案描述**
2. **安裝步驟**
3. **環境變數設置**（如果需要）
4. **Firebase 配置說明**
5. **授權資訊**

### 範例 README 片段：

```markdown
## 🔧 環境設置

### Firebase 配置

1. 創建 Firebase 專案
2. 複製 Firebase 配置到 `src/config/firebase.ts`
3. 在 Firebase Console 設置 Authentication

### 環境變數（可選）

創建 `.env.local` 文件：
```
FIREBASE_API_KEY=your_api_key
```

## 📄 授權

此專案採用 MIT 授權。
```

---

## 🔒 安全建議

### 1. **Firebase 安全規則**

在分享前，確認 Firebase 安全規則：

```javascript
// Firestore 規則範例
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. **Google OAuth 設置**

在 Google Cloud Console：
- 設置授權的 JavaScript 來源
- 限制授權的重新導向 URI
- 只允許特定域名使用

### 3. **移除調試資訊**

檢查代碼中是否有：
- 硬編碼的測試帳號
- 調試用的 API Key
- 臨時密碼或 Token

---

## 📦 分享包內容建議

### 應該包含：
- ✅ 所有源代碼（`src/`）
- ✅ 配置文件（`package.json`, `tsconfig.json`, `app.json`）
- ✅ 資源文件（`assets/`）
- ✅ 文檔（`README.md`, `*.md`）
- ✅ `.gitignore`

### 不應該包含：
- ❌ `node_modules/`（讓使用者自行安裝）
- ❌ `.env` 文件（敏感資訊）
- ❌ 構建文件（`dist/`, `build/`）
- ❌ `.git/`（如果分享壓縮檔）
- ❌ 個人資料或測試資料

---

## 🎯 分享場景

### 場景 1：開源分享（GitHub Public）

**步驟**：
1. 確認所有敏感資訊已移除或替換
2. 更新 README.md 包含完整說明
3. 設置適當的 License（如 MIT）
4. 推送到 GitHub 並設為 Public

**優點**：
- 其他人可以 Fork 和貢獻
- 可以獲得 Stars 和關注
- 建立專案聲譽

### 場景 2：私有分享（GitHub Private）

**步驟**：
1. 推送到 GitHub
2. 設置 Repository 為 Private
3. 邀請特定用戶為 Collaborator

**優點**：
- 控制誰可以訪問
- 保護專案代碼
- 仍可使用 Git 版本控制

### 場景 3：團隊協作

**步驟**：
1. 使用 GitHub Organization
2. 創建 Private Repository
3. 邀請團隊成員

**優點**：
- 團隊協作
- 版本控制
- Issue 和 Pull Request 管理

---

## 🔍 分享前最後檢查

### 檢查命令：

```bash
# 1. 檢查是否有未提交的敏感文件
git status

# 2. 檢查 .gitignore 是否正確
cat .gitignore

# 3. 檢查是否有硬編碼的敏感資訊
grep -r "password\|secret\|token" src/ --ignore-case

# 4. 檢查 package.json 中的 private 設置
grep "private" package.json
```

---

## 📋 分享清單

在分享前，確認：

- [ ] 已檢查所有敏感資訊
- [ ] `.gitignore` 已正確設置
- [ ] `README.md` 已更新
- [ ] Firebase 安全規則已設置
- [ ] 沒有硬編碼的測試資料
- [ ] License 文件已添加（如需要）
- [ ] 文檔完整且清晰

---

## 🎉 分享後

### 建議添加：

1. **Contributing Guidelines** (`CONTRIBUTING.md`)
2. **Code of Conduct** (`CODE_OF_CONDUCT.md`)
3. **Issue Templates** (GitHub)
4. **Pull Request Templates** (GitHub)

---

## 📞 需要幫助？

如果分享時遇到問題：
1. 檢查 Git 狀態
2. 確認 Firebase 配置
3. 檢查環境變數設置
4. 查看錯誤日誌

**祝分享順利！🎊**

