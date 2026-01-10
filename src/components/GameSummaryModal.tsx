import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Platform,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Expense, Player, Host } from '../types/game';
import { FlatList } from 'react-native';
import Icon from './Icon';
import PlayerEntryFeeEditModal from './PlayerEntryFeeEditModal';
import Button from './Button';
import GameSettingsEditModal from './GameSettingsEditModal';
import HostEditModal from './HostEditModal';
import PlayerDetailsModal from './PlayerDetailsModal';
// 靜態導入圖片
import EditIconImage from '../../assets/icons/edit.png';
import EditBlackIconImage from '../../assets/icons/edit.black.png';

interface GameSummaryModalProps {
  visible: boolean;
  onClose: () => void;
}

const GameSummaryModal: React.FC<GameSummaryModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { t, language } = useLanguage();
  const { state, updatePlayer, updateGame } = useGame();
  const { showToast } = useToast();
  
  // 獲取正數顏色（深色模式下為白色，淺色模式下為綠色）
  const getPositiveColor = () => colorMode === 'dark' ? theme.colors.text : theme.colors.success;

  const currentGame = state.currentGame;
  
  // 展開狀態管理
  const [gameInfoExpanded, setGameInfoExpanded] = useState(false);
  const [financialExpanded, setFinancialExpanded] = useState(false);
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const [entryFeeExpanded, setEntryFeeExpanded] = useState(false);
  const [expensesExpanded, setExpensesExpanded] = useState(false);
  const [settlementExpanded, setSettlementExpanded] = useState(false);
  const [insuranceExpanded, setInsuranceExpanded] = useState(false);
  const [formulaExpanded, setFormulaExpanded] = useState(false);
  
  // 編輯入場費狀態
  const [editEntryFeeVisible, setEditEntryFeeVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  // 分成設定狀態
  const [profitShareExpanded, setProfitShareExpanded] = useState(false);
  const [hostShares, setHostShares] = useState<{ name: string; shareRatio: number }[]>([]);
  const [hostInputs, setHostInputs] = useState<string[]>([]);
  
  // 編輯視窗狀態
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<'gameName' | 'blinds' | 'hostName' | null>(null);
  const [editHostIndex, setEditHostIndex] = useState<number | undefined>(undefined);
  const [hostEditModalVisible, setHostEditModalVisible] = useState(false);
  const [playerDetailsVisible, setPlayerDetailsVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // 格式化百分比：整數時不顯示小數點
  const formatPercentage = (ratio: number): string => {
    const percent = ratio * 100;
    if (percent % 1 === 0) {
      return percent.toString(); // 整數時直接返回整數字符串
    }
    return percent.toFixed(1); // 有小數時顯示一位小數
  };

  // 初始化分成設定（當 host 更新時也要重新初始化）
  useEffect(() => {
    if (visible && currentGame) {
      const rawHosts = currentGame.hosts || [];
      const equalShare = rawHosts.length > 0 ? 1 / rawHosts.length : 0;
      const initialHosts = rawHosts.map((h) => {
        if (typeof h === 'string') {
          return { name: h, shareRatio: equalShare };
        }
        return { name: h.name, shareRatio: h.shareRatio ?? equalShare };
      });
      setHostShares(initialHosts);
      setHostInputs(initialHosts.map((h) => formatPercentage(h.shareRatio)));
    }
  }, [visible, currentGame, currentGame?.hosts]); // 添加 currentGame?.hosts 依賴，確保 host 更新時觸發

  // 每次開啟總結頁面時，收起所有可展開卡片
  useEffect(() => {
    if (visible) {
      setGameInfoExpanded(false);
      setFinancialExpanded(false);
      setPlayersExpanded(false);
      setEntryFeeExpanded(false);
      setExpensesExpanded(false);
      setSettlementExpanded(false);
      setInsuranceExpanded(false);
      setProfitShareExpanded(false);
    }
  }, [visible]);
  
  // 保存分成設定
  const handleSaveProfitShare = () => {
    if (!currentGame) return;
    
    const totalRatio = hostInputs.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (totalRatio <= 0) {
      Alert.alert('錯誤', '總比例必須大於 0');
      return;
    }
    
    const updatedHosts: Host[] = hostShares.map((h, index) => {
      const ratio = parseFloat(hostInputs[index]) || 0;
      return {
        ...h,
        shareRatio: ratio / totalRatio,
      };
    });
    
    updateGame({
      ...currentGame,
      hosts: updatedHosts,
    });
    
    showToast('分成設定已更新', 'success');
    setProfitShareExpanded(false);
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background,
      zIndex: 1000,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'transparent',
      minWidth: 32,
      minHeight: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      fontSize: theme.fontSize.xl,
      fontWeight: '300',
      color: theme.colors.textSecondary,
      lineHeight: theme.fontSize.xl,
    },
    closeButtonOld: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'transparent',
    },
    scrollContainer: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.text, // 深色模式下為白色，淺色模式下為深色
      marginTop: Platform.OS === 'android' ? -1 : 0,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    infoLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    infoValue: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'right',
    },
    financialCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    financialTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
    },
    financialRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colorMode === 'dark' ? theme.colors.border + '30' : theme.colors.primary + '20',
    },
    financialLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      flex: 1,
    },
    financialValue: {
      fontVariant: ['tabular-nums'], // 等寬數字
      fontSize: theme.fontSize.md,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'right',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.md,
      borderTopWidth: 4,
      borderTopColor: colorMode === 'dark' ? theme.colors.border : theme.colors.primary,
      marginTop: theme.spacing.sm,
    },
    totalLabel: {
      fontSize: theme.fontSize.lg,
      fontWeight: '800',
      color: theme.colors.text, // 深色模式下為白色
    },
    totalValue: {
      fontSize: theme.fontSize.lg,
      fontWeight: '800',
      color: theme.colors.text, // 深色模式下為白色
    },
    entryFeeList: {
      marginTop: theme.spacing.md,
    },
    entryFeeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    entryFeePlayerName: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontWeight: '500',
    },
    entryFeeAmount: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontWeight: '600',
    },
    entryFeeCustomLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    entryFeeTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingTop: theme.spacing.lg,
      marginTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    entryFeeTotalLabel: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    entryFeeTotalAmount: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
    },
    entryFeeSummaryCard: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.lg,
      backgroundColor: '#f0f9ff',
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: '#bae6fd',
    },
    entryFeeSummaryTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    entryFeeSummaryItem: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    entryFeeSummaryTotal: {
      marginTop: theme.spacing.md,
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: '#0891b2',
    },
    playersList: {
      marginBottom: theme.spacing.lg,
    },
    playerItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: 0,
      marginBottom: theme.spacing.sm,
      position: 'relative',
    },
    playersItemsContainer: {
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
    },
    playerHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    playerName: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    playerBuyIn: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    playerProfit: {
      fontSize: theme.fontSize.md,
      fontWeight: '700',
      marginTop: theme.spacing.xs,
    },
    playerHost: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.md,
    },
    playerStatus: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: 0,
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      backgroundColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.xs,
    },
    positiveProfit: {
      color: theme.colors.success,
    },
    negativeProfit: {
      color: theme.colors.error,
    },
    expenseItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: 0,
      marginBottom: theme.spacing.xs,
    },
    expenseDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      flex: 1,
    },
    expenseAmount: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
    },
    expenseItemsContainer: {
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.sm,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
    },
    emptyText: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    settlementCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    settlementHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    settlementRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    settlementLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      flex: 1,
    },
    settlementValue: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'right',
    },
    settlementFormula: {
      marginTop: theme.spacing.xs,
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    transferRow: {
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    transferText: {
      fontSize: theme.fontSize.md,
      fontWeight: '700', // 轉帳文字加粗，更醒目
      color: theme.colors.text,
    },
    noTransferText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      padding: theme.spacing.md,
    },
    cellStrong: { 
      fontWeight: '700' 
    },
    // 可展開卡片樣式
    expandableCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    expandIcon: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    headerIcon: {
      width: 30,
      height: 30,
      marginRight: 10,
    },
    summaryIcon: {
      marginTop: 4, // push icon further downward for settlement section
    },
    cardContent: {
      padding: theme.spacing.lg,
    },
  });

  if (!currentGame) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('game.noGameInProgress')}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    // 轉帳明細金額四捨五入為整數，不顯示小數點
    const roundedAmount = Math.round(amount);
    return `$${roundedAmount.toLocaleString()}`;
  };
  const formatDuration = (start: any, end?: any) => {
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return '--';
    const diff = e.getTime() - s.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}${t('summaryExport.hours')} ${minutes}${t('summaryExport.minutes')}`;
  };

  // 支出類別映射
  const expenseCategoryMap: Record<string, string> = {
    'takeout': t('expenseCategories.takeout'),
    'miscellaneous': t('expenseCategories.miscellaneous'),
    'taxi': t('expenseCategories.taxi'),
    'venue': t('expenseCategories.venue'),
    'other': t('expenseCategories.other'),
  };

  // 計算財務統計
  const calculateEntryFee = (player: Player): number => {
    // 優先使用自訂入場費
    if (player.customEntryFee !== undefined) {
      return player.customEntryFee;
    }

    if (!currentGame || currentGame.gameMode !== 'noRake') {
      return 0;
    }

    const mode = currentGame.entryFeeMode;

    if (mode === 'fixed') {
      return currentGame.fixedEntryFee || 0;
    }

    // 自訂/按時長計費（含舊版 hourly）
    if (mode === 'custom' || mode === 'hourly') {
      if (!player.buyInTime || !player.cashOutTime) {
        return 0;
      }

      const buyInTime = new Date(player.buyInTime);
      const cashOutTime = new Date(player.cashOutTime);
      const minutes = Math.ceil((cashOutTime.getTime() - buyInTime.getTime()) / 60000);
      const units = Math.ceil(minutes / 30); // 每30分鐘一單位
      const rate = currentGame.hourlyRate || 0;
      return units * rate;
    }

    return 0;
  };

  // 計算基礎入場費（不包含自訂值）
  const calculateBaseEntryFee = (player: Player): number => {
    if (!currentGame || currentGame.gameMode !== 'noRake') {
      return 0;
    }

    const mode = currentGame.entryFeeMode;

    if (mode === 'fixed') {
      return currentGame.fixedEntryFee || 0;
    }

    // 自訂/按時長計費（含舊版 hourly）
    if (mode === 'custom' || mode === 'hourly') {
      if (!player.buyInTime || !player.cashOutTime) {
        return 0;
      }

      const buyInTime = new Date(player.buyInTime);
      const cashOutTime = new Date(player.cashOutTime);
      const minutes = Math.ceil((cashOutTime.getTime() - buyInTime.getTime()) / 60000);
      const units = Math.ceil(minutes / 30); // 每30分鐘一單位
      const rate = currentGame.hourlyRate || 0;
      return units * rate;
    }

    return 0;
  };

  const totalBuyIn = currentGame.players.reduce((sum, player) => sum + player.buyIn, 0);
  const totalCashOut = currentGame.players.reduce((sum, player) => {
    return sum + (player.buyIn + player.profit);
  }, 0);
  const totalRake = currentGame.rakes.reduce((sum, rake) => sum + rake.amount, 0);
  const totalTips = currentGame.dealers.reduce((sum, dealer) => sum + dealer.totalTips, 0);
  const totalExpenses = currentGame.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalDealerSalary = currentGame.dealers.reduce((sum, dealer) => {
    const tipPortion = dealer.totalTips * (dealer.tipShare / 100);
    const hourlyPortion = dealer.hourlyRate * dealer.workHours;
    const baseSalary = tipPortion + hourlyPortion;
    const salary =
      dealer.estimatedSalary && dealer.estimatedSalary > 0
        ? dealer.estimatedSalary
        : baseSalary;
    return sum + salary;
  }, 0);

  const insuranceProfit = currentGame.insurances.reduce((sum, ins) => sum + (ins.amount || 0), 0);

  const totalEntryFee = currentGame.gameMode === 'noRake'
    ? currentGame.players.reduce((sum, player) => sum + calculateEntryFee(player), 0)
    : 0;

const deductedEntryFee = currentGame.gameMode === 'noRake'
  ? currentGame.players.reduce((sum, player) => {
      if (player.entryFeeDeducted) {
        return sum + calculateEntryFee(player);
      }
      return sum;
    }, 0)
  : 0;

const playersPendingEntryFee = currentGame.gameMode === 'noRake'
  ? currentGame.players.filter(player => {
      const fee = calculateEntryFee(player);
      return fee > 0 && !(player.entryFeeDeducted || false);
    })
  : [];

  const revenue = currentGame.gameMode === 'noRake' ? totalEntryFee : totalRake;

  // 凈收入 = 總抽水/入場費 + 總小費 - 總支出 - 發牌員薪金
  const netIncome = revenue + totalTips - totalExpenses - totalDealerSalary;

  // 實際收賬 = 總買入 - 總兌現 - 總支出 - 發牌員薪金 - 保險損益
  const actualReceipts = totalBuyIn - totalCashOut - totalExpenses - totalDealerSalary - insuranceProfit;
  
  // 計算平帳狀態和差距
  const expectedAmount = netIncome;
  const isBalanced = Math.abs(actualReceipts - expectedAmount) < 0.01; // 允許小數點誤差
  const difference = actualReceipts - expectedAmount;

const actualProfitNoRake = currentGame.gameMode === 'noRake'
  ? totalBuyIn
      - totalCashOut
      + totalEntryFee
      - deductedEntryFee
      - totalExpenses
      + totalTips
      - totalDealerSalary
      - Math.abs(insuranceProfit)
  : 0;

  // 產生導出文字
  const buildExportText = (): string => {
    const lines: string[] = [];
    lines.push(`${t('summaryExport.gameSummary')}${currentGame.name}`);
    lines.push(`${t('summaryExport.start')}${new Date(currentGame.startTime).toLocaleString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN')}`);
    if (currentGame.endTime) {
      lines.push(`${t('summaryExport.end')}${new Date(currentGame.endTime as any).toLocaleString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN')}`);
    }
    lines.push('');
    lines.push(`— ${t('summary.financialStatement')} —`);
    lines.push(`${t('summary.totalBuyIn')}：$${totalBuyIn.toLocaleString()}`);
    lines.push(`${t('summary.totalCashOut')}：$${totalCashOut.toLocaleString()}`);
    if (currentGame.gameMode === 'noRake') {
      lines.push(`${t('summary.totalEntryFee')}：$${totalEntryFee.toLocaleString()}`);
    } else {
      lines.push(`${t('summary.totalRake')}：$${totalRake.toLocaleString()}`);
    }
    lines.push(`${t('summary.totalTips')}：$${totalTips.toLocaleString()}`);
    lines.push(`${t('summary.totalExpenses')}：$${totalExpenses.toLocaleString()}`);
    lines.push(`${t('summary.dealerSalary')}：$${totalDealerSalary.toLocaleString()}`);
    lines.push(`${t('summary.insuranceProfitLoss')}：${insuranceProfit >= 0 ? '+' : ''}$${Math.abs(insuranceProfit).toLocaleString()}`);
    lines.push(`${t('summary.netIncome')}：${netIncome >= 0 ? '+' : ''}$${Math.abs(netIncome).toLocaleString()}`);
    lines.push(`${t('summary.actualReceipts')}：$${actualReceipts.toLocaleString()}`);
    lines.push(`${isBalanced ? t('summary.balanced') : t('summary.unbalanced')}${isBalanced ? '' : `：${difference > 0 ? '+' : ''}$${Math.abs(difference).toLocaleString()}`}`);
    lines.push('');
    lines.push(`— ${t('summary.expenseRecords')} —`);
    if (currentGame.expenses.length === 0) {
      lines.push(t('summaryExport.none'));
    } else {
      currentGame.expenses.forEach(e => {
        const time = new Date(e.timestamp).toLocaleTimeString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const categoryLabel = expenseCategoryMap[e.category] || e.category;
        const description = e.description ? ` - ${e.description}` : '';
        lines.push(`${time}｜${categoryLabel}${description}｜$${e.amount.toLocaleString()}`);
      });
    }
    lines.push('');
    if ((currentGame.hosts || []).length > 0) {
      lines.push(`— 轉帳明細 —`);
      transferList.forEach(t => {
        lines.push(`${t.from} → ${t.to} 轉帳 $${t.amount.toFixed(0)}`);
      });
    }
    return lines.join('\n');
  };

  const handleExport = async () => {
    try {
      if (!currentGame) {
        showToast(t('summary.exportError') || '沒有進行中的牌局', 'error');
        return;
      }
      
      const text = buildExportText() + '\n\nhttps://lunchips.com';
      if (!text || text.trim().length === 0) {
        showToast(t('summary.exportError') || '導出內容為空', 'error');
        return;
      }
      
      const shareTitle = t('summary.exportSummary') || '牌局總結';
      
      if (Platform.OS === 'web') {
        // Web 平台：使用 Web Share API 調用系統分享面板
        if (typeof navigator !== 'undefined' && navigator.share) {
          try {
            await navigator.share({
              title: shareTitle,
              text: text,
            });
          } catch (shareError: any) {
            // 用戶取消分享時不顯示錯誤
            if (shareError.name !== 'AbortError') {
              throw shareError;
            }
          }
        } else {
          showToast(t('summary.exportError') || '您的瀏覽器不支援分享功能', 'error');
        }
      } else {
        // 移動平台：直接使用 Share API 調用原生分享面板
        // 這會自動顯示系統分享面板，包含所有可用的分享選項
        // （WhatsApp、Airdrop、Line、Copy、保存圖片等）
        try {
          const shareOptions: { message: string; title?: string; url?: string } = { 
            message: text,
          };
          
          // iOS 支援 title，Android 不支援
          if (Platform.OS === 'ios') {
            shareOptions.title = shareTitle;
          }
          
          // 嘗試分享
          const result = await Share.share(shareOptions);
          
          // 檢查分享結果
          // iOS 會返回明確的 action，Android 可能返回 undefined
          if (result && result.action) {
            if (result.action === Share.sharedAction) {
              // 分享成功
              console.log('分享成功', result.activityType || '');
              showToast(t('summary.exportSuccess') || '導出成功', 'success');
            } else if (result.action === Share.dismissedAction) {
              // 用戶取消分享，不顯示錯誤
              console.log('用戶取消分享');
            }
          } else if (Platform.OS === 'android') {
            // Android 上可能返回 undefined，但分享面板已經打開
            // 這種情況下我們認為操作已開始，不顯示錯誤
            // 如果分享失敗，會拋出錯誤被外層 catch 捕獲
            console.log('分享面板已打開（Android）');
          } else if (Platform.OS === 'ios') {
            // iOS 上如果返回 undefined，可能是分享面板已打開但用戶尚未操作
            // 這種情況下不顯示錯誤，靜默處理
            console.log('分享面板已打開（iOS）');
          }
        } catch (shareError: any) {
          // Share.share 拋出的錯誤
          console.error('分享錯誤:', shareError);
          throw shareError;
        }
      }
    } catch (e: any) {
      console.error('導出失敗:', e);
      // 如果用戶取消分享，不顯示錯誤提示
      const isUserCancelled = 
        e?.name === 'AbortError' || 
        e?.message?.includes('User cancelled') || 
        e?.message?.includes('cancel') || 
        e?.message?.includes('Cancel') ||
        e?.code === 'E_SHARING_CANCELLED' ||
        (Platform.OS === 'android' && e?.message?.includes('User did not share')) ||
        (Platform.OS === 'android' && !e?.message) ||
        (Platform.OS === 'ios' && e?.message?.includes('cancel')) ||
        (Platform.OS === 'ios' && e?.message?.includes('Cancel'));
      
      if (isUserCancelled) {
        return;
      }
      
      // 顯示具體的錯誤信息
      console.error('分享錯誤詳情:', {
        name: e?.name,
        message: e?.message,
        code: e?.code,
        platform: Platform.OS,
        error: e,
      });
      const errorMessage = e?.message || e?.toString() || '未知錯誤';
      showToast(t('summary.exportError') || `導出失敗：${errorMessage}`, 'error');
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <Text style={styles.expenseDescription}>{item.description}</Text>
      <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );

  // 計算每個 Host 的數據（兼容舊的 string[] 格式）
  const rawHosts = currentGame.hosts || [];
  const equalShare = rawHosts.length > 0 ? 1 / rawHosts.length : 0;
  
  // 將舊格式轉換為新格式
  const hosts: Host[] = rawHosts.map(h => {
    if (typeof h === 'string') {
      // 舊格式：string
      return {
        name: h,
        cost: 0,
        dealerSalary: 0,
        totalCashOut: 0,
        shareRatio: equalShare,
        transferAmount: 0,
      };
    }
    // 新格式：Host 對象
    return h;
  });
  
  // 計算每個 Host 的玩家盈虧（用於轉帳與展示）
  const profitByHost: Record<string, number> = {};
  hosts.forEach(h => { profitByHost[h.name] = 0; });
  
  currentGame.players
    .filter(p => p.status === 'cashed_out')
    .forEach(p => {
      const cashOutHost = (p as any).cashOutHost as string | undefined;
      if (cashOutHost && profitByHost[cashOutHost] !== undefined) {
        // 依 Host 匯總玩家盈虧（正數 = Host 賠錢給玩家；負數 = Host 從玩家賺錢）
        profitByHost[cashOutHost] += p.profit;
      }
    });
  
  // 計算每個 Host 的 cost（從 expenses 拆分）
  const costByHost: Record<string, number> = {};
  hosts.forEach(h => { costByHost[h.name] = 0; });
  
  currentGame.expenses.forEach(e => {
    if (e.host && costByHost[e.host] !== undefined) {
      costByHost[e.host] += e.amount;
    }
  });
  
  // 計算每個 Host 的 dealerSalary（發牌員薪金）
  const dealerSalaryByHost: Record<string, number> = {};
  hosts.forEach(h => { dealerSalaryByHost[h.name] = 0; });
  
  // 根據發牌員所選 Host 分配薪金；若單一 Host 則自動全部歸該 Host；若無 Host 則平均分配
  currentGame.dealers.forEach(dealer => {
    const tipPortion = dealer.totalTips * (dealer.tipShare / 100);
    const hourlyPortion = dealer.hourlyRate * dealer.workHours;
    const baseSalary = tipPortion + hourlyPortion;
    // 若有自訂薪金預估，統一使用自訂值，確保發牌員介面與總結轉帳使用相同數字
    const salary =
      dealer.estimatedSalary && dealer.estimatedSalary > 0
        ? dealer.estimatedSalary
        : baseSalary;

    let hostName = dealer.host;
    if (!hostName && hosts.length === 1) {
      hostName = hosts[0].name;
    }

    if (hostName && dealerSalaryByHost[hostName] !== undefined) {
      dealerSalaryByHost[hostName] += salary;
    } else if (hosts.length > 0) {
      // 沒有指定 Host 時平均分配，避免遺漏薪金
      const perHost = salary * equalShare;
      hosts.forEach(h => {
        dealerSalaryByHost[h.name] += perHost;
      });
    }
  });
  
  // 更新 Host 數據並計算 transferAmount
  // 收入分成 = 實際收賬（＝財務報表的實際收賬） × 分成比例
  // 實際收賬 = 總買入 - 總兌現 - 總支出 - 發牌員薪金 - 保險損益
  // 注意：實際收賬已經扣除了保險損益，所以分成基於實際收賬（不含保險）
  
  const updatedHosts: Host[] = hosts.map(h => {
    const playerProfit = profitByHost[h.name] || 0;
    const playerCollected = -playerProfit; // Host 從玩家實際收取的金額（玩家總盈虧 × -1，不含保險）
    const cost = costByHost[h.name] || 0;
    const dealerSalary = dealerSalaryByHost[h.name] || 0;
    const shareRatio = h.shareRatio || equalShare;
    
    // Host 應得分成 = 實際收賬 × shareRatio（基於財務報表的實際收賬）
    // Host 核心牌局實際「賺到的金額」 = playerCollected - cost - dealerSalary（不含保險）
    // transferAmount 只比較「核心牌局實際收入」與「應得分成」，保險獨立顯示、不影響轉帳
    //   > 0 代表多賺了，需要「應付」給其他 Host
    //   < 0 代表少賺了，需要「應收」其他 Host 補給
    const shareAmount = actualReceipts * shareRatio;
    const transferAmount = Math.round((playerCollected - cost - dealerSalary) - shareAmount);
    
    return {
      ...h,
      totalCashOut: playerCollected,
      cost,
      dealerSalary,
      transferAmount,
    };
  });

  // 計算保險相關收支（Host & 分成者），以及保險專用轉帳明細
  // insuranceByName：每個人（Host 或保險分成者）的保險淨收支
  // insuranceTransfers：保險轉帳箭頭（支付者 → 收款者 轉帳 $X）- 整合同一分成者
  const insuranceByName: Record<string, number> = {};
  // 使用 Map 來整合同一對 from-to 的轉帳金額
  const insuranceTransferMap: Record<string, { from: string; to: string; amount: number }> = {};

  currentGame.insurances.forEach(ins => {
    const amt = ins.amount || 0; // >0：這筆保險整體贏錢；<0：整體輸錢
    const partners = ins.partners || [];
    if (!partners.length || updatedHosts.length === 0 || !amt) return;

    // 以「核心轉帳明細中應付的 Host」（transferAmount > 0）作為保險的 Host
    const mainPayer =
      updatedHosts.find(h => h.transferAmount > 0.01) || updatedHosts[0];
    if (!mainPayer) return;
    const mainHostName = mainPayer.name;

    if (insuranceByName[mainHostName] === undefined) {
      insuranceByName[mainHostName] = 0;
    }

    const totalPct = partners.reduce((s, p) => s + (p.percentage || 0), 0) || 100;

    partners.forEach(p => {
      const pct = (p.percentage || 0) / totalPct;
      const shareAbs = Math.round(Math.abs(amt) * pct); // 四捨五入為整數

      if (insuranceByName[p.name] === undefined) {
        insuranceByName[p.name] = 0;
      }

      if (amt > 0) {
        // 保險整體贏錢：
        // Host 從玩家贏到 amt，再按分成把利潤付給夥伴
        // → Host 對每個分成者支付 shareAbs
        insuranceByName[mainHostName] -= shareAbs;
        insuranceByName[p.name] += shareAbs;
        // 整合同一分成者的轉帳（金額已四捨五入為整數）
        const key = `${mainHostName}→${p.name}`;
        if (insuranceTransferMap[key]) {
          insuranceTransferMap[key].amount += shareAbs;
        } else {
          insuranceTransferMap[key] = {
            from: mainHostName,
            to: p.name,
            amount: shareAbs,
          };
        }
      } else if (amt < 0) {
        // 保險整體輸錢：
        // Host 幫玩家賠了 |amt|，分成者按比例補回 shareAbs 給 Host
        // → 每個分成者支付 shareAbs 給 Host
        insuranceByName[mainHostName] += shareAbs;
        insuranceByName[p.name] -= shareAbs;
        // 整合同一分成者的轉帳（金額已四捨五入為整數）
        const key = `${p.name}→${mainHostName}`;
        if (insuranceTransferMap[key]) {
          insuranceTransferMap[key].amount += shareAbs;
        } else {
          insuranceTransferMap[key] = {
            from: p.name,
            to: mainHostName,
            amount: shareAbs,
          };
        }
      }
    });
  });

  // 將 Map 轉換為陣列，並處理正負相抵
  const insuranceTransfers: Array<{ from: string; to: string; amount: number }> = [];
  const processedPairs = new Set<string>();
  
  Object.values(insuranceTransferMap).forEach(transfer => {
    const reverseKey = `${transfer.to}→${transfer.from}`;
    const forwardKey = `${transfer.from}→${transfer.to}`;
    
    // 如果已處理過這對，跳過
    if (processedPairs.has(forwardKey) || processedPairs.has(reverseKey)) {
      return;
    }
    
    const reverseTransfer = insuranceTransferMap[reverseKey];
    
      if (reverseTransfer) {
      // 有反向轉帳，計算淨額
      const netAmount = Math.round(transfer.amount - reverseTransfer.amount);
      processedPairs.add(forwardKey);
      processedPairs.add(reverseKey);
      
      if (Math.abs(netAmount) > 0.01) {
        if (netAmount > 0) {
          insuranceTransfers.push({
            from: transfer.from,
            to: transfer.to,
            amount: netAmount,
          });
        } else {
          insuranceTransfers.push({
            from: transfer.to,
            to: transfer.from,
            amount: -netAmount,
          });
        }
      }
    } else {
      // 沒有反向轉帳，直接加入
      processedPairs.add(forwardKey);
      const roundedAmount = Math.round(transfer.amount);
      if (roundedAmount > 0.01) {
        insuranceTransfers.push({
          ...transfer,
          amount: roundedAmount,
        });
      }
    }
  });

  // 生成轉帳明細的函數
  const generateTransfers = (): Array<{ from: string; to: string; amount: number }> => {
    const epsilon = 0.01;

    // 只保留需要轉帳的 Host（忽略接近 0 的金額）
    const payers = updatedHosts
      .filter(h => h.transferAmount > epsilon)
      .map(h => ({ name: h.name, amount: h.transferAmount }))
      .sort((a, b) => b.amount - a.amount); // 大到小

    const receivers = updatedHosts
      .filter(h => h.transferAmount < -epsilon)
      .map(h => ({ name: h.name, amount: -h.transferAmount })) // 轉成正數，代表要收多少
      .sort((a, b) => b.amount - a.amount); // 大到小

    const transfers: Array<{ from: string; to: string; amount: number }> = [];

    let i = 0; // payers index
    let j = 0; // receivers index

    while (i < payers.length && j < receivers.length) {
      const payer = payers[i];
      const receiver = receivers[j];

      const transferAmount = Math.round(Math.min(payer.amount, receiver.amount));

      if (transferAmount > epsilon) {
        transfers.push({
          from: payer.name,
          to: receiver.name,
          amount: transferAmount,
        });
      }

      payer.amount -= transferAmount;
      receiver.amount -= transferAmount;

      if (payer.amount <= epsilon) {
        i++;
      }
      if (receiver.amount <= epsilon) {
        j++;
      }
    }

    return transfers;
  };

  const transferList = generateTransfers();

  const absInsuranceSum = currentGame.insurances.reduce((s, ins) => s + Math.abs(ins.amount || 0), 0);
  const partnerMap: Record<string, { amount: number; weightedPctNumerator: number }> = {};
  currentGame.insurances.forEach(ins => {
    const amt = ins.amount || 0;
    (ins.partners || []).forEach(p => {
      if (!partnerMap[p.name]) partnerMap[p.name] = { amount: 0, weightedPctNumerator: 0 };
      partnerMap[p.name].amount += amt * (p.percentage / 100);
      partnerMap[p.name].weightedPctNumerator += Math.abs(amt) * p.percentage;
    });
  });
  const partnerRows = Object.keys(partnerMap).map(name => {
    const rec = partnerMap[name];
    const weightedPct = absInsuranceSum > 0 ? rec.weightedPctNumerator / absInsuranceSum : 0;
    return { name, pct: Math.round(weightedPct), amount: rec.amount };
  });

  // 玩家總盈虧（用於玩家列表底部顯示）
  const totalPlayerProfit = currentGame.players.reduce((sum, p) => sum + (p.profit || 0), 0);

  // 計算每個 Host 負責的總金額（支出 + 發牌員薪金）— 用於轉帳明細區塊
  const hostTotalByHost: { name: string; total: number }[] = updatedHosts.map(h => ({
    name: h.name,
    total: (h.cost || 0) + (h.dealerSalary || 0),
  }));

  // 計算每個 Host 的「已收取 / 已支付」總額（玩家總盈虧 * -1）— 用於玩家列表底部
  const hostPlayerCashOutTotalByHost: { name: string; total: number }[] = hosts.map(h => ({
    name: h.name,
    total: -(profitByHost[h.name] || 0),
  }));

  // 僅計算每個 Host 負責的支出總數（不含發牌員薪金）
  const hostExpenseTotalByHost: { name: string; total: number }[] = hosts.map(h => ({
    name: h.name,
    total: costByHost[h.name] || 0,
  }));

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* 頂部關閉按鈕 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={1}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
          decelerationRate="fast"
        >
          {/* 牌局設定卡片（整合牌局資訊和分成設定） */}
          <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => setProfitShareExpanded(!profitShareExpanded)}
              activeOpacity={1}
            >
              <View style={styles.headerLeft}>
                <Icon name="table" size={28} style={styles.headerIcon} />
                <Text style={styles.cardTitle}>牌局設定</Text>
              </View>
              <Text style={styles.expandIcon}>{profitShareExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            
            {profitShareExpanded && (
              <View style={styles.cardContent}>
                {/* 牌局名稱 */}
                <View style={[styles.infoRow, { marginBottom: theme.spacing.md }]}>
                  <Text style={styles.infoLabel}>{t('summary.gameName')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.infoValue}>{currentGame.name}</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setEditType('gameName');
                        setEditModalVisible(true);
                      }} 
                      style={{ marginLeft: theme.spacing.sm }}
                    >
                      <Image 
                        source={colorMode === 'dark' 
                          ? EditBlackIconImage 
                          : EditIconImage} 
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Host名稱 - 在牌局名稱下一行，只顯示一行 */}
                <View style={[styles.infoRow, { marginBottom: theme.spacing.md }]}>
                  <Text style={styles.infoLabel}>Host</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                    <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>
                      {hosts.map(h => h.name).join(', ')}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setHostEditModalVisible(true);
                      }} 
                      style={{ marginLeft: theme.spacing.sm }}
                    >
                      <Image 
                        source={colorMode === 'dark' 
                          ? EditBlackIconImage 
                          : EditIconImage} 
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* 小盲/大盲 */}
                <View style={[styles.infoRow, { marginBottom: theme.spacing.md }]}>
                  <Text style={styles.infoLabel}>{t('summary.blinds')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.infoValue}>
                      {formatCurrency(currentGame.smallBlind)}/{formatCurrency(currentGame.bigBlind)}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setEditType('blinds');
                        setEditModalVisible(true);
                      }} 
                      style={{ marginLeft: theme.spacing.sm }}
                    >
                      <Image 
                        source={colorMode === 'dark' 
                          ? EditBlackIconImage 
                          : EditIconImage} 
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* 盈利分成 */}
                <View style={{ marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                  <Text style={[styles.infoLabel, { marginBottom: theme.spacing.sm }]}>盈利分成</Text>
                  {hostShares.map((host, index) => (
                    <View key={index} style={[styles.infoRow, { marginBottom: theme.spacing.md }]}>
                      <Text style={styles.infoLabel}>{host.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          style={{
                            width: 80,
                            paddingVertical: theme.spacing.xs,
                            paddingHorizontal: theme.spacing.sm,
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                            borderRadius: theme.borderRadius.sm,
                            textAlign: 'right',
                            color: theme.colors.text,
                            backgroundColor: theme.colors.surface,
                          }}
                          value={hostInputs[index] || '0'}
                          onChangeText={(value) => {
                            const numericValue = value.replace(/[^0-9.]/g, '');
                            const newInputs = [...hostInputs];
                            newInputs[index] = numericValue;
                            setHostInputs(newInputs);
                          }}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                        <Text style={{ marginLeft: 4, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>%</Text>
                      </View>
                    </View>
                  ))}
                  <Button
                    title="儲存"
                    onPress={handleSaveProfitShare}
                    variant="primary"
                    size="md"
                    style={{ marginTop: theme.spacing.md }}
                  />
                </View>
              </View>
            )}
          </View>
          

          {/* 財務報表卡片 */}
          <View style={[styles.expandableCard, styles.financialCard]}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => setFinancialExpanded(!financialExpanded)}
              activeOpacity={1}
            >
              <View style={styles.headerLeft}>
                <Icon name="cost" size={42} style={[styles.headerIcon, { marginTop: -4 }]} />
                <Text style={[styles.cardTitle, styles.financialTitle]}>{t('summary.financialStatement')}</Text>
              </View>
              <Text style={styles.expandIcon}>{financialExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            
            {financialExpanded && (
              <View style={styles.cardContent}>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>{t('summary.totalBuyIn')}</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalBuyIn)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>{t('summary.totalCashOut')}</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalCashOut)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>
                {currentGame.gameMode === 'noRake' ? t('summary.totalEntryFee') : t('summary.totalRake')}
              </Text>
              <Text style={styles.financialValue}>
                {formatCurrency(currentGame.gameMode === 'noRake' ? totalEntryFee : totalRake)}
              </Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>{t('summary.totalTips')}</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalTips)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>{t('summary.totalExpenses')}</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalExpenses)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>{t('summary.dealerSalary')}</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalDealerSalary)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>{t('summary.insuranceProfitLoss')}</Text>
              <Text style={[styles.financialValue, { color: insuranceProfit >= 0 ? getPositiveColor() : theme.colors.error }]}>
                {insuranceProfit >= 0 ? '+' : ''}{formatCurrency(insuranceProfit)}
              </Text>
            </View>
            
            <View style={[styles.totalRow, { borderTopWidth: 0 }]}>
              <Text style={styles.totalLabel}>{t('summary.netIncome')}</Text>
              <Text
                style={[
                  styles.totalValue,
                  {
                    color:
                      colorMode === 'dark'
                        ? netIncome >= 0
                          ? '#10B981'
                          : theme.colors.error
                        : netIncome >= 0
                          ? getPositiveColor()
                          : theme.colors.error,
                  },
                ]}
              >
                {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
              </Text>
            </View>

            {/* 實際收賬與平帳檢查 */}
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>{t('summary.actualReceipts')}</Text>
              <Text
                style={[
                  styles.financialValue,
                  {
                    color:
                      colorMode === 'dark'
                        ? actualReceipts >= 0
                          ? '#10B981'
                          : theme.colors.error
                        : undefined,
                  },
                ]}
              >
                {formatCurrency(actualReceipts)}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={[
                styles.financialLabel,
                {
                  color: isBalanced ? theme.colors.success : theme.colors.error
                }
              ]}>
                {isBalanced ? t('summary.balanced') : t('summary.unbalanced')}
              </Text>
              <Text style={[
                styles.financialValue, 
                { 
                  color: difference >= 0 
                    ? theme.colors.success
                    : theme.colors.error 
                }
              ]}>
                {isBalanced 
                  ? '' 
                  : `${difference >= 0 ? '+' : '-'}$${Math.abs(difference).toLocaleString()}`
                }
              </Text>
            </View>

            {currentGame.gameMode === 'noRake' && (
              <View style={styles.entryFeeSummaryCard}>
                <Text style={styles.entryFeeSummaryTitle}>未扣入場費玩家（需追收）：</Text>
                {playersPendingEntryFee.length === 0 ? (
                  <Text style={styles.entryFeeSummaryItem}>• 全部玩家已完成入場費扣除</Text>
                ) : (
                  playersPendingEntryFee.map((player) => {
                    const fee = calculateEntryFee(player);
                    return (
                      <Text key={player.id} style={styles.entryFeeSummaryItem}>
                        • {player.name} 欠 {formatCurrency(fee)}
                      </Text>
                    );
                  })
                )}
              </View>
            )}

            {/* 顯示詳細計算公式 */}
            <TouchableOpacity
              onPress={() => setFormulaExpanded(!formulaExpanded)}
              activeOpacity={0.7}
              style={{ marginTop: theme.spacing.md }}
            >
              <Text style={{
                fontSize: theme.fontSize.sm,
                color: theme.colors.textSecondary,
                textAlign: 'center',
              }}>
                {t('summary.showFormula') || '顯示詳細計算公式'}
              </Text>
            </TouchableOpacity>

            {formulaExpanded && (
              <View style={{
                marginTop: theme.spacing.md,
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.sm,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}>
                <Text style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.text,
                  lineHeight: 22,
                  marginBottom: theme.spacing.xs,
                }}>
                  {t('summary.netIncome')} = {
                    currentGame.gameMode === 'noRake' 
                      ? t('summary.totalEntryFee') 
                      : t('summary.totalRake')
                  } + {t('summary.totalTips')} - {t('summary.totalExpenses')} - {t('summary.dealerSalary')}
                </Text>
                <Text style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.textSecondary,
                  lineHeight: 22,
                }}>
                  = {formatCurrency(revenue)} + {formatCurrency(totalTips)} - {formatCurrency(totalExpenses)} - {formatCurrency(totalDealerSalary)}
                </Text>
                <Text style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.colors.textSecondary,
                  lineHeight: 22,
                  marginTop: theme.spacing.xs,
                }}>
                  = {formatCurrency(netIncome)}
                </Text>
              </View>
            )}
              </View>
            )}
          </View>

          {/* 轉帳明細卡片：Host 數量大於 1 時顯示（內文依據公式產生轉帳明細） */}
          {hosts.length > 1 && (
            <View style={[styles.expandableCard, styles.settlementCard]}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => setSettlementExpanded(!settlementExpanded)}
              activeOpacity={1}
            >
                <View style={styles.headerLeft}>
                  <Icon name="summary" size={28} style={[styles.headerIcon, styles.summaryIcon]} />
                <Text style={styles.cardTitle}>轉帳明細</Text>
              </View>
                <Text style={styles.expandIcon}>{settlementExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {settlementExpanded && (
                <View style={styles.cardContent}>
                  {transferList.length > 0 ? (
                    <FlatList
                      data={transferList}
                      keyExtractor={(item, index) => `${item.from}-${item.to}-${index}`}
                      renderItem={({ item }) => (
                        <View style={styles.transferRow}>
                          <Text style={styles.transferText}>
                            {item.from} → {item.to} 轉帳 {formatCurrency(item.amount)}
                          </Text>
                        </View>
                      )}
                      scrollEnabled={false}
                    />
                  ) : (
                    <Text style={styles.noTransferText}>無需轉帳</Text>
                  )}

                  {/* 每個 Host 公式明細：玩家總兌現 / 收取、收入分成、支出、發牌員薪金、應收/應付 */}
                  <View style={{ marginTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm }}>
                    {updatedHosts.map((h) => {
                      const playerNet = profitByHost[h.name] || 0;           // 玩家總盈虧
                      const playerCollected = -playerNet;                    // Host 從玩家收取（或支付）
                      const shareAmount = actualReceipts * (h.shareRatio || equalShare);
                      const statusText =
                        h.transferAmount > 0
                          ? `應付 ${formatCurrency(h.transferAmount)}`
                          : h.transferAmount < 0
                            ? `應收 ${formatCurrency(Math.abs(h.transferAmount))}`
                            : '已結清';

                      return (
                        <View key={h.name} style={{ marginBottom: theme.spacing.md }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.settlementLabel}>{h.name}</Text>
                            <Text
                              style={[
                                styles.settlementValue,
                                h.transferAmount > 0
                                  ? { color: theme.colors.error } // 應付：紅色
                                  : h.transferAmount < 0
                                    ? { color: getPositiveColor() } // 應收：深色模式下為白色
                                    : {},
                              ]}
                            >
                              {statusText}
                            </Text>
                          </View>
                          <Text style={styles.settlementFormula}>
                            {playerCollected >= 0
                              ? `已收取 ${formatCurrency(playerCollected)}`
                              : `已支付 ${formatCurrency(Math.abs(playerCollected))}`}
                          </Text>
                          <Text style={styles.settlementFormula}>
                            收入分成：{formatCurrency(shareAmount)}（實際收賬 {formatCurrency(actualReceipts)} × 分成 {formatPercentage(h.shareRatio || equalShare)}%）
                          </Text>
                          <Text style={styles.settlementFormula}>
                            支出金額：{formatCurrency(h.cost || 0)}
                          </Text>
                          <Text style={styles.settlementFormula}>
                            發牌員薪金：{formatCurrency(h.dealerSalary || 0)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* 保險轉帳明細（箭頭＋匯總）：放在同一區塊，副標題在最上方 */}
                  {Object.keys(insuranceByName).filter(name => Math.abs(insuranceByName[name]) > 0.01).length > 0 && (
                    <View
                      style={{
                        marginTop: theme.spacing.lg,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.border,
                        paddingTop: theme.spacing.md,
                      }}
                    >
                      <View style={[styles.settlementRow, { marginBottom: theme.spacing.xs }]}>
                        <Text style={[styles.settlementLabel, { fontWeight: '600' }]}>
                          {t('summary.insuranceSettlement') || '保險轉帳明細'}
                        </Text>
                      </View>

                      {/* 保險轉帳列表：支付者 → 收款者 轉帳 $XXX（緊接在副標題下方） */}
                      {insuranceTransfers.length > 0 && (
                        <View style={{ marginBottom: theme.spacing.sm }}>
                          {insuranceTransfers.map((tr, index) => (
                            <View key={`${tr.from}-${tr.to}-${index}`} style={styles.transferRow}>
                              <Text style={styles.transferText}>
                                {tr.from} → {tr.to} 轉帳 {formatCurrency(tr.amount)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* 保險轉帳明細（匯總）：每個人（Host / 分成者）應收 / 應付，顯示在箭頭列表下方 */}
                      {Object.keys(insuranceByName)
                        .filter(name => Math.abs(insuranceByName[name]) > 0.01)
                        .map(name => {
                          const amount = insuranceByName[name];
                          const isReceive = amount > 0;
                          const label =
                            isReceive
                              ? `${t('summary.shouldReceive') || '應收'} ${formatCurrency(amount)}`
                              : `${t('summary.shouldPay') || '應付'} ${formatCurrency(Math.abs(amount))}`;
                          return (
                            <View key={name} style={styles.settlementRow}>
                              <Text style={styles.settlementLabel}>{name}</Text>
                              <Text
                                style={[
                                  styles.settlementValue,
                                  isReceive ? { color: getPositiveColor() } : { color: theme.colors.error },
                                ]}
                              >
                                {label}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* 入場費明細（不抽水模式時顯示） */}
          {currentGame.gameMode === 'noRake' && currentGame.players.length > 0 && (
            <View style={styles.expandableCard}>
              <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => setEntryFeeExpanded(!entryFeeExpanded)}
                activeOpacity={1}
              >
              <View style={styles.headerLeft}>
                <Icon name="rake" size={28} style={styles.headerIcon} />
                  <Text style={styles.cardTitle}>{t('summary.entryFeeDetails')}</Text>
                </View>
                <Text style={styles.expandIcon}>{entryFeeExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {entryFeeExpanded && (
                <View style={styles.cardContent}>
                  <View style={styles.entryFeeList}>
                    {currentGame.players.map((player) => {
                      const fee = calculateEntryFee(player);
                      const baseFee = calculateBaseEntryFee(player);
                      const isCustom = player.customEntryFee !== undefined;
                      return (
                        <TouchableOpacity
                          key={player.id}
                          style={styles.entryFeeRow}
                          onPress={() => {
                            setEditingPlayer(player);
                            setEditEntryFeeVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.entryFeePlayerName}>{player.name}</Text>
                            {isCustom && (
                              <Text style={styles.entryFeeCustomLabel}>
                                {t('entryFee.custom') || '自訂'}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.entryFeeAmount}>
                            {fee > 0 ? formatCurrency(fee) : t('summary.free')}
                          </Text>
                          <Icon 
                            name="settings" 
                            size={20} 
                            style={{ marginLeft: theme.spacing.sm, color: theme.colors.textSecondary }}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  
                  {/* 總入場費 */}
                  <View style={styles.entryFeeTotalRow}>
                    <Text style={styles.entryFeeTotalLabel}>{t('summary.totalEntryFee')}</Text>
                    <Text style={[styles.entryFeeTotalAmount, { color: '#FFD700' }]}>
                      {formatCurrency(totalEntryFee)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 玩家列表卡片 */}
          <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => setPlayersExpanded(!playersExpanded)}
              activeOpacity={1}
            >
              <View style={styles.headerLeft}>
                <Icon name="player2" size={28} style={styles.headerIcon} />
                <Text style={styles.cardTitle}>{t('summary.playerList')}</Text>
              </View>
              <Text style={styles.expandIcon}>{playersExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            
            {playersExpanded && (
              <View style={styles.cardContent}>
                <View style={styles.playersList}>
                  <View style={styles.playersItemsContainer}>
                    {currentGame.players.map((player, index) => {
                      const cashOutHost = (player as any).cashOutHost as string | undefined;
                      return (
                        <TouchableOpacity 
                          key={index} 
                          style={styles.playerItem}
                          onPress={() => {
                            setSelectedPlayer(player);
                            setPlayerDetailsVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          {/* 玩家狀態（右上角） */}
                          <Text style={styles.playerStatus}>
                            {player.status === 'cashed_out' ? '已兌現' : '進行中'}
                          </Text>
                          <View style={styles.playerHeaderRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.playerName}>{player.name}</Text>
                              <Text style={styles.playerBuyIn}>
                                {t('game.buyIn')}: {formatCurrency(player.buyIn)}
                              </Text>
                              <Text style={[
                                styles.playerProfit,
                                player.profit >= 0 ? styles.positiveProfit : styles.negativeProfit
                              ]}>
                                {player.profit >= 0 ? '+' : ''}{formatCurrency(player.profit)}
                              </Text>
                            </View>
                            {!!cashOutHost && (
                              <Text style={styles.playerHost}>
                                負責 Host：{cashOutHost}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 玩家列表底部：先顯示玩家總盈虧，再顯示每個 Host 玩家總盈虧 * -1 
                      total > 0 → 已收取 total（例如玩家合計 -300，Host 收取 300）
                      total < 0 → 已支付 |total|
                  */}
                  {hosts.length > 1 && (
                    <View style={{ marginTop: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                        <Text style={styles.settlementLabel}>玩家總盈虧</Text>
                        <Text
                          style={[
                            styles.settlementValue,
                            { color: totalPlayerProfit >= 0 ? getPositiveColor() : theme.colors.error },
                          ]}
                        >
                          {totalPlayerProfit >= 0 ? '+' : ''}
                          {formatCurrency(totalPlayerProfit)}
                        </Text>
                      </View>
                      {hostPlayerCashOutTotalByHost.map((h) => (
                        <View key={h.name} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                          <Text style={styles.settlementLabel}>{h.name}</Text>
                          <Text style={styles.settlementValue}>
                            {h.total >= 0
                              ? `已收取 ${formatCurrency(h.total)}`
                              : `已支付 ${formatCurrency(Math.abs(h.total))}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* 支出記錄卡片 */}
          {currentGame.expenses.length > 0 && (
            <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => setExpensesExpanded(!expensesExpanded)}
              activeOpacity={1}
            >
                <View style={styles.headerLeft}>
                  <Icon name="cost" size={28} style={styles.headerIcon} />
                <Text style={styles.cardTitle}>{t('summary.expenseRecords')}</Text>
              </View>
                <Text style={styles.expandIcon}>{expensesExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {expensesExpanded && (
                <View style={styles.cardContent}>
                  <View style={styles.expenseItemsContainer}>
                    {currentGame.expenses.map((expense, index) => {
                      const hosts = currentGame.hosts || [];
                      const showHost = hosts.length > 1 && expense.host;
                      return (
                        <View key={index} style={styles.expenseItem}>
                          <Text style={styles.expenseDescription}>
                            {expenseCategoryMap[expense.category] || expense.category}
                            {showHost ? ` · ${expense.host}` : ''}
                            {expense.description ? ` - ${expense.description}` : ''}
                          </Text>
                          <Text style={styles.expenseAmount}>
                            {formatCurrency(expense.amount)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* 支出卡片底部：先顯示總支出金額，再顯示每個 Host 負責支出總數（不含發牌員薪金） */}
                  {(() => {
                    const hosts = currentGame.hosts || [];
                    return hosts.length > 1 ? (
                      <View style={{ marginTop: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                          <Text style={styles.settlementLabel}>總支出</Text>
                          <Text
                            style={[
                              styles.settlementValue,
                              { color: theme.colors.error },
                            ]}
                          >
                            {formatCurrency(totalExpenses)}
                          </Text>
                        </View>
                        {hostExpenseTotalByHost.map((h) => (
                          <View key={h.name} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
                            <Text style={styles.settlementLabel}>{h.name}</Text>
                            <Text style={styles.settlementValue}>{formatCurrency(h.total)}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null;
                  })()}
                </View>
              )}
            </View>
          )}

          {/* 保險記錄卡片（保險分成 + 記錄細項） */}
          {partnerRows.length > 0 && (
            <View style={styles.expandableCard}>
              <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => setInsuranceExpanded(!insuranceExpanded)}
                activeOpacity={1}
              >
                <View style={styles.headerLeft}>
                  <Icon name="insurance" size={28} style={styles.headerIcon} />
                  <Text style={styles.cardTitle}>{t('game.functions.insurance')}</Text>
                </View>
                <Text style={styles.expandIcon}>{insuranceExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {insuranceExpanded && (
                <View style={styles.cardContent}>
                  {/* 保險分成概覽（百分比與金額） */}
                  {partnerRows.length > 0 && (
                    <>
                      <View
                        style={[
                          styles.settlementRow,
                          {
                            marginTop: theme.spacing.md,
                            paddingTop: theme.spacing.md,
                            borderTopWidth: 1,
                            borderTopColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.settlementLabel, { fontWeight: '600' }]}>
                          {t('summary.insuranceShare') || '保險分成'}
                        </Text>
                      </View>
                      {partnerRows.map((partner, index) => (
                        <View key={index} style={styles.settlementRow}>
                          <Text style={styles.settlementLabel}>
                            {partner.name} ({partner.pct}%)
                          </Text>
                          <Text
                            style={[
                              styles.settlementValue,
                              { color: partner.amount >= 0 ? getPositiveColor() : theme.colors.error },
                            ]}
                          >
                            {partner.amount >= 0 ? '+' : ''}{formatCurrency(partner.amount)}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}

                  {/* 保險記錄細項 */}
                  {currentGame.insurances.length > 0 && (
                    <>
                      <View
                        style={[
                          styles.settlementRow,
                          {
                            marginTop: theme.spacing.md,
                            paddingTop: theme.spacing.md,
                            borderTopWidth: 1,
                            borderTopColor: theme.colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.settlementLabel, { fontWeight: '600' }]}>
                          {t('summary.insuranceRecords')}
                        </Text>
                      </View>
                      {currentGame.insurances
                        .slice()
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map(ins => {
                          const amt = ins.amount || 0;
                          return (
                            <View key={ins.id} style={styles.settlementRow}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.settlementLabel}>
                                  {new Date(ins.timestamp).toLocaleString(
                                    language === 'zh-TW' ? 'zh-TW' : 'zh-CN',
                                  )}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.settlementValue,
                                  { color: amt >= 0 ? getPositiveColor() : theme.colors.error },
                                ]}
                              >
                                {amt >= 0 ? '+' : ''}{formatCurrency(amt)}
                              </Text>
                            </View>
                          );
                        })}
                    </>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* 導出牌局總結按鈕 */}
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm }}>
          <Button
            title={t('summary.exportSummary')}
            onPress={handleExport}
            variant="primary"
            size="md"
            style={{ 
              width: '100%',
              paddingVertical: theme.spacing.xs, // 收窄按鈕上下空白空間
            }}
          />
        </View>
      </SafeAreaView>

      {/* 編輯玩家入場費 Modal */}
      {editingPlayer && currentGame && (
        <PlayerEntryFeeEditModal
          visible={editEntryFeeVisible}
          onClose={() => {
            setEditEntryFeeVisible(false);
            setEditingPlayer(null);
          }}
          player={editingPlayer}
          calculatedFee={calculateBaseEntryFee(editingPlayer)}
          onSave={(playerId, customEntryFee) => {
            const player = currentGame.players.find(p => p.id === playerId);
            if (player) {
              updatePlayer(currentGame.id, {
                ...player,
                customEntryFee,
              });
            }
          }}
        />
      )}

      {/* 牌局設定編輯視窗 */}
      <GameSettingsEditModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditType(null);
          setEditHostIndex(undefined);
        }}
        editType={editType}
        hostIndex={editHostIndex}
      />

      {/* Host 編輯視窗 */}
      <HostEditModal
        visible={hostEditModalVisible}
        onClose={() => {
          setHostEditModalVisible(false);
        }}
      />

      {/* 玩家買入視窗 */}
      <PlayerDetailsModal
        visible={playerDetailsVisible}
        onClose={() => {
          setPlayerDetailsVisible(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
      />
    </View>
  );
};

export default GameSummaryModal;
