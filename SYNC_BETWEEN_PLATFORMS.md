# 在 macOS 和 Windows 之間同步專案

## ⚠️ 重要：版本不會自動更新！

**答案：不會自動更新**。您需要手動同步更改。

---

## 🔄 同步方法

### 方法 1：使用 Git（強烈推薦）✅

這是最佳方式，可以自動同步並保留版本歷史。

#### 設置 Git 倉庫（如果還沒有）

**在 macOS 上：**
```bash
cd /Users/kwokheitung/Desktop/Host.2/PokerHost

# 初始化 Git（如果還沒有）
git init

# 添加所有檔案
git add .

# 提交
git commit -m "初始提交"

# 創建 GitHub/GitLab 倉庫，然後：
git remote add origin [您的倉庫URL]
git push -u origin main
```

**在 Windows 上：**
```cmd
# 克隆倉庫
git clone [您的倉庫URL]
cd PokerHost
npm install
npm run web
```

#### 日常同步流程

**在 Windows 上編輯後：**
```cmd
git add .
git commit -m "在 Windows 上的更改"
git push
```

**在 macOS 上獲取更新：**
```bash
git pull
```

**在 macOS 上編輯後：**
```bash
git add .
git commit -m "在 macOS 上的更改"
git push
```

**在 Windows 上獲取更新：**
```cmd
git pull
```

**優點：**
- ✅ 自動同步
- ✅ 保留完整歷史
- ✅ 可以回退到舊版本
- ✅ 解決衝突
- ✅ 專業開發標準

---

### 方法 2：使用雲端同步（Dropbox / OneDrive / Google Drive）

#### 設置

1. **在 macOS 上：**
   - 將專案資料夾放在雲端同步資料夾中
   - 例如：`~/Dropbox/PokerHost` 或 `~/OneDrive/PokerHost`

2. **在 Windows 上：**
   - 安裝相同的雲端服務
   - 專案會自動同步

#### 注意事項

⚠️ **重要限制：**
- ❌ `node_modules` 太大，不建議同步
- ❌ 可能導致衝突
- ❌ 同步速度慢

**解決方案：**
- 在 `.gitignore` 中排除 `node_modules`
- 每次切換平台時執行 `npm install`

---

### 方法 3：手動同步（不推薦）

如果您只是複製檔案，需要手動同步：

#### 從 Windows 同步到 macOS

1. **在 Windows 上：**
   - 壓縮修改過的檔案
   - 上傳到雲端或複製到 USB

2. **在 macOS 上：**
   - 下載並解壓
   - 手動替換檔案
   - 執行 `npm install`（如果需要）

#### 從 macOS 同步到 Windows

1. **在 macOS 上：**
   ```bash
   ./prepare-transfer.sh
   ```
   - 上傳 `PokerHost-Transfer.zip` 到雲端

2. **在 Windows 上：**
   - 下載 ZIP
   - 解壓並替換檔案
   - 執行 `npm install`

**缺點：**
- ❌ 容易遺漏檔案
- ❌ 可能覆蓋未保存的更改
- ❌ 沒有版本歷史
- ❌ 容易出錯

---

## 📋 推薦工作流程

### 使用 Git 的完整流程

#### 第一次設置

**在 macOS 上：**
```bash
# 1. 初始化 Git（如果還沒有）
git init
git add .
git commit -m "初始專案"

# 2. 創建遠端倉庫（GitHub/GitLab）
# 在 GitHub 上創建新倉庫，然後：
git remote add origin https://github.com/您的用戶名/PokerHost.git
git branch -M main
git push -u origin main
```

**在 Windows 上：**
```cmd
# 克隆專案
git clone https://github.com/您的用戶名/PokerHost.git
cd PokerHost
npm install
npm run web
```

#### 日常開發流程

**開始工作前（兩個平台都適用）：**
```bash
git pull  # 獲取最新更改
```

**完成工作後：**
```bash
git add .
git commit -m "描述您的更改"
git push
```

**切換平台前：**
```bash
# 確保所有更改都已提交和推送
git status  # 檢查是否有未提交的更改
git push    # 確保已推送到遠端
```

---

## 🔍 檢查同步狀態

### 檢查是否有未同步的更改

**在 macOS 上：**
```bash
git status
git log origin/main..HEAD  # 查看未推送的提交
```

**在 Windows 上：**
```cmd
git status
git log origin/main..HEAD
```

### 檢查遠端是否有新更改

```bash
git fetch
git log HEAD..origin/main  # 查看未拉取的提交
```

---

## ⚠️ 避免衝突的最佳實踐

1. **每次開始工作前先拉取：**
   ```bash
   git pull
   ```

2. **頻繁提交：**
   - 完成一個功能就提交
   - 不要累積太多更改

3. **使用分支（進階）：**
   ```bash
   git checkout -b feature/新功能
   # 開發...
   git commit -m "新功能"
   git push origin feature/新功能
   ```

4. **解決衝突：**
   - 如果出現衝突，Git 會標記
   - 手動解決衝突後：
     ```bash
     git add .
     git commit -m "解決衝突"
     ```

---

## 🎯 快速參考

### Git 基本命令

```bash
# 查看狀態
git status

# 添加更改
git add .

# 提交
git commit -m "描述"

# 推送到遠端
git push

# 從遠端拉取
git pull

# 查看歷史
git log

# 查看差異
git diff
```

---

## 💡 建議

**強烈建議使用 Git**，因為：
1. ✅ 自動同步
2. ✅ 版本控制
3. ✅ 可以回退
4. ✅ 專業標準
5. ✅ 免費（GitHub/GitLab）

**如果不想使用 Git：**
- 使用雲端同步（但排除 `node_modules`）
- 或手動同步（但容易出錯）

---

## 🆘 遇到問題？

### 問題：合併衝突

```bash
# 查看衝突檔案
git status

# 手動編輯衝突檔案，然後：
git add .
git commit -m "解決衝突"
```

### 問題：忘記拉取，本地有更改

```bash
# 先保存本地更改
git stash

# 拉取遠端更改
git pull

# 恢復本地更改
git stash pop

# 解決可能的衝突
```

### 問題：想要放棄本地更改

```bash
# 謹慎使用！會丟失本地更改
git reset --hard origin/main
```

---

**總結：使用 Git 是最佳選擇，可以確保兩個平台之間的版本同步！** 🎉

