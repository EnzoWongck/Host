#!/bin/bash

# MacBook 快速設置腳本
# 自動設置專案環境並安裝依賴

echo "🍎 MacBook 設置腳本"
echo "===================="
echo ""

# 獲取腳本所在目錄（專案根目錄）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 檢查 Node.js
echo "📦 檢查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js，請先安裝："
    echo "   brew install node"
    echo "   或從 https://nodejs.org/ 下載"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"

# 檢查 npm
echo "📦 檢查 npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ 未找到 npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm 版本: $NPM_VERSION"

# 檢查並安裝依賴
echo ""
echo "📦 檢查專案依賴..."
if [ ! -d "node_modules" ]; then
    echo "正在安裝依賴（這可能需要幾分鐘）..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依賴安裝失敗"
        exit 1
    fi
    echo "✅ 依賴安裝完成"
else
    echo "✅ 依賴已存在"
fi

# 給腳本添加執行權限
echo ""
echo "🔧 設置腳本權限..."
chmod +x *.sh 2>/dev/null
echo "✅ 腳本權限設置完成"

# 檢查 Expo
echo ""
echo "📱 檢查 Expo..."
if ! command -v expo &> /dev/null && ! npx expo --version &> /dev/null; then
    echo "⚠️  Expo CLI 未全局安裝（這不影響使用）"
else
    EXPO_VERSION=$(npx expo --version 2>/dev/null || echo "已安裝")
    echo "✅ Expo: $EXPO_VERSION"
fi

echo ""
echo "🎉 設置完成！"
echo ""
echo "📚 下一步："
echo "   1. 查看設置指南: cat MAC_SETUP.md"
echo "   2. 啟動開發服務器: ./dev.sh"
echo "   3. 或直接啟動 Web: npm run web"
echo ""
echo "💡 提示："
echo "   - 使用 ./dev.sh 可以選擇開發平台"
echo "   - 使用 npm run web 快速啟動 Web 版本"
echo "   - 詳細說明請查看 MAC_SETUP.md"
echo ""








