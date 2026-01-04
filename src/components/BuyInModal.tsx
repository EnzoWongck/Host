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
      backgroundColor: colorMode === 'dark' ? 'rgba(8, 145, 178, 0.3)' : 'rgba(8, 145, 178, 0.15)',
      borderWidth: 2,
      borderColor: '#0891B2',
    },
    typeButtonInactive: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
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
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    // WhatsApp 風格輸入框 + 按鈕
    inputWithButtonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
      borderRadius: 24,
      paddingLeft: theme.spacing.md,
      paddingRight: 4,
      marginBottom: theme.spacing.md,
      borderWidth: colorMode === 'light' ? 0 : 1,
      borderColor: theme.colors.border,
    },
    inputInline: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: 12,
      paddingLeft: 8,
      backgroundColor: 'transparent',
    },
    inputIcon: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      opacity: 0.5,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#0891B2', // 湖水綠
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#0891B2',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '600',
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
      backgroundColor: colorMode === 'dark' ? 'rgba(8, 145, 178, 0.3)' : 'rgba(8, 145, 178, 0.15)', // 湖水綠
      borderWidth: 1,
      borderColor: '#0891B2',
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

  const handleBuyIn = async () => {
    if (!currentGame) {
      Alert.alert(t('common.error') || '錯誤', t('buyIn.errorNoGame'));
      return;
    }

    const amount = parseFloat(buyInAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert(t('common.error') || '錯誤', t('buyIn.errorAmountRequired'));
      return;
    }

    try {
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

        await addPlayer(currentGame.id, newPlayer);
        
        showToast(`${playerName} ${t('buyIn.successPlayerAdded')} ${formatCurrency(amount)}`, 'success');
      } else {
        // 現有玩家：新增一筆買入明細
        if (!selectedPlayer) {
          Alert.alert(t('common.error') || '錯誤', t('buyIn.errorPlayerRequired'));
          return;
        }

        await addBuyInEntry(currentGame.id, selectedPlayer.id, amount);
        showToast(`${selectedPlayer.name} ${t('buyIn.successBuyInAdded')} ${formatCurrency(amount)}`, 'success');
      }

      // 重置表單
      setPlayerName('');
      setBuyInAmount('');
      setSelectedPlayer(null);
      onClose();
    } catch (error) {
      console.error('添加買入失敗:', error);
      Alert.alert(
        t('common.error') || '錯誤',
        error instanceof Error ? error.message : (t('buyIn.errorAddFailed') || '添加買入失敗，請稍後再試')
      );
    }
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
              style={styles.input}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder={t('buyIn.playerNamePlaceholder')}
              placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
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

        {/* 買入金額 + 確認按鈕（WhatsApp 風格） */}
        <View style={styles.inputWithButtonRow}>
          <Text style={styles.inputIcon}>$</Text>
          <TextInput
            style={styles.inputInline}
            value={buyInAmount}
            onChangeText={setBuyInAmount}
            placeholder="輸入買入金額"
            placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
            keyboardType="decimal-pad"
          />
          {buyInAmount.trim() !== '' && (buyInType === 'existing' ? selectedPlayer : playerName.trim()) && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleBuyIn}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>✓</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
};

export default BuyInModal;
