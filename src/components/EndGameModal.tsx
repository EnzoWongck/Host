import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Button from './Button';

interface EndGameModalProps {
  visible: boolean;
  onClose: () => void;
}

const EndGameModal: React.FC<EndGameModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { state, endGame } = useGame();
  
  const [actualCollection, setActualCollection] = useState('');
  const [finalNotes, setFinalNotes] = useState('');

  const currentGame = state.currentGame;

  const styles = StyleSheet.create({
    warningCard: {
      backgroundColor: theme.colors.error + '10',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.error,
    },
    warningTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    warningText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },
    summaryCard: {
      backgroundColor: theme.colors.primary + '10',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    summaryTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    summaryValue: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    highlightRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.success + '10',
      borderRadius: theme.borderRadius.sm,
      marginVertical: theme.spacing.sm,
    },
    highlightLabel: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.success,
    },
    highlightValue: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.success,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    balanceInfo: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.lg,
    },
    balanceText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
    },
    cancelButton: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    endGameButton: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
    },
    emptyText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (!currentGame) {
    return (
      <Modal visible={visible} onClose={onClose} title={t('modals.endGame')}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('endGame.noGame')}</Text>
        </View>
      </Modal>
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
    return `${hours}${t('endGame.hours')} ${minutes}${t('endGame.minutes')}`;
  };

  // 計算財務統計
  const totalBuyIn = currentGame.players.reduce((sum, player) => sum + player.buyIn, 0);
  const totalCashOut = currentGame.players.reduce((sum, player) => {
    return sum + (player.buyIn + player.profit);
  }, 0);
  const totalExpenses = currentGame.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalDealerSalary = currentGame.dealers.reduce((sum, dealer) => {
    const tipPortion = dealer.totalTips * (dealer.tipShare / 100);
    const hourlyPortion = dealer.hourlyRate * dealer.workHours;
    return sum + tipPortion + hourlyPortion;
  }, 0);
  
  const expectedNetIncome = totalBuyIn - totalCashOut - totalExpenses - totalDealerSalary;
  const userActualCollection = parseFloat(actualCollection) || expectedNetIncome;
  const difference = userActualCollection - expectedNetIncome;
  const isBalanced = Math.abs(difference) < 1;

  const handleEndGame = () => {
    try {
      const endTime = new Date();
      endGame(currentGame.id, { endTime, actualCollection: expectedNetIncome });
      onClose();
    } catch (error) {
      Alert.alert(t('common.error') || '錯誤', t('endGame.errorEndFailed'));
    }
  };

  const resetForm = () => {
    setActualCollection('');
    setFinalNotes('');
  };

  React.useEffect(() => {
    if (visible && currentGame) {
      // 預設填入預期淨收入
      setActualCollection(expectedNetIncome.toString());
    }
  }, [visible, currentGame, expectedNetIncome]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('modals.endGame')}
    >
      <View>
        {/* 確認訊息 */}
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            {t('endGame.warningMessage')}
          </Text>
        </View>
        
        <Button 
          title={t('endGame.confirmEnd')} 
          onPress={handleEndGame} 
          size="lg" 
          variant="danger"
          leftIconName="close"
        />
      </View>
    </Modal>
  );
};

export default EndGameModal;
