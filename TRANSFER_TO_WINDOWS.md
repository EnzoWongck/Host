# 將專案傳送到 Windows 的方法

## 🚀 推薦方法（按推薦順序）

### 方法 1：使用 Git（最推薦，適合開發者）

如果您使用 Git 版本控制：

**在 macOS 上：**
```bash
# 確保所有更改都已提交
git add .
git commit -m "準備傳送到 Windows"
git push origin main  # 或您的分支名稱
```

**在 Windows 上：**
```bash
git clone [您的倉庫URL]
cd PokerHost
npm install
npm run web
```

**優點：**
- ✅ 保留完整的版本歷史
- ✅ 自動同步更改
- ✅ 最專業的方式

---

### 方法 2：使用雲端儲存服務

#### Google Drive / Dropbox / OneDrive

1. **在 macOS 上：**
   - 將整個 `PokerHost` 資料夾壓縮為 ZIP
   - 上傳到雲端儲存服務

2. **在 Windows 上：**
   - 下載 ZIP 檔案
   - 解壓縮到您想要的位置
   - 打開命令提示符，進入專案資料夾
   - 執行 `npm install`

**注意事項：**
- ⚠️ 不要上傳 `node_modules` 資料夾（太大）
- ⚠️ 確保 `.gitignore` 已正確設置

**快速壓縮命令（排除 node_modules）：**
```bash
cd /Users/kwokheitung/Desktop/Host.2
zip -r PokerHost.zip PokerHost -x "PokerHost/node_modules/*" "PokerHost/.expo/*" "PokerHost/dist/*"
```

---

### 方法 3：使用 USB 隨身碟

1. **在 macOS 上準備：**
   ```bash
   # 進入專案目錄
   cd /Users/kwokheitung/Desktop/Host.2/PokerHost
   
   # 創建一個臨時目錄，排除不需要的檔案
   mkdir -p ../PokerHost-Transfer
   cp -r . ../PokerHost-Transfer/
   
   # 刪除不需要的資料夾
   cd ../PokerHost-Transfer
   rm -rf node_modules .expo dist android/build ios/build
   
   # 壓縮
   cd ..
   zip -r PokerHost-Transfer.zip PokerHost-Transfer
   ```

2. **複製到 USB：**
   - 將 `PokerHost-Transfer.zip` 複製到 USB 隨身碟

3. **在 Windows 上：**
   - 將 ZIP 檔案複製到 Windows 電腦
   - 解壓縮
   - 打開命令提示符，進入專案資料夾
   - 執行 `npm install`

---

### 方法 4：使用網路共享

如果兩台電腦在同一網路：

**在 macOS 上：**
1. 系統偏好設定 → 共享
2. 啟用「檔案共享」
3. 共享 `Desktop/Host.2` 資料夾

**在 Windows 上：**
1. 打開檔案總管
2. 在地址欄輸入：`\\[Mac的IP地址]`
3. 輸入 Mac 的用戶名和密碼
4. 複製 `PokerHost` 資料夾

---

### 方法 5：使用 AirDrop（如果 Windows 支援）

如果您的 Windows 電腦支援 AirDrop 或類似的無線傳輸功能，可以直接傳送。

---

## 📦 需要傳送的檔案清單

### ✅ 必須傳送：
- 所有 `.tsx`, `.ts`, `.js` 檔案
- `package.json`
- `app.json`
- `tsconfig.json`
- `babel.config.js`
- `assets/` 資料夾
- `src/` 資料夾
- `public/` 資料夾（如果存在）
- `README.md` 和其他文檔
- `.git/` 資料夾（如果使用 Git）

### ❌ 不需要傳送（會在 Windows 上重新生成）：
- `node_modules/` - 執行 `npm install` 會重新安裝
- `.expo/` - Expo 快取
- `dist/` - 建置輸出
- `android/build/` - Android 建置檔案
- `ios/build/` - iOS 建置檔案
- `*.log` - 日誌檔案

---

## 🔧 在 Windows 上設置

傳送完成後，在 Windows 上執行：

```cmd
# 1. 進入專案資料夾
cd C:\path\to\PokerHost

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run web
```

或直接雙擊 `start-web.bat`

---

## 💡 快速腳本：準備傳送

我已經為您創建了一個準備傳送的腳本。執行以下命令：

```bash
cd /Users/kwokheitung/Desktop/Host.2/PokerHost
```

然後使用以下任一方法。

---

## 🎯 最簡單的方法總結

**對於大多數用戶，推薦：**

1. **使用 Git**（如果您熟悉 Git）
   - 最專業，最方便後續同步

2. **使用雲端儲存**（最簡單）
   - 壓縮專案（排除 node_modules）
   - 上傳到 Google Drive / Dropbox
   - 在 Windows 上下載並解壓
   - 執行 `npm install`

3. **使用 USB 隨身碟**（離線環境）
   - 壓縮專案
   - 複製到 USB
   - 在 Windows 上解壓並安裝依賴

---

## ⚠️ 注意事項

1. **不要傳送 node_modules**：檔案太大，且在不同平台可能需要重新編譯
2. **檢查 .gitignore**：確保敏感資訊（如 `.env`）不會被傳送
3. **版本兼容性**：確保 Windows 上的 Node.js 版本與 macOS 上的一致（推薦 18.x 或更高）
4. **路徑問題**：Windows 使用反斜線 `\`，但專案中的路徑應該都是相對路徑，不會有問題

---

## 🆘 遇到問題？

如果在 Windows 上遇到問題：
1. 確認 Node.js 已正確安裝：`node --version`
2. 清除快取：`npm run web:clean`
3. 重新安裝依賴：刪除 `node_modules` 和 `package-lock.json`，然後執行 `npm install`

