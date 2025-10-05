import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { Expense } from '../types/game';
import Icon from './Icon';

interface GameSummaryModalProps {
  visible: boolean;
  onClose: () => void;
}

const GameSummaryModal: React.FC<GameSummaryModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { state } = useGame();
  
  console.log('GameSummaryModal visible:', visible);

  const currentGame = state.currentGame;
  
  // 展開狀態管理
  const [gameInfoExpanded, setGameInfoExpanded] = useState(false);
  const [financialExpanded, setFinancialExpanded] = useState(false);
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const [expensesExpanded, setExpensesExpanded] = useState(false);
  const [settlementExpanded, setSettlementExpanded] = useState(false);

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
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.border,
    },
    closeButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.textSecondary,
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
      ...(theme.colorMode === 'light' ? {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      } : {}),
    },
    cardTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
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
      borderBottomColor: theme.colors.primary + '20',
    },
    financialLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      flex: 1,
    },
    financialValue: {
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
      borderTopWidth: 2,
      borderTopColor: theme.colors.primary,
      marginTop: theme.spacing.sm,
    },
    totalLabel: {
      fontSize: theme.fontSize.lg,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    totalValue: {
      fontSize: theme.fontSize.lg,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    playersList: {
      marginBottom: theme.spacing.lg,
    },
    playerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      marginRight: theme.spacing.md,
    },
    playerProfit: {
      fontSize: theme.fontSize.md,
      fontWeight: '700',
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
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    expenseDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      flex: 1,
    },
    expenseAmount: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.error,
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
    cellStrong: { 
      fontWeight: '700' 
    },
    // 可展開卡片樣式
    expandableCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...(theme.colorMode === 'light' ? {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      } : {}),
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '30',
    },
    cardTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    expandIcon: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
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
            <Text style={styles.emptyText}>沒有進行中的牌局</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatDuration = (start: any, end?: any) => {
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return '--';
    const diff = e.getTime() - s.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}小時 ${minutes}分鐘`;
  };

  // 計算財務統計
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
    return sum + tipPortion + hourlyPortion;
  }, 0);

  const insuranceProfit = currentGame.insurances.reduce((sum, ins) => sum + (ins.amount || 0), 0);
  const netIncome = currentGame.players.reduce((sum, p) => sum + p.profit, 0);

  // 實際收賬：所有已兌現玩家帶回的金額總和
  const actualReceipts = currentGame.players
    .filter(p => p.status === 'cashed_out')
    .reduce((sum, p) => sum + p.buyIn + p.profit, 0);
  
  // 計算平帳狀態和差距
  const expectedAmount = netIncome + totalRake + totalTips - totalExpenses;
  const isBalanced = Math.abs(actualReceipts - expectedAmount) < 0.01; // 允許小數點誤差
  const difference = actualReceipts - expectedAmount;

  // 產生導出文字
  const buildExportText = (): string => {
    const lines: string[] = [];
    lines.push(`【牌局總結】${currentGame.name}`);
    lines.push(`開始：${new Date(currentGame.startTime).toLocaleString('zh-TW')}`);
    if (currentGame.endTime) {
      lines.push(`結束：${new Date(currentGame.endTime as any).toLocaleString('zh-TW')}`);
    }
    lines.push('');
    lines.push('— 財務報表 —');
    lines.push(`總買入：$${totalBuyIn.toLocaleString()}`);
    lines.push(`總兌現：$${totalCashOut.toLocaleString()}`);
    lines.push(`總抽水：$${totalRake.toLocaleString()}`);
    lines.push(`總小費：$${totalTips.toLocaleString()}`);
    lines.push(`總支出：$${totalExpenses.toLocaleString()}`);
    lines.push(`發牌員薪金：$${totalDealerSalary.toLocaleString()}`);
    lines.push(`保險損益：${insuranceProfit >= 0 ? '+' : ''}$${Math.abs(insuranceProfit).toLocaleString()}`);
    lines.push(`淨收入：${netIncome >= 0 ? '+' : ''}$${Math.abs(netIncome).toLocaleString()}`);
    lines.push(`實際收賬：$${actualReceipts.toLocaleString()}`);
    lines.push(`${isBalanced ? '平帳' : '不平帳'}${isBalanced ? '' : `：${difference > 0 ? '+' : ''}$${Math.abs(difference).toLocaleString()}`}`);
    lines.push('');
    lines.push('— 支出紀錄 —');
    if (currentGame.expenses.length === 0) {
      lines.push('無');
    } else {
      currentGame.expenses.forEach(e => {
        const time = new Date(e.timestamp).toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        lines.push(`${time}｜${e.description || '無描述'}｜$${e.amount.toLocaleString()}`);
      });
    }
    lines.push('');
    if ((currentGame.hosts || []).length > 0) {
      lines.push('— 結算明細 —');
      settlementRows.forEach(r => {
        lines.push(`${r.host}：${r.amount >= 0 ? '+' : ''}$${Math.abs(r.amount).toLocaleString()}`);
      });
    }
    return lines.join('\n');
  };

  const handleExport = async () => {
    try {
      const text = buildExportText();
      await Share.share({ message: text });
    } catch (e) {
      // no-op（Share 取消或失敗不阻塞）
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <Text style={styles.expenseDescription}>{item.description}</Text>
      <Text style={styles.expenseAmount}>-{formatCurrency(item.amount)}</Text>
    </View>
  );

  // 分成及應轉金額計算
  const hosts: string[] = currentGame.hosts || [];
  const equalShare = hosts.length > 0 ? 1 / hosts.length : 0;
  const receiptsByHost: Record<string, number> = {};
  const expensesByHost: Record<string, number> = {};
  hosts.forEach(h => { receiptsByHost[h] = 0; expensesByHost[h] = 0; });
  
  currentGame.players
    .filter(p => p.status === 'cashed_out')
    .forEach(p => {
      const cashOutHost = (p as any).cashOutHost as string | undefined;
      const cashOutAmount = p.buyIn + p.profit;
      if (cashOutHost && receiptsByHost[cashOutHost] !== undefined) {
        receiptsByHost[cashOutHost] += cashOutAmount;
      }
    });
  
  currentGame.expenses.forEach(e => {
    if (e.host && expensesByHost[e.host] !== undefined) {
      expensesByHost[e.host] += e.amount;
    }
  });

  const settlementRows = hosts.map(h => {
    const receipt = receiptsByHost[h] || 0;
    const expense = expensesByHost[h] || 0;
    const share = equalShare;
    const amount = -receipt + expense + netIncome * share;
    return { host: h, receipt, expense, share, amount };
  });

  const totalCheck = settlementRows.reduce((s, r) => s + r.amount, 0);

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

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* 頂部關閉按鈕 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={1}>
            <Text style={styles.closeButtonText}>關閉</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
          bounces={true}
          decelerationRate="fast"
        >
          {/* 牌局資訊卡片 */}
          <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => setGameInfoExpanded(!gameInfoExpanded)}
              activeOpacity={1}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="table" size={32} style={{ marginRight: theme.spacing.sm }} />
                <Text style={styles.cardTitle}>牌局資訊</Text>
              </View>
              <Text style={styles.expandIcon}>{gameInfoExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            
            {gameInfoExpanded && (
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>牌局名稱</Text>
                  <Text style={styles.infoValue}>{currentGame.name}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>開始時間</Text>
                  <Text style={styles.infoValue}>
                    {new Date(currentGame.startTime).toLocaleString('zh-TW')}
                  </Text>
                </View>
                
                {currentGame.endTime && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>結束時間</Text>
                    <Text style={styles.infoValue}>
                      {new Date(currentGame.endTime as any).toLocaleString('zh-TW')}
                    </Text>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>牌局時長</Text>
                  <Text style={styles.infoValue}>
                    {formatDuration(currentGame.startTime, currentGame.endTime)}
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>玩家人數</Text>
                  <Text style={styles.infoValue}>{currentGame.players.length} 人</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>小盲/大盲</Text>
                  <Text style={styles.infoValue}>
                    {formatCurrency(currentGame.smallBlind)}/{formatCurrency(currentGame.bigBlind)}
                  </Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="cost" size={32} style={{ marginRight: theme.spacing.sm }} />
                <Text style={[styles.cardTitle, styles.financialTitle]}>財務報表</Text>
              </View>
              <Text style={styles.expandIcon}>{financialExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            
            {financialExpanded && (
              <View style={styles.cardContent}>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>總買入</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalBuyIn)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>總兌現</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalCashOut)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>總抽水</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalRake)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>總小費</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalTips)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>總支出</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalExpenses)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>發牌員薪金</Text>
              <Text style={styles.financialValue}>{formatCurrency(totalDealerSalary)}</Text>
            </View>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>保險損益</Text>
              <Text style={[styles.financialValue, { color: insuranceProfit >= 0 ? theme.colors.success : theme.colors.error }]}>
                {insuranceProfit >= 0 ? '+' : ''}{formatCurrency(insuranceProfit)}
              </Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>淨收入</Text>
              <Text style={[styles.totalValue, { color: netIncome >= 0 ? theme.colors.success : theme.colors.error }]}>
                {netIncome >= 0 ? '+' : ''}{formatCurrency(netIncome)}
              </Text>
            </View>

            {/* 實際收賬與平帳檢查 */}
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>實際收賬</Text>
              <Text style={styles.financialValue}>{formatCurrency(actualReceipts)}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>
                {isBalanced ? '平帳' : '不平帳'}
              </Text>
              <Text style={[
                styles.financialValue, 
                { 
                  color: isBalanced 
                    ? theme.colors.success 
                    : difference > 0 
                      ? theme.colors.success 
                      : theme.colors.error 
                }
              ]}>
                {isBalanced 
                  ? '' 
                  : `${difference > 0 ? '+' : ''}$${Math.abs(difference).toLocaleString()}`
                }
              </Text>
            </View>
              </View>
            )}
          </View>

          {/* 玩家列表卡片 */}
          <View style={styles.expandableCard}>
            <TouchableOpacity 
              style={styles.cardHeader}
              onPress={() => setPlayersExpanded(!playersExpanded)}
              activeOpacity={1}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Icon name="player2" size={32} style={{ marginRight: theme.spacing.sm }} />
                <Text style={styles.cardTitle}>玩家列表</Text>
              </View>
              <Text style={styles.expandIcon}>{playersExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            
            {playersExpanded && (
              <View style={styles.cardContent}>
                <View style={styles.playersList}>
                  {currentGame.players.map((player, index) => (
                    <View key={index} style={styles.playerItem}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerBuyIn}>
                        買入: {formatCurrency(player.buyIn)}
                      </Text>
                      <Text style={[
                        styles.playerProfit,
                        player.profit >= 0 ? styles.positiveProfit : styles.negativeProfit
                      ]}>
                        {player.profit >= 0 ? '+' : ''}{formatCurrency(player.profit)}
                      </Text>
                    </View>
                  ))}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="cost" size={32} style={{ marginRight: theme.spacing.sm }} />
                  <Text style={styles.cardTitle}>支出記錄</Text>
                </View>
                <Text style={styles.expandIcon}>{expensesExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {expensesExpanded && (
                <View style={styles.cardContent}>
                  {currentGame.expenses.map((expense, index) => (
                    <View key={index} style={styles.expenseItem}>
                      <Text style={styles.expenseDescription}>
                        {expense.description || '無描述'}
                      </Text>
                      <Text style={styles.expenseAmount}>
                        -{formatCurrency(expense.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 結算卡片 */}
          {hosts.length > 0 && (
            <View style={[styles.expandableCard, styles.settlementCard]}>
              <TouchableOpacity 
                style={styles.cardHeader}
                onPress={() => setSettlementExpanded(!settlementExpanded)}
                activeOpacity={1}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="summary" size={32} style={{ marginRight: theme.spacing.sm }} />
                  <Text style={styles.cardTitle}>結算明細</Text>
                </View>
                <Text style={styles.expandIcon}>{settlementExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {settlementExpanded && (
                <View style={styles.cardContent}>
                  <View style={styles.settlementHeader}>
                    <Text style={styles.settlementLabel}>Host</Text>
                    <Text style={styles.settlementValue}>應收/應付</Text>
                  </View>
                  
                  {settlementRows.map((row, index) => (
                    <View key={index} style={styles.settlementRow}>
                      <Text style={styles.settlementLabel}>{row.host}</Text>
                      <Text style={[
                        styles.settlementValue,
                        { color: row.amount >= 0 ? theme.colors.success : theme.colors.error }
                      ]}>
                        {row.amount >= 0 ? '+' : ''}{formatCurrency(row.amount)}
                      </Text>
                    </View>
                  ))}
                  
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>總計</Text>
                    <Text style={[
                      styles.totalValue,
                      { color: totalCheck >= 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      {totalCheck >= 0 ? '+' : ''}{formatCurrency(totalCheck)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 保險分成卡片 */}
          {partnerRows.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🛡️ 保險分成</Text>
              {partnerRows.map((partner, index) => (
                <View key={index} style={styles.settlementRow}>
                  <Text style={styles.settlementLabel}>
                    {partner.name} ({partner.pct}%)
                  </Text>
                  <Text style={[
                    styles.settlementValue,
                    { color: partner.amount >= 0 ? theme.colors.success : theme.colors.error }
                  ]}>
                    {partner.amount >= 0 ? '+' : ''}{formatCurrency(partner.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* 導出牌局總結按鈕 */}
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }}>
          <TouchableOpacity
            onPress={handleExport}
            activeOpacity={1}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: theme.fontSize.md }}>導出牌局總結</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default GameSummaryModal;
