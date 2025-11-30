import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Button from './Button';
import { Player } from '../types/game';

interface BuyInModalProps {
  visible: boolean;
  onClose: () => void;
}

const BuyInModal: React.FC<BuyInModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, addPlayer, addBuyInEntry } = useGame();
  const { showToast } = useToast();
  
  const [buyInType, setBuyInType] = useState<'new' | 'existing'>('new');
  const [playerName, setPlayerName] = useState('');
  const [buyInAmount, setBuyInAmount] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const currentGame = state.currentGame;

  const styles = StyleSheet.create({
    typeSelection: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
    },
    typeButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    typeButtonActive: {
      backgroundColor: colorMode === 'light' ? '#E2E8F0' : theme.colors.primary,
    },
    typeButtonInactive: {
      backgroundColor: theme.colors.surface,
    },
    typeButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    typeButtonTextActive: {
      color: colorMode === 'light' ? '#64748B' : '#FFFFFF',
    },
    typeButtonTextInactive: {
      color: theme.colors.textSecondary,
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
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.background,
    },
    inputFocused: {
      borderColor: colorMode === 'light' ? '#E2E8F0' : theme.colors.primary,
      borderWidth: 1,
    },
    playersList: {
      maxHeight: 200,
      marginBottom: theme.spacing.lg,
    },
    playerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    selectedPlayerItem: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      fontSize: theme.fontSize.md,
      fontWeight: '500',
      color: theme.colors.text,
    },
    playerStats: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    playerStatus: {
      fontSize: theme.fontSize.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colorMode === 'dark' ? '#202124' : theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeStatus: {
      color: '#FFFFFF',
    },
    inactiveStatus: {
      color: '#FFFFFF',
      opacity: 0.7,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const handleBuyIn = () => {
    if (!currentGame) {
      Alert.alert(t('common.error') || '錯誤', t('buyIn.errorNoGame'));
      return;
    }

    const amount = parseFloat(buyInAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t('common.error') || '錯誤', t('buyIn.errorAmountRequired'));
      return;
    }

    if (buyInType === 'new') {
      // 新增玩家
      if (!playerName.trim()) {
        Alert.alert(t('common.error') || '錯誤', t('buyIn.errorPlayerNameRequired'));
        return;
      }

      const newPlayer: Omit<Player, 'id' | 'createdAt' | 'updatedAt'> = {
        name: playerName.trim(),
        buyIn: amount,
        profit: -amount, // 初始盈虧為負的買入金額
        status: 'active',
      };

      addPlayer(currentGame.id, newPlayer);
      
      showToast(`${playerName} ${t('buyIn.successPlayerAdded')} ${formatCurrency(amount)}`, 'success');
    } else {
      // 現有玩家：新增一筆買入明細
      if (!selectedPlayer) {
        Alert.alert(t('common.error') || '錯誤', t('buyIn.errorPlayerRequired'));
        return;
      }

      addBuyInEntry(currentGame.id, selectedPlayer.id, amount);
      showToast(`${selectedPlayer.name} ${t('buyIn.successBuyInAdded')} ${formatCurrency(amount)}`, 'success');
    }

    // 重置表單
    setPlayerName('');
    setBuyInAmount('');
    setSelectedPlayer(null);
    onClose();
  };

  const resetForm = () => {
    setBuyInType('new');
    setPlayerName('');
    setBuyInAmount('');
    setSelectedPlayer(null);
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      style={[
        styles.playerItem,
        selectedPlayer?.id === item.id && styles.selectedPlayerItem,
      ]}
      onPress={() => setSelectedPlayer(item)}
      activeOpacity={1}
    >
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerStats}>
          {t('game.buyIn')}: {formatCurrency(item.buyIn)} | {t('game.profit')}: {formatCurrency(item.profit)}
        </Text>
      </View>
      <Text
        style={[
          styles.playerStatus,
          item.status === 'active' ? styles.activeStatus : styles.inactiveStatus,
        ]}
      >
        {item.status === 'active' ? t('game.inProgress') : t('game.cashedOut')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={t('modals.buyIn')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 買入類型選擇 */}
        <View style={styles.typeSelection}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              buyInType === 'new' ? styles.typeButtonActive : styles.typeButtonInactive,
            ]}
            onPress={() => setBuyInType('new')}
            activeOpacity={1}
          >
            <Text
              style={[
                styles.typeButtonText,
                buyInType === 'new' ? styles.typeButtonTextActive : styles.typeButtonTextInactive,
              ]}
            >
              {t('buyIn.newPlayer')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              buyInType === 'existing' ? styles.typeButtonActive : styles.typeButtonInactive,
            ]}
            onPress={() => setBuyInType('existing')}
            activeOpacity={1}
          >
            <Text
              style={[
                styles.typeButtonText,
                buyInType === 'existing' ? styles.typeButtonTextActive : styles.typeButtonTextInactive,
              ]}
            >
              {t('buyIn.existingPlayer')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 新增玩家表單 */}
        {buyInType === 'new' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('buyIn.playerName')}</Text>
            <TextInput
              style={[styles.input, focusedInput === 'playerName' && styles.inputFocused]}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder={t('buyIn.playerNamePlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              onFocus={() => setFocusedInput('playerName')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        )}

        {/* 現有玩家選擇 */}
        {buyInType === 'existing' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('buyIn.selectPlayer')}</Text>
            {currentGame?.players && currentGame.players.length > 0 ? (
              <View style={[styles.playersList, { maxHeight: 280 }]}> 
                <ScrollView nestedScrollEnabled>
                  {currentGame.players.map(p => (
                    renderPlayerItem({ item: p } as any)
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('buyIn.noPlayers')}</Text>
              </View>
            )}
          </View>
        )}

        {/* 買入金額 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('buyIn.amount')}</Text>
          <TextInput
            style={[styles.input, focusedInput === 'buyInAmount' && styles.inputFocused]}
            value={buyInAmount}
            onChangeText={setBuyInAmount}
            placeholder={t('buyIn.amountPlaceholder')}
            onFocus={() => setFocusedInput('buyInAmount')}
            onBlur={() => setFocusedInput(null)}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* 確認按鈕 */}
        <Button
          title={t('buyIn.confirmBuyIn')}
          onPress={handleBuyIn}
          size="lg"
          style={colorMode === 'light' ? { 
            backgroundColor: '#E2E8F0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
          } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
          textStyle={colorMode === 'light' ? { color: '#64748B' } : undefined}
        />
      </ScrollView>
    </Modal>
  );
};

export default BuyInModal;
