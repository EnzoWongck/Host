# 設置 Git 遠端倉庫指南

## 🎯 目標
設置 GitHub 遠端倉庫，以便在 macOS 和 Windows 之間同步專案。

---

## 📋 步驟 1：創建 GitHub 倉庫

### 方法 A：在 GitHub 網站上創建（推薦）

1. **登入 GitHub**
   - 訪問 [https://github.com](https://github.com)
   - 登入您的帳號（如果沒有，先註冊）

2. **創建新倉庫**
   - 點擊右上角的 `+` 號
   - 選擇 "New repository"
   - 填寫資訊：
     - **Repository name**: `PokerHost`（或您喜歡的名稱）
     - **Description**: `專業的撲克牌局管理應用程式`
     - **Visibility**: 
       - ✅ **Private**（推薦，如果不想公開）
       - 或 **Public**（如果想公開）
     - ⚠️ **不要**勾選 "Initialize with README"（因為我們已經有專案了）
   - 點擊 "Create repository"

3. **複製倉庫 URL**
   - 創建後，GitHub 會顯示倉庫 URL
   - 複製 HTTPS URL，例如：
     ```
     https://github.com/您的用戶名/PokerHost.git
     ```

---

## 📋 步驟 2：連接本地倉庫到 GitHub

### 在 macOS 上執行以下命令：

```bash
# 1. 添加遠端倉庫（替換為您的實際 URL）
git remote add origin https://github.com/您的用戶名/PokerHost.git

# 2. 驗證遠端倉庫已添加
git remote -v

# 3. 推送代碼到 GitHub
git push -u origin main
```

**如果遇到認證問題：**
- GitHub 現在使用 Personal Access Token 而不是密碼
- 需要創建 Token：Settings → Developer settings → Personal access tokens → Tokens (classic)
- 或使用 GitHub CLI：`gh auth login`

---

## 📋 步驟 3：在 Windows 上克隆倉庫

在 Windows 上：

```cmd
# 1. 打開命令提示符或 PowerShell
# 2. 進入您想要放置專案的目錄
cd C:\Users\您的用戶名\Documents

# 3. 克隆倉庫
git clone https://github.com/您的用戶名/PokerHost.git

# 4. 進入專案目錄
cd PokerHost

# 5. 安裝依賴
npm install

# 6. 啟動開發伺服器
npm run web
```

---

## 🔄 日常同步流程

### 在 Windows 上編輯後：

```cmd
# 1. 查看更改
git status

# 2. 添加更改
git add .

# 3. 提交更改
git commit -m "描述您的更改"

# 4. 推送到 GitHub
git push
```

### 在 macOS 上獲取更新：

```bash
# 1. 拉取最新更改
git pull

# 2. 如果需要，安裝新的依賴
npm install
```

### 在 macOS 上編輯後：

```bash
# 1. 添加更改
git add .

# 2. 提交更改
git commit -m "描述您的更改"

# 3. 推送到 GitHub
git push
```

### 在 Windows 上獲取更新：

```cmd
git pull
npm install  # 如果有新的依賴
```

---

## 🔐 GitHub 認證設置

### 方法 1：使用 Personal Access Token（推薦）

1. **創建 Token：**
   - GitHub → Settings → Developer settings
   - Personal access tokens → Tokens (classic)
   - Generate new token (classic)
   - 選擇權限：至少勾選 `repo`
   - 生成並複製 Token（只顯示一次！）

2. **使用 Token：**
   ```bash
   git push
   # 用戶名：您的 GitHub 用戶名
   # 密碼：貼上您的 Token（不是 GitHub 密碼）
   ```

### 方法 2：使用 SSH（進階）

1. **生成 SSH 金鑰：**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **複製公鑰：**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. **添加到 GitHub：**
   - Settings → SSH and GPG keys → New SSH key
   - 貼上公鑰

4. **使用 SSH URL：**
   ```bash
   git remote set-url origin git@github.com:您的用戶名/PokerHost.git
   ```

### 方法 3：使用 GitHub CLI（最簡單）

```bash
# 安裝 GitHub CLI
# macOS: brew install gh
# Windows: winget install GitHub.cli

# 登入
gh auth login

# 自動設置認證
```

---

## ✅ 驗證設置

### 檢查遠端倉庫：

```bash
git remote -v
```

應該顯示：
```
origin  https://github.com/您的用戶名/PokerHost.git (fetch)
origin  https://github.com/您的用戶名/PokerHost.git (push)
```

### 測試推送：

```bash
# 做一個小更改
echo "# Test" >> test.txt
git add test.txt
git commit -m "測試推送"
git push

# 在 GitHub 上檢查是否看到更改
# 然後刪除測試檔案
git rm test.txt
git commit -m "刪除測試檔案"
git push
```

---

## 🆘 常見問題

### 問題 1：推送時要求認證

**解決方案：**
- 使用 Personal Access Token 而不是密碼
- 或設置 SSH 金鑰

### 問題 2：權限被拒絕

**解決方案：**
```bash
# 檢查遠端 URL
git remote -v

# 如果 URL 錯誤，更新它
git remote set-url origin https://github.com/您的用戶名/PokerHost.git
```

### 問題 3：分支名稱不同

**解決方案：**
```bash
# 如果您的分支是 master 而不是 main
git branch -M main
git push -u origin main
```

### 問題 4：有未提交的更改

**解決方案：**
```bash
# 查看未提交的更改
git status

# 提交或暫存
git add .
git commit -m "提交更改"
```

---

## 📚 下一步

設置完成後，您可以：
1. ✅ 在兩個平台之間自由同步
2. ✅ 保留完整的版本歷史
3. ✅ 隨時回退到舊版本
4. ✅ 與他人協作（如果設置為 Public）

**開始使用：**
- 查看 [SYNC_BETWEEN_PLATFORMS.md](./SYNC_BETWEEN_PLATFORMS.md) 了解日常同步流程

---

## 💡 提示

- **頻繁提交**：完成一個功能就提交，不要累積太多更改
- **描述性提交訊息**：清楚描述您做了什麼
- **開始工作前先拉取**：`git pull` 獲取最新更改
- **推送前檢查**：`git status` 確保沒有遺漏

祝您開發愉快！🎉


