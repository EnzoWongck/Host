import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ImageBackground,
  Platform,
  Dimensions,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useChips } from '../context/ChipsContext';
import { Language } from '../types/language';
import { resolveImageSource } from '../utils/imageUtils';
// 靜態導入圖片
import Background1212Image from '../../assets/icons/1212.png';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useGame } from '../context/GameContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Icon from '../components/Icon';
import BuyInModal from '../components/BuyInModal';
import ExpenseModal from '../components/ExpenseModal';
import RakeModal from '../components/RakeModal';
import CashOutModal from '../components/CashOutModal';
import InsuranceModal from '../components/InsuranceModal';
import InsuranceRecordsModal from '../components/InsuranceRecordsModal';
import DealerModal from '../components/DealerModal';
import GameSummaryModal from '../components/GameSummaryModal';
import EndGameModal from '../components/EndGameModal';
import PlayerDetailsModal from '../components/PlayerDetailsModal';
import NewGameModal from '../components/NewGameModal';
import CollaborationButton from '../components/CollaborationButton';
import GameCollaborationModal from '../components/GameCollaborationModal';
import EntryFeeModal from '../components/EntryFeeModal';
import GameProfitShareSettingModal from './GameProfitShareSettingScreen';
import TopTabBar from '../components/TopTabBar';
import SwipeHint from '../components/SwipeHint';

const GameScreen: React.FC = () => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { isGameLocked, checkGameChipStatus, openPurchaseModal } = useChips();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { state, setGameSummaryModalVisible, deletePlayer } = useGame();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const playersScrollRef = useRef<ScrollView>(null);
  const mainScrollRef = useRef<ScrollView>(null);
  const playersCardLayoutRef = useRef<{ y: number } | null>(null);
  
  // Modal states
  const [newGameModalVisible, setNewGameModalVisible] = useState(false);
  const [buyInModalVisible, setBuyInModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [rakeModalVisible, setRakeModalVisible] = useState(false);
  const [insuranceModalVisible, setInsuranceModalVisible] = useState(false);
  const [insuranceRecordsVisible, setInsuranceRecordsVisible] = useState(false);
  const [dealerModalVisible, setDealerModalVisible] = useState(false);
  const [endGameModalVisible, setEndGameModalVisible] = useState(false);
  const [cashOutModalVisible, setCashOutModalVisible] = useState(false);
  const [detailsPlayer, setDetailsPlayer] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [collaborationModalVisible, setCollaborationModalVisible] = useState(false);
  const [entryFeeModalVisible, setEntryFeeModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<any>(null);

  const currentGame = state.currentGame;
  
  // 檢查遊戲 chips 狀態（當 currentGame 改變時）
  useEffect(() => {
    if (currentGame?.id) {
      checkGameChipStatus(currentGame.id);
    }
  }, [currentGame?.id, checkGameChipStatus]);
  
  // 計算已進行時間
  const [elapsedTime, setElapsedTime] = useState('');
  useEffect(() => {
    if (!currentGame?.startTime) return;
    
    const updateElapsedTime = () => {
      const start = new Date(currentGame.startTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setElapsedTime(`${hours}時 ${minutes}分`);
    };
    
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 60000); // 每分鐘更新
    
    return () => clearInterval(interval);
  }, [currentGame?.startTime]);
  
  // 計算淨收入（與 GameSummaryModal 中的計算邏輯一致）
  const calculateNetIncome = () => {
    if (!currentGame) return 0;
    
    // 計算總抽水/入場費
    const totalRake = currentGame.rakes.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalEntryFee = currentGame.players.reduce((sum, p) => {
      if (p.customEntryFee !== undefined) return sum + p.customEntryFee;
      // 簡化計算，實際應該根據入場費模式計算
      return sum;
    }, 0);
    const revenue = currentGame.gameMode === 'noRake' ? totalEntryFee : totalRake;
    
    // 計算總小費（使用 Dealer.totalTips）
    const totalTips = currentGame.dealers.reduce(
      (sum, dealer) => sum + (dealer.totalTips || 0),
      0
    );
    
    // 計算總支出
    const totalExpenses = currentGame.expenses.reduce(
      (sum, e) => sum + (e.amount || 0),
      0
    );
    
    // 計算發牌員薪金（與 GameSummaryModal 相同邏輯）
    const totalDealerSalary = currentGame.dealers.reduce((sum, dealer) => {
      const tipPortion = (dealer.totalTips || 0) * (dealer.tipShare / 100);
      const hourlyPortion = (dealer.hourlyRate || 0) * (dealer.workHours || 0);
      const baseSalary = tipPortion + hourlyPortion;
      const salary =
        dealer.estimatedSalary && dealer.estimatedSalary > 0
          ? dealer.estimatedSalary
          : baseSalary;
      return sum + salary;
    }, 0);
    
    // 淨收入 = 總抽水/入場費 + 總小費 - 總支出 - 發牌員薪金
    return revenue + totalTips - totalExpenses - totalDealerSalary;
  };
  
  const netIncome = calculateNetIncome();
  
  // 計算玩家列表動態高度：根據玩家數量，最多600
  const playerItemHeight = 70; // 每個玩家項目的估算高度（包括padding和margin）
  // 計算玩家列表高度，可以展開至tabbar（約100px空間）
  const screenHeight = Dimensions.get('window').height;
  const tabBarHeight = 100; // tabbar高度
  const availableHeight = screenHeight - tabBarHeight - 200; // 減去其他元素高度
  const playerListHeight = currentGame?.players?.length 
    ? Math.min(currentGame.players.length * playerItemHeight, availableHeight) // 展開時可以全部展開，但不超過可用高度
    : 0;

  // 處理導航參數
  useEffect(() => {
    const params = route.params as any;
    if (params?.action === 'end_direct') {
      setEndGameModalVisible(true);
      // 清除參數避免重複觸發
      navigation.setParams({ action: undefined });
    } else if (params?.action === 'buy_in') {
      setBuyInModalVisible(true);
      // 清除參數避免重複觸發
      navigation.setParams({ action: undefined });
    }
  }, [route.params, navigation]);

  // 當 Modal 關閉時，將玩家列表滾動到頂部
  useEffect(() => {
    if (!detailsVisible && !cashOutModalVisible && playersExpanded) {
      // 延遲執行，確保 Modal 完全關閉
      setTimeout(() => {
        playersScrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }
  }, [detailsVisible, cashOutModalVisible, playersExpanded]);

  // 開啟牌局總結時，自動收起玩家列表（避免關閉時看到收回動畫）
  useEffect(() => {
    if (state.gameSummaryModalVisible) {
      setPlayersExpanded(false);
    }
  }, [state.gameSummaryModalVisible]);

  // 每次返回目前牌局頁面時，自動收起玩家列表和關閉所有視窗
  useFocusEffect(
    useCallback(() => {
      setPlayersExpanded(false);
      setGameSummaryModalVisible(false);
      // 關閉所有其他視窗
      setBuyInModalVisible(false);
      setExpenseModalVisible(false);
      setRakeModalVisible(false);
      setInsuranceModalVisible(false);
      setInsuranceRecordsVisible(false);
      setDealerModalVisible(false);
      setEndGameModalVisible(false);
      setCashOutModalVisible(false);
      setDetailsVisible(false);
      setCollaborationModalVisible(false);
      setEntryFeeModalVisible(false);
      return () => {};
    }, [setGameSummaryModalVisible])
  );



  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
      paddingBottom: 80, // Space for tab bar (reduced)
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
    },
    headerLeft: {
      width: 80, // 左側放 Host27o icon + 設定按鈕，同時保持中間文字置中
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: theme.spacing.xs,
    },
    headerTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    hostTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    gameTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: 120,
      gap: theme.spacing.sm,
    },
    languageButton: {
      padding: theme.spacing.sm,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
    },
    logoButton: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      padding: theme.spacing.xs,
      zIndex: 1000,
      minWidth: 80,
      minHeight: 80,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoIcon: {
      width: 100,
      height: 100,
      borderRadius: 14,
    },
    settingsButton: {
      padding: theme.spacing.sm,
    },
    playersCard: {
      marginTop: -theme.spacing.sm, // 向上移動
      marginBottom: theme.spacing.md,
      shadowColor: theme.colorMode === 'light' ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme.colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
      maxHeight: 120, // 縮短玩家列表卡片高度，與頂部卡片一樣
    },
    playersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    playersInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start', // 改為 flex-start 以便調整 icon 位置
    },
    playersIcon: {
      fontSize: theme.fontSize.xl,
      marginRight: theme.spacing.sm,
    },
    playersIconContainer: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      marginRight: theme.spacing.sm,
    },
    playersIconStyle: {
      marginRight: theme.spacing.sm,
      marginTop: theme.spacing.xs / 2, // 向下移動一點
    },
    playersTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
    },
    playersSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    playersDivider: {
      height: 0.5,
      backgroundColor: '#333333', // 極細的霧面分隔線
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    playersAmount: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.success,
      marginRight: theme.spacing.sm,
      fontVariant: ['tabular-nums'], // React Native 等寬數字
    },
    expandIcon: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    playersList: {
      marginTop: -theme.spacing.sm, // 向上移動
      marginBottom: theme.spacing.xs, // 縮短下方空間
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
      maxHeight: 120, // 縮短玩家列表高度
    },
    playersListFullScreen: {
      marginTop: theme.spacing.md,
      marginBottom: 0,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
      maxHeight: availableHeight, // 限制最大高度，不超過tabbar
    },
    playersListContainer: {
      position: 'relative',
    },
    playersScrollContainer: {
      // 移除 paddingBottom，因為按鈕已經移到外面
    },
    fixedAddPlayerContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      zIndex: 10,
    },
    fixedAddPlayerButton: {
      position: 'absolute',
      bottom: 90,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    playerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
      borderWidth: 0.5,
      borderColor: theme.colors.border,
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    playerBuyIn: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    playerProfit: {
      alignItems: 'flex-end',
    },
    profitAmount: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    playerStatus: {
      fontSize: theme.fontSize.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
      marginTop: 4,
    },
    functionButton: {
      width: '48%',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 85,
    },
    functionButtonLarge: {
      width: '48%',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      height: 110,
      flexDirection: 'column',
    },
    functionCard: {
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : '#1E2023',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 0,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    functionIcon: {
      marginBottom: theme.spacing.xs,
    },
    dealerIcon: {
      marginBottom: theme.spacing.xs, // 頂部對齊：與保險 icon 使用相同的 marginBottom
      marginTop: theme.spacing.xs / 2, // 向下移動一點點
    },
    functionText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 6,
      height: 20,
      lineHeight: 20,
    },
    dealerText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 6,
      height: 20,
      lineHeight: 20,
      transform: [{ translateY: -9 }], // 向上移動更多，icon 位置不變
    },
    functionTextLarge: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    fixedButtons: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    fixedButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    // 頂部玻璃態卡片（使用 Card 組件樣式，但添加玻璃態效果）
    blurCard: {
      overflow: 'hidden', // 確保背景圖片不會溢出
      shadowOpacity: 0, // 覆蓋 Card 的陰影
      elevation: 0, // 覆蓋 Card 的 elevation
      minHeight: 120, // 向上放大，與玩家卡片高度一致
      marginTop: -theme.spacing.md, // 向上移動
    },
    blurCardBackground: {
      position: 'absolute',
      top: -20, // 圖片向上移動
      left: 0,
      right: 0,
      bottom: -20,
      width: '100%',
      height: '120%', // 增加高度以補償向上移動
    },
    blurCardOverlay: {
      flex: 1,
      backgroundColor: colorMode === 'light' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.15)', // 減少模糊，讓背景圖片更清晰
      borderWidth: 1,
      borderColor: colorMode === 'light' 
        ? 'rgba(226, 232, 240, 0.5)' 
        : 'rgba(58, 58, 58, 0.5)',
      borderRadius: theme.borderRadius.lg, // 與 Card 的圓角一致
      ...(Platform.OS === 'web' && {
        // Web 平台使用 CSS backdrop-filter 實現模糊，減少模糊值
        // @ts-ignore
        backdropFilter: 'blur(0.5px)',
        WebkitBackdropFilter: 'blur(0.5px)',
      }),
    },
    blurCardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end', // 金額和三角形向下對齊
      paddingHorizontal: theme.spacing.md, // 左右內邊距
      paddingVertical: theme.spacing.md, // 增加上下內邊距
      minHeight: 100, // 增加高度確保有足夠空間
    },
    blurCardLeft: {
      flex: 1,
      paddingRight: theme.spacing.md, // 左側內容右邊距
    },
    blurCardGameName: {
      fontSize: theme.fontSize.xl, // 標題文字放大
      fontWeight: '700',
      color: '#FFFFFF', // 淺色模式也用白色
      marginBottom: theme.spacing.xs,
    },
    blurCardTime: {
      fontSize: theme.fontSize.md,
      color: '#FFFFFF', // 淺色模式也用白色
    },
    blurCardProfit: {
      fontSize: theme.fontSize.xxl + 8,
      fontWeight: '800',
      color: netIncome > 0 ? '#FFD700' : netIncome < 0 ? theme.colors.error : theme.colors.textSecondary,
      fontVariant: ['tabular-nums'],
      paddingLeft: theme.spacing.md, // 右側內容左邊距
    },
    // 功能按鈕（去除背景卡片）
    functionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md + 4,
    },
    functionButtonInCard: {
      width: '31%',
      marginBottom: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm, // 添加一些內邊距以保持點擊區域
    },
    functionIconInCard: {
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.sm, // 向下移動 icon
    },
    dealerIconInCard: {
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.sm - 10, // 向下移動，但保持與其他按鈕 icon 對齊
    },
    functionTextInCard: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: theme.spacing.xs, // 向下移動文字
    },
    dealerTextInCard: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: theme.spacing.xs - 10, // 向下移動，但保持與其他按鈕文字對齊
    },
  });

  // 使用等寬數字（Tabular Numbers）格式化金額
  const formatCurrency = (amount: number) => {
    // 使用 tabular-nums 字體特性來確保數字等寬
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `$${formatted}`;
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return theme.colors.success;
    if (profit < 0) return theme.colors.error;
    return theme.colors.textSecondary;
  };

  const getStatusStyle = (status: string) => {
    if (status === 'active') {
      return {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
        color: theme.colors.textSecondary,
      };
    }
    return {
      backgroundColor: colorMode === 'light' ? theme.colors.textSecondary : '#3F3F46',
      borderWidth: 0,
      borderColor: 'transparent',
      color: '#FFFFFF',
    };
  };

  // 檢查是否可以編輯（chips 過期時不能編輯）
  const canEdit = !isGameLocked;
  
  const handleEditAction = (action: () => void, actionName: string) => {
    if (!canEdit) {
      // 如果按鈕被禁用，顯示購買 Chips 視窗
      openPurchaseModal();
      return;
    }
    action();
  };

  if (!currentGame) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.title}>{t('game.noGameInProgress')}</Text>
          <Button
            title={t('game.newGame')}
            onPress={() => setNewGameModalVisible(true)}
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
        
        {/* 新增牌局彈窗 */}
        <NewGameModal
          visible={newGameModalVisible}
          onClose={() => setNewGameModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopTabBar />

      <ScrollView 
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
        // paddingTop 與 TopTabBar 高度對齊
        contentContainerStyle={{ paddingTop: 90, flexGrow: 1 }}
      >
        <View style={styles.content}>
          {/* 頂部玻璃態卡片 */}
          {!playersExpanded && (
          <Card style={styles.blurCard} padding="lg">
            <ImageBackground
              source={resolveImageSource(Background1212Image)}
              style={styles.blurCardBackground}
              resizeMode="cover"
              blurRadius={Platform.OS === 'web' ? 0 : 1} // 減輕模糊效果
            >
              <View style={styles.blurCardOverlay}>
                <TouchableOpacity
                  onPress={() => setGameSummaryModalVisible(true)}
                  activeOpacity={0.8}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <View style={styles.blurCardContent}>
                    <View style={styles.blurCardLeft}>
                      <Text style={styles.blurCardGameName}>{currentGame.name}</Text>
                      <Text style={styles.blurCardTime}>{elapsedTime || '0時 0分'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={styles.blurCardProfit}>
                        {formatCurrency(netIncome)}
                      </Text>
                      <Text style={{ 
                        fontSize: theme.fontSize.md, 
                        color: '#FFFFFF', 
                        marginLeft: theme.spacing.sm,
                        transform: [{ rotate: '-90deg' }]
                      }}>▼</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </Card>
          )}
          {/* Players Card */}
          <View 
            onLayout={(event) => {
              // onLayout 獲取的 y 是相對於父 View (styles.content) 的位置
              // 但實際上需要的是相對於 ScrollView content 的位置
              // 由於 ScrollView 有 paddingTop: 90，所以實際位置需要加上這個值
              const { y } = event.nativeEvent.layout;
              // 使用 findNodeHandle 或直接使用 y（因為 content 是 ScrollView 的直接子元素）
              playersCardLayoutRef.current = { y };
            }}
          >
          <Card style={styles.playersCard}>
            <TouchableOpacity 
              style={styles.playersHeader}
              onPress={() => {
                const willExpand = !playersExpanded;
                if (willExpand) {
                  // 先滾動整個頁面到頂部，隱藏頂部卡片
                  if (mainScrollRef.current) {
                    // 滾動到頂部
                    mainScrollRef.current.scrollTo({ 
                      y: 0, 
                      animated: true 
                    });
                    // 等待滾動動畫完成後再展開列表並隱藏頂部卡片
                    setTimeout(() => {
                      setPlayersExpanded(true);
                      // 滾動內部列表到頂部
                      setTimeout(() => {
                        playersScrollRef.current?.scrollTo({ y: 0, animated: false });
                      }, 100);
                    }, 300);
                  } else {
                    // 如果沒有滾動引用，直接展開
                    setPlayersExpanded(true);
                    setTimeout(() => {
                      playersScrollRef.current?.scrollTo({ y: 0, animated: false });
                    }, 100);
                  }
                } else {
                  setPlayersExpanded(false);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.playersInfo}>
                <Icon name="player2" size={42} style={styles.playersIconStyle} />
                <View>
                  <Text style={styles.playersTitle}>{t('game.players')}</Text>
                  <Text style={styles.playersSubtitle}>
                    {currentGame.players.filter(p => p.status === 'active').length} {t('game.playersInProgress')}
                  </Text>
                  {/* 極細的霧面分隔線 */}
                  <View style={styles.playersDivider} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.expandIcon, { 
                  transform: [{ rotate: playersExpanded ? '180deg' : '0deg' }] 
                }]}>
                  ▼
                </Text>
              </View>
            </TouchableOpacity>

            {playersExpanded && (
              <View style={[styles.playersListFullScreen, { maxHeight: availableHeight }]}>
                {/* 滑動提示（首次顯示） */}
                {currentGame.players && currentGame.players.length > 0 && Platform.OS !== 'web' && (
                  <SwipeHint storageKey="playerList" />
                )}
                <ScrollView 
                  ref={playersScrollRef}
                  nestedScrollEnabled 
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={true}
                  bounces={true}
                  decelerationRate="fast"
                >
                {currentGame.players
                  .slice()
                  .sort((a, b) => (a.status === 'active' && b.status !== 'active' ? -1 : a.status !== 'active' && b.status === 'active' ? 1 : 0))
                  .map((player) => (
                    <Swipeable
                      key={player.id}
                      renderRightActions={() => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                          <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, borderTopLeftRadius: theme.borderRadius.sm, borderBottomLeftRadius: theme.borderRadius.sm, height: 52 }}
                            onPress={() => { setDetailsPlayer(player); setDetailsVisible(true); }}
                          >
                            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>{t('common.edit')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.error, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, borderTopRightRadius: theme.borderRadius.sm, borderBottomRightRadius: theme.borderRadius.sm, height: 52 }}
                            onPress={() => {
                              // 顯示確認刪除視窗
                              setPlayerToDelete(player);
                              setDeleteConfirmVisible(true);
                            }}
                          >
                            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>{t('common.delete')}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    >
                    <TouchableOpacity 
                      style={styles.playerItem} 
                      onPress={() => { setDetailsPlayer(player); setDetailsVisible(true); }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerName}>{player.name}</Text>
                            <Text style={styles.playerBuyIn}>
                              {t('game.buyIn')}: <Text style={{ color: colorMode === 'dark' ? '#FFD700' : theme.colors.textSecondary }}>$</Text><Text style={{ color: colorMode === 'dark' ? '#FFD700' : theme.colors.textSecondary }}>{player.buyIn.toLocaleString()}</Text>
                            </Text>
                      </View>
                      <View style={styles.playerProfit}>
                        {player.status === 'cashed_out' && (
                          <Text style={[
                            styles.profitAmount,
                            { color: getProfitColor(player.profit) }
                          ]}>
                            {player.profit >= 0 ? '+' : ''}{formatCurrency(player.profit)}
                          </Text>
                        )}
                            <Text style={[
                              styles.playerStatus,
                              getStatusStyle(player.status)
                            ]}>
                              {player.status === 'active' ? t('game.inProgress') : t('game.cashedOut')}
                            </Text>
                      </View>
                    </TouchableOpacity>
                    </Swipeable>
                  ))}
                </ScrollView>
              </View>
            )}
          </Card>
          </View>

          {/* 功能按鈕（整合6個按鈕，每行3個，去除背景卡片） */}

            {!playersExpanded && (
            <View style={styles.functionsGrid}>
                <View style={[styles.functionButtonInCard, !canEdit && { opacity: 0.5 }]}>
                  <TouchableOpacity 
                    onPress={() => handleEditAction(() => setBuyInModalVisible(true), 'buyIn')}
                    activeOpacity={0.7}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon name="buy-in" size={40} style={styles.functionIconInCard} />
                    <Text style={styles.functionTextInCard}>{t('game.functions.buyIn') || t('game.functions.buyInCashOut')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.functionButtonInCard, !canEdit && { opacity: 0.5 }]}>
                  <TouchableOpacity 
                    onPress={() => handleEditAction(() => setCashOutModalVisible(true), 'cashOut')}
                    activeOpacity={0.7}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon name="cashout" size={40} style={styles.functionIconInCard} />
                    <Text style={styles.functionTextInCard}>{t('game.functions.cashOut') || t('cashOut.title') || '兌現'}</Text>
                  </TouchableOpacity>
                </View>

                {currentGame.gameMode === 'noRake' ? (
                  <View style={[styles.functionButtonInCard, !canEdit && { opacity: 0.5 }]}>
                    <TouchableOpacity 
                      onPress={() => handleEditAction(() => setEntryFeeModalVisible(true), 'entryFee')}
                      activeOpacity={0.7}
                      style={{ alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon name="rake" size={50} style={styles.functionIconInCard} />
                      <Text style={[styles.functionTextInCard, { marginTop: 0 }]}>{t('game.functions.entryFee')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.functionButtonInCard, !canEdit && { opacity: 0.5 }]}>
                    <TouchableOpacity 
                      onPress={() => handleEditAction(() => setRakeModalVisible(true), 'rake')}
                      activeOpacity={0.7}
                      style={{ alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Icon name="rake" size={50} style={styles.functionIconInCard} />
                      <Text style={[styles.functionTextInCard, { marginTop: 0 }]}>{t('game.functions.rake')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={[styles.functionButtonInCard, !canEdit && { opacity: 0.5 }]}>
                  <TouchableOpacity 
                    onPress={() => handleEditAction(() => setExpenseModalVisible(true), 'expense')}
                    activeOpacity={0.7}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon name="cost" size={40} style={styles.functionIconInCard} />
                    <Text style={styles.functionTextInCard}>{t('game.functions.expense')}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.functionButtonInCard, !canEdit && { opacity: 0.5 }]}>
                  <TouchableOpacity 
                    onPress={() => {
                      if (!canEdit) {
                        openPurchaseModal();
                        return;
                      }
                      setInsuranceRecordsVisible(true);
                    }}
                    activeOpacity={0.7}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon name="insurance" size={40} style={styles.functionIconInCard} />
                    <Text style={styles.functionTextInCard}>{t('game.functions.insurance')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.functionButtonInCard, !canEdit && { opacity: 0.5 }]}>
                  <TouchableOpacity 
                    onPress={() => handleEditAction(() => setDealerModalVisible(true), 'dealer')}
                    activeOpacity={0.7}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon name="dealer" size={60} style={styles.dealerIconInCard} />
                    <Text style={styles.dealerTextInCard}>{t('game.functions.dealer')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
          )}
        </View>
      </ScrollView>

      {/* 移除頁內底部按鈕，交由 DoubleTabBar 控制 */}

      {/* All Modals */}
      <BuyInModal
        visible={buyInModalVisible}
        onClose={() => setBuyInModalVisible(false)}
      />
      <ExpenseModal
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
      />
      <RakeModal
        visible={rakeModalVisible}
        onClose={() => setRakeModalVisible(false)}
      />
      <InsuranceModal
        visible={insuranceModalVisible}
        onClose={() => setInsuranceModalVisible(false)}
        onCompleted={() => {
          // 新增保險完成後：關閉新增視窗 → 自動開啟紀錄視窗並滾到頂端
          setInsuranceRecordsVisible(true);
        }}
      />
      <InsuranceRecordsModal
        visible={insuranceRecordsVisible}
        onClose={() => setInsuranceRecordsVisible(false)}
        onAddInsurance={() => {
          setInsuranceRecordsVisible(false);
          setInsuranceModalVisible(true);
        }}
      />
      <DealerModal
        visible={dealerModalVisible}
        onClose={() => setDealerModalVisible(false)}
      />
      <GameSummaryModal
        visible={state.gameSummaryModalVisible}
        onClose={() => {
          setGameSummaryModalVisible(false);
        }}
      />
      <EndGameModal
        visible={endGameModalVisible}
        onClose={() => setEndGameModalVisible(false)}
      />
      <CashOutModal
        visible={cashOutModalVisible}
        onClose={() => setCashOutModalVisible(false)}
      />
      <PlayerDetailsModal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        player={detailsPlayer}
      />
      <GameCollaborationModal
        visible={collaborationModalVisible}
        onClose={() => {
          console.log('GameScreen: 關閉協作模態框');
          setCollaborationModalVisible(false);
        }}
        gameId={currentGame?.id || ''}
      />
      <EntryFeeModal
        visible={entryFeeModalVisible}
        onClose={() => setEntryFeeModalVisible(false)}
      />

      {/* 牌局 Host Profit Share 設定（彈出視窗） */}

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              minWidth: 200,
            }}
          >
            <Text style={{ fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md }}>
              {t('settings.language')}
            </Text>
            <TouchableOpacity
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: language === 'zh-TW' ? theme.colors.primary + '20' : 'transparent',
                marginBottom: theme.spacing.sm,
              }}
              onPress={() => handleLanguageSelect('zh-TW')}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>{t('settings.traditionalChinese')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: language === 'zh-CN' ? theme.colors.primary + '20' : 'transparent',
              }}
              onPress={() => handleLanguageSelect('zh-CN')}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: language === 'zh-CN' ? '700' : '400' }}>{t('settings.simplifiedChinese')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 確認刪除玩家 Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setDeleteConfirmVisible(false)}
        >
          <TouchableOpacity
            style={{
              backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              width: '85%',
              maxWidth: 320,
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 12 }}>
              {t('game.deletePlayer')}
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
              {t('game.confirmDelete')} {playerToDelete?.name}？
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: colorMode === 'dark' ? '#333' : '#E5E5E5',
                  alignItems: 'center',
                }}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: theme.colors.error,
                  alignItems: 'center',
                }}
                onPress={async () => {
                  if (currentGame && playerToDelete) {
                    try {
                      await deletePlayer(currentGame.id, playerToDelete.id);
                    } catch (error) {
                      console.error('刪除玩家失敗:', error);
                    }
                  }
                  setDeleteConfirmVisible(false);
                  setPlayerToDelete(null);
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default GameScreen;
