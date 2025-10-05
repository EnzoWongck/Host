#!/bin/bash

# 安裝 ngrok 腳本
echo "🔧 安裝 ngrok 到您的系統"
echo "=================================="
echo ""

# 檢測系統
OS=$(uname -s)
ARCH=$(uname -m)

echo "檢測到系統：$OS $ARCH"
echo ""

# 創建下載目錄
DOWNLOAD_DIR="$HOME/Downloads/ngrok"
mkdir -p "$DOWNLOAD_DIR"
cd "$DOWNLOAD_DIR"

echo "📥 下載 ngrok..."
echo ""

# 根據系統架構選擇正確的版本
if [[ "$ARCH" == "arm64" ]]; then
    # Apple Silicon (M1/M2) Mac
    DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip"
    echo "為 Apple Silicon Mac 下載 ngrok..."
elif [[ "$ARCH" == "x86_64" ]]; then
    # Intel Mac
    DOWNLOAD_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip"
    echo "為 Intel Mac 下載 ngrok..."
else
    echo "❌ 不支援的系統架構：$ARCH"
    exit 1
fi

# 下載 ngrok
echo "正在下載..."
curl -L -o ngrok.zip "$DOWNLOAD_URL"

if [ $? -eq 0 ]; then
    echo "✅ 下載完成"
else
    echo "❌ 下載失敗，請檢查網路連接"
    exit 1
fi

# 解壓縮
echo ""
echo "📦 解壓縮..."
unzip -o ngrok.zip

if [ $? -eq 0 ]; then
    echo "✅ 解壓縮完成"
else
    echo "❌ 解壓縮失敗"
    exit 1
fi

# 移動到系統路徑
echo ""
echo "🚀 安裝到系統..."
sudo mv ngrok /usr/local/bin/

if [ $? -eq 0 ]; then
    echo "✅ 安裝完成"
else
    echo "❌ 安裝失敗，嘗試安裝到用戶目錄..."
    mkdir -p "$HOME/bin"
    mv ngrok "$HOME/bin/"
    echo "export PATH=\"\$HOME/bin:\$PATH\"" >> "$HOME/.zshrc"
    echo "✅ 安裝到用戶目錄完成"
    echo "請重新啟動終端機或運行：source ~/.zshrc"
fi

# 清理下載文件
rm -f ngrok.zip
rm -rf "$DOWNLOAD_DIR"

echo ""
echo "🎉 ngrok 安裝完成！"
echo ""
echo "📋 下一步："
echo "1. 註冊 ngrok 帳戶：https://ngrok.com/"
echo "2. 獲取認證令牌"
echo "3. 運行：ngrok config add-authtoken YOUR_TOKEN"
echo "4. 啟動隧道：ngrok http 3000"
echo ""

# 檢查安裝
echo "🔍 檢查安裝..."
if command -v ngrok >/dev/null 2>&1; then
    echo "✅ ngrok 已正確安裝"
    ngrok version
else
    echo "⚠️  ngrok 可能未正確安裝到 PATH"
    echo "請嘗試重新啟動終端機"
fi

