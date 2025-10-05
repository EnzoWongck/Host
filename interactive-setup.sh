#!/bin/bash

# Poker Host 互動式設置腳本
echo "🎯 歡迎使用 Poker Host 網頁設置助手！"
echo "=================================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數：顯示步驟
show_step() {
    echo -e "${BLUE}📋 步驟 $1: $2${NC}"
    echo "----------------------------------------"
}

# 函數：檢查命令結果
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 成功${NC}"
    else
        echo -e "${RED}❌ 失敗${NC}"
        echo "請檢查錯誤信息並重試"
    fi
    echo ""
}

# 函數：等待用戶確認
wait_for_user() {
    echo -e "${YELLOW}按 Enter 鍵繼續...${NC}"
    read
}

# 步驟 1：檢查當前狀態
show_step "1" "檢查應用程式狀態"

echo "檢查伺服器是否運行..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 伺服器正在運行${NC}"
else
    echo -e "${YELLOW}⚠️  伺服器未運行，正在啟動...${NC}"
    echo "執行: ./start-pwa.sh"
    ./start-pwa.sh &
    sleep 5
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 伺服器啟動成功${NC}"
    else
        echo -e "${RED}❌ 伺服器啟動失敗${NC}"
        echo "請手動運行: ./start-pwa.sh"
        exit 1
    fi
fi

echo ""
echo "🌐 請在瀏覽器中打開: http://localhost:3000"
echo "確認網頁正常顯示後繼續"
wait_for_user

# 步驟 2：獲取 IP 地址
show_step "2" "獲取電腦 IP 地址"

echo "您的電腦 IP 地址："
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
if [ -n "$LOCAL_IP" ]; then
    echo -e "${GREEN}✅ $LOCAL_IP${NC}"
    echo ""
    echo "📱 在手機上測試："
    echo "1. 確保手機和電腦連接同一 WiFi"
    echo "2. 在手機瀏覽器中訪問: http://$LOCAL_IP:3000"
    echo "3. 測試 PWA 功能（加入主畫面）"
else
    echo -e "${RED}❌ 無法獲取 IP 地址${NC}"
fi

echo ""
echo "測試完成後繼續"
wait_for_user

# 步驟 3：準備部署
show_step "3" "準備生產環境部署"

echo "正在創建部署包..."
if [ -f "deploy-production.sh" ]; then
    ./deploy-production.sh
    check_result
    
    echo "檢查部署包..."
    if [ -d "pokerhost-production" ]; then
        echo -e "${GREEN}✅ 部署包創建成功${NC}"
        echo "部署目錄: pokerhost-production/"
        ls -la pokerhost-production/ | head -10
    else
        echo -e "${RED}❌ 部署包創建失敗${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ deploy-production.sh 不存在${NC}"
    exit 1
fi

wait_for_user

# 步驟 4：檢查域名
show_step "4" "檢查域名配置"

echo "檢查 pokerhost.com 域名狀態..."
if [ -f "check-domain.sh" ]; then
    ./check-domain.sh
else
    echo -e "${YELLOW}⚠️  check-domain.sh 不存在${NC}"
fi

echo ""
echo "📋 域名配置清單："
echo "1. 登入您的域名註冊商後台"
echo "2. 設置 A 記錄：pokerhost.com → 您的伺服器 IP"
echo "3. 設置 A 記錄：www.pokerhost.com → 您的伺服器 IP"
echo "4. 等待 DNS 傳播（5-30 分鐘）"

wait_for_user

# 步驟 5：伺服器準備檢查清單
show_step "5" "伺服器準備檢查清單"

echo "📋 請確認您的伺服器已準備："
echo ""
echo "✅ 作業系統：Ubuntu 20.04+ 或 CentOS 8+"
echo "✅ Node.js 16+：node --version"
echo "✅ Nginx：nginx -v"
echo "✅ PM2：pm2 --version"
echo "✅ 防火牆：開放 80, 443 端口"
echo "✅ SSH 訪問：可以連接伺服器"
echo ""

read -p "伺服器是否已準備完成？(y/n): " server_ready
if [ "$server_ready" != "y" ]; then
    echo ""
    echo "📖 請參考 STEP_BY_STEP_SETUP.md 完成伺服器準備"
    echo "完成後重新運行此腳本"
    exit 0
fi

# 步驟 6：部署指令
show_step "6" "部署到伺服器"

echo "📦 部署指令："
echo ""
echo "1. 上傳文件到伺服器："
echo -e "${BLUE}   scp -r pokerhost-production/ username@your-server-ip:/home/username/${NC}"
echo ""
echo "2. 連接伺服器："
echo -e "${BLUE}   ssh username@your-server-ip${NC}"
echo ""
echo "3. 在伺服器上執行："
echo -e "${BLUE}   cd /home/username/pokerhost-production${NC}"
echo -e "${BLUE}   npm install${NC}"
echo -e "${BLUE}   sudo cp nginx.conf /etc/nginx/sites-available/pokerhost.com${NC}"
echo -e "${BLUE}   sudo ln -s /etc/nginx/sites-available/pokerhost.com /etc/nginx/sites-enabled/${NC}"
echo -e "${BLUE}   sudo nginx -t${NC}"
echo -e "${BLUE}   sudo systemctl reload nginx${NC}"
echo ""

read -p "是否已完成文件上傳？(y/n): " upload_done
if [ "$upload_done" != "y" ]; then
    echo ""
    echo "請先完成文件上傳，然後重新運行此腳本"
    exit 0
fi

# 步驟 7：SSL 設置
show_step "7" "設置 SSL 證書"

echo "🔒 SSL 證書設置："
echo ""
echo "1. 安裝 Certbot："
echo -e "${BLUE}   sudo apt install certbot python3-certbot-nginx -y${NC}"
echo ""
echo "2. 獲取 SSL 證書："
echo -e "${BLUE}   sudo certbot --nginx -d pokerhost.com -d www.pokerhost.com${NC}"
echo ""
echo "3. 測試自動續期："
echo -e "${BLUE}   sudo certbot renew --dry-run${NC}"
echo ""

read -p "是否已完成 SSL 設置？(y/n): " ssl_done
if [ "$ssl_done" != "y" ]; then
    echo ""
    echo "請先完成 SSL 設置，然後重新運行此腳本"
    exit 0
fi

# 步驟 8：啟動應用程式
show_step "8" "啟動應用程式"

echo "🚀 啟動應用程式："
echo ""
echo "1. 使用 PM2 啟動："
echo -e "${BLUE}   cd /home/username/pokerhost-production${NC}"
echo -e "${BLUE}   npm run pm2${NC}"
echo ""
echo "2. 設置開機自啟："
echo -e "${BLUE}   pm2 startup${NC}"
echo -e "${BLUE}   pm2 save${NC}"
echo ""
echo "3. 檢查狀態："
echo -e "${BLUE}   pm2 status${NC}"
echo -e "${BLUE}   pm2 logs pokerhost${NC}"
echo ""

read -p "是否已啟動應用程式？(y/n): " app_started
if [ "$app_started" != "y" ]; then
    echo ""
    echo "請先啟動應用程式，然後重新運行此腳本"
    exit 0
fi

# 步驟 9：最終測試
show_step "9" "最終測試和驗證"

echo "🧪 測試清單："
echo ""
echo "1. 基本功能測試："
echo -e "${BLUE}   curl -I http://pokerhost.com${NC}"
echo -e "${BLUE}   curl -I https://pokerhost.com${NC}"
echo ""
echo "2. PWA 功能測試："
echo -e "${BLUE}   curl -I https://pokerhost.com/manifest.json${NC}"
echo -e "${BLUE}   curl -I https://pokerhost.com/sw.js${NC}"
echo ""
echo "3. 瀏覽器測試："
echo "   • 訪問 https://pokerhost.com"
echo "   • 檢查 SSL 證書"
echo "   • 測試 PWA 功能"
echo "   • 手機測試「加入主畫面」"
echo ""

read -p "是否已完成所有測試？(y/n): " tests_done
if [ "$tests_done" != "y" ]; then
    echo ""
    echo "請完成所有測試，然後重新運行此腳本"
    exit 0
fi

# 完成
echo ""
echo "🎉 恭喜！Poker Host 網站設置完成！"
echo "=================================="
echo ""
echo -e "${GREEN}✅ 您的網站現在可以通過以下網址訪問：${NC}"
echo "   🌐 https://pokerhost.com"
echo "   📱 PWA 功能已啟用"
echo "   🔒 SSL 證書已安裝"
echo "   ⚡ 性能已優化"
echo ""
echo "📊 監控和管理："
echo "   • 應用程式監控：pm2 monit"
echo "   • 日誌查看：pm2 logs pokerhost"
echo "   • 重啟應用：pm2 restart pokerhost"
echo ""
echo "📖 詳細文檔："
echo "   • 設置指南：STEP_BY_STEP_SETUP.md"
echo "   • 部署檢查清單：DEPLOYMENT_CHECKLIST.md"
echo "   • PWA 指南：PWA_GUIDE.md"
echo ""
echo -e "${BLUE}感謝使用 Poker Host！🎊${NC}"

