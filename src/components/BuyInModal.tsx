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
  Platform,
  Dimensions,
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

  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768; // 判斷是否為手機

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
      backgroundColor: colorMode === 'light' ? '#E2E8F0' : '#303134',
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
      // 淺色模式下移除輸入框邊框，僅保留淡背景；深色模式維持原有邊框
      borderWidth: colorMode === 'light' ? 0 : 1,
      borderColor: colorMode === 'light' ? 'transparent' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    inputFocused: {
      // 淺色模式選取時也不顯示邊框；深色模式保留原有聚焦邊框
      borderColor: colorMode === 'light' ? 'transparent' : theme.colors.primary,
      borderWidth: colorMode === 'light' ? 0 : 1,
    },
    playersList: {
      maxHeight: 280,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    playerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 0,
      borderRadius: 0,
    },
    selectedPlayerItem: {
      backgroundColor: colorMode === 'dark' ? '#202124' : '#E2E8F0',
    },
    playerName: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    playerStats: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    activeStatus: {
      color: colorMode === 'light' ? '#4B5563' : '#FFFFFF',
    },
    inactiveStatus: {
      color: colorMode === 'light' ? '#4B5563' : '#FFFFFF',
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
      <Text style={styles.playerName}>{item.name}</Text>
      <Text style={styles.playerStats}>
        {t('game.buyIn')} ${item.buyIn.toLocaleString()}
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
      maxWidth={isMobile ? screenWidth - 32 : 400}
      maxHeight={isMobile ? screenHeight * 0.9 : undefined}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : { width: 400, minWidth: 400, maxWidth: 'none' }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ maxWidth: 400, alignSelf: 'center', width: '100%', paddingHorizontal: theme.spacing.lg }}>
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
              // 淺色模式下選取時隱藏提示文字，等待輸入
              placeholderTextColor={
                focusedInput === 'playerName'
                  ? 'transparent'
                  : theme.colors.textSecondary
              }
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
                <ScrollView 
                  nestedScrollEnabled 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingTop: 0 }}
                >
                  {currentGame.players
                    .slice()
                    .sort((a, b) => {
                      // 進行中玩家在前，已兌現玩家在後
                      if (a.status === 'active' && b.status !== 'active') return -1;
                      if (a.status !== 'active' && b.status === 'active') return 1;
                      return 0;
                    })
                    .map(p => (
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[styles.input, focusedInput === 'buyInAmount' && styles.inputFocused]}
                value={buyInAmount}
                onChangeText={setBuyInAmount}
                returnKeyType="done"
                onSubmitEditing={handleBuyIn}
                placeholder="$"
                onFocus={() => setFocusedInput('buyInAmount')}
                onBlur={() => setFocusedInput(null)}
                placeholderTextColor={
                  focusedInput === 'buyInAmount'
                    ? 'transparent'
                    : theme.colors.textSecondary
                }
                keyboardType="numeric"
                inputMode="decimal"
                {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
              />
            </View>
            {/* 確認按鈕 - 與輸入欄對齊 */}
            <Button
              title={t('buyIn.confirmBuyIn')}
              onPress={handleBuyIn}
              size="sm"
              variant="primary"
              style={{ marginBottom: 0, minWidth: 100 }} // 移除底部間距，添加最小寬度
              textStyle={colorMode === 'light' ? { color: '#64748B' } : undefined}
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default BuyInModal;
