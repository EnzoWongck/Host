#!/bin/bash

# 準備專案傳送到 Windows 的腳本
# 此腳本會創建一個乾淨的專案副本，排除不需要的檔案

echo "📦 準備專案傳送到 Windows..."
echo ""

# 獲取當前目錄
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR"
PARENT_DIR="$(dirname "$PROJECT_DIR")"
TRANSFER_DIR="$PARENT_DIR/PokerHost-Transfer"
ZIP_FILE="$PARENT_DIR/PokerHost-Transfer.zip"

# 清理舊的傳送目錄
if [ -d "$TRANSFER_DIR" ]; then
    echo "🗑️  刪除舊的傳送目錄..."
    rm -rf "$TRANSFER_DIR"
fi

if [ -f "$ZIP_FILE" ]; then
    echo "🗑️  刪除舊的 ZIP 檔案..."
    rm -f "$ZIP_FILE"
fi

# 創建新的傳送目錄
echo "📁 創建傳送目錄..."
mkdir -p "$TRANSFER_DIR"

# 複製專案檔案（排除不需要的）
echo "📋 複製專案檔案..."
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.expo' \
    --exclude 'dist' \
    --exclude 'web-build' \
    --exclude 'android/build' \
    --exclude 'ios/build' \
    --exclude '.DS_Store' \
    --exclude '*.log' \
    --exclude '.git' \
    "$PROJECT_DIR/" "$TRANSFER_DIR/"

# 創建 ZIP 檔案
echo ""
echo "📦 創建 ZIP 檔案..."
cd "$PARENT_DIR"
zip -r "PokerHost-Transfer.zip" "PokerHost-Transfer" -x "*.DS_Store"

# 顯示結果
echo ""
echo "✅ 完成！"
echo ""
echo "📂 傳送檔案位置："
echo "   $ZIP_FILE"
echo ""
echo "📊 檔案大小："
du -h "$ZIP_FILE" | cut -f1
echo ""
echo "🚀 下一步："
echo "   1. 將 ZIP 檔案上傳到雲端或複製到 USB"
echo "   2. 在 Windows 上下載並解壓縮"
echo "   3. 進入專案資料夾，執行：npm install"
echo "   4. 執行：npm run web"
echo ""

