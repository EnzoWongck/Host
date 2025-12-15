# 🚀 MacBook 快速開始

## ⚡ 立即開始（3 個命令）

```bash
# 1. 進入專案目錄
cd ~/Documents/GitHub/Host

# 2. 安裝依賴（首次使用）
npm install

# 3. 啟動開發服務器
npm run web
```

## 📱 開發模式選項

### Web 開發（最簡單）
```bash
npm run web
```
瀏覽器會自動打開 `http://localhost:8081`

### iOS 模擬器
```bash
npm run ios
```

### Android 模擬器
```bash
npm run android
```

### 互動式選擇
```bash
chmod +x dev.sh
./dev.sh
```

## 🔧 常用命令

| 命令 | 說明 |
|------|------|
| `npm run web` | 啟動 Web 版本 |
| `npm run ios` | 啟動 iOS 模擬器 |
| `npm run android` | 啟動 Android 模擬器 |
| `npm start` | 啟動所有平台（Expo Go） |
| `npm run dev` | 啟動完整開發模式（含 WebSocket） |
| `npm run kill` | 停止 Expo 服務器 |

## 🆘 遇到問題？

### 權限錯誤
```bash
chmod +x *.sh
```

### 端口被佔用
```bash
lsof -ti:8081 | xargs kill -9
```

### 清理緩存
```bash
npm run web:clean
```

## 📚 詳細文檔

- 完整設置指南：`MAC_SETUP.md`
- 專案總覽：`README.md`

---

**提示**：修改代碼後會自動重新載入，無需手動刷新！








