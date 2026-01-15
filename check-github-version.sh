#!/bin/bash

# 檢查 GitHub 最新版本腳本
# 用途：讀取並顯示 GitHub 遠端倉庫的最新版本資訊

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo "=========================================="
echo "GitHub 版本資訊檢查"
echo "=========================================="
echo ""

# 檢查 Git 遠端配置
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo "❌ 錯誤：未找到 Git 遠端倉庫配置"
    exit 1
fi

echo "📦 遠端倉庫：$REMOTE_URL"
echo ""

# 獲取最新資訊
echo "🔄 正在從 GitHub 獲取最新資訊..."
git fetch --tags origin --quiet 2>/dev/null || true
git fetch origin --quiet 2>/dev/null || true

# 檢查本地和遠端分支
LOCAL_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
REMOTE_HEAD=$(git ls-remote --heads origin main 2>/dev/null | awk '{print $1}' || echo "")
LOCAL_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "")

echo "📍 分支資訊："
echo "   本地分支：$LOCAL_BRANCH"
echo "   本地提交：${LOCAL_HEAD:0:8}"
if [ -n "$REMOTE_HEAD" ]; then
    echo "   遠端提交：${REMOTE_HEAD:0:8}"
fi
echo ""

# 檢查版本標籤
echo "🏷️  版本標籤："
LATEST_TAG=$(git ls-remote --tags origin 2>/dev/null | grep -E 'refs/tags/v?[0-9]+\.[0-9]+' | sed 's/.*refs\/tags\///' | sort -V | tail -1 || echo "")
if [ -n "$LATEST_TAG" ]; then
    echo "   最新標籤：$LATEST_TAG"
else
    echo "   最新標籤：無（倉庫尚未建立版本標籤）"
fi
echo ""

# 檢查 package.json 版本
echo "📄 版本資訊（package.json）："
if git show origin/main:package.json >/dev/null 2>&1; then
    REMOTE_VERSION=$(git show origin/main:package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "")
    REMOTE_NAME=$(git show origin/main:package.json 2>/dev/null | grep '"name"' | head -1 | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "")
    
    if [ -f "package.json" ]; then
        LOCAL_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "")
        LOCAL_NAME=$(grep '"name"' package.json | head -1 | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "")
        
        echo "   專案名稱：$REMOTE_NAME"
        echo "   本地版本：$LOCAL_VERSION"
        echo "   遠端版本：$REMOTE_VERSION"
        
        if [ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]; then
            echo "   ⚠️  版本不一致！"
        else
            echo "   ✅ 版本一致"
        fi
    else
        echo "   專案名稱：$REMOTE_NAME"
        echo "   遠端版本：$REMOTE_VERSION"
    fi
else
    echo "   ⚠️  無法讀取遠端 package.json"
fi
echo ""

# 檢查提交狀態
echo "📝 最新提交資訊："
if [ -n "$REMOTE_HEAD" ] && [ -n "$LOCAL_HEAD" ]; then
    if [ "$REMOTE_HEAD" != "$LOCAL_HEAD" ]; then
        BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "?")
        AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "?")
        
        if [ "$BEHIND" != "0" ] && [ "$BEHIND" != "?" ]; then
            echo "   ⬇️  本地落後遠端 $BEHIND 個提交"
        fi
        if [ "$AHEAD" != "0" ] && [ "$AHEAD" != "?" ]; then
            echo "   ⬆️  本地領先遠端 $AHEAD 個提交"
        fi
        
        echo ""
        echo "   遠端最新提交："
        git log origin/main --format="   %h - %s (%ar)" -1 2>/dev/null || echo "   無法獲取"
    else
        echo "   ✅ 本地與遠端同步"
    fi
else
    echo "   ⚠️  無法比較提交狀態"
fi
echo ""

# 顯示最近 3 個提交
echo "📋 遠端最近提交記錄："
git log origin/main --format="   %h - %s (%ar)" -3 2>/dev/null || echo "   無法獲取"
echo ""

echo "=========================================="
echo "檢查完成"
echo "=========================================="





