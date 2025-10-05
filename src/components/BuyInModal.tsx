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
import Modal from './Modal';
import Button from './Button';
import { Player } from '../types/game';

interface BuyInModalProps {
  visible: boolean;
  onClose: () => void;
}

const BuyInModal: React.FC<BuyInModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { state, addPlayer, addBuyInEntry } = useGame();
  const { showToast } = useToast();
  
  const [buyInType, setBuyInType] = useState<'new' | 'existing'>('new');
  const [playerName, setPlayerName] = useState('');
  const [buyInAmount, setBuyInAmount] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const currentGame = state.currentGame;

  const styles = StyleSheet.create({
    typeSelection: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.border,
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
      backgroundColor: theme.colors.primary,
    },
    typeButtonInactive: {
      backgroundColor: 'transparent',
    },
    typeButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    typeButtonTextActive: {
      color: '#FFFFFF',
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
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
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
      color: '#FFFFFF',
      overflow: 'hidden',
    },
    activeStatus: {
      backgroundColor: theme.colors.success,
    },
    inactiveStatus: {
      backgroundColor: theme.colors.textSecondary,
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
      Alert.alert('錯誤', '沒有進行中的牌局');
      return;
    }

    const amount = parseFloat(buyInAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('錯誤', '請輸入有效的買入金額');
      return;
    }

    if (buyInType === 'new') {
      // 新增玩家
      if (!playerName.trim()) {
        Alert.alert('錯誤', '請輸入玩家名稱');
        return;
      }

      const newPlayer: Omit<Player, 'id' | 'createdAt' | 'updatedAt'> = {
        name: playerName.trim(),
        buyIn: amount,
        profit: -amount, // 初始盈虧為負的買入金額
        status: 'active',
      };

      addPlayer(currentGame.id, newPlayer);
      
      showToast(`${playerName} 已加入牌局，買入 ${formatCurrency(amount)}`, 'success');
    } else {
      // 現有玩家：新增一筆買入明細
      if (!selectedPlayer) {
        Alert.alert('錯誤', '請選擇一個玩家');
        return;
      }

      addBuyInEntry(currentGame.id, selectedPlayer.id, amount);
      showToast(`${selectedPlayer.name} 新增買入 ${formatCurrency(amount)}`, 'success');
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
          買入: {formatCurrency(item.buyIn)} | 盈虧: {formatCurrency(item.profit)}
        </Text>
      </View>
      <Text
        style={[
          styles.playerStatus,
          item.status === 'active' ? styles.activeStatus : styles.inactiveStatus,
        ]}
      >
        {item.status === 'active' ? '進行中' : '已兌現'}
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
      title="買入"
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
              新增玩家
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
              現有玩家
            </Text>
          </TouchableOpacity>
        </View>

        {/* 新增玩家表單 */}
        {buyInType === 'new' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>玩家名稱</Text>
            <TextInput
              style={styles.input}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="輸入玩家名稱"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        )}

        {/* 現有玩家選擇 */}
        {buyInType === 'existing' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>選擇玩家</Text>
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
                <Text style={styles.emptyText}>目前沒有玩家</Text>
              </View>
            )}
          </View>
        )}

        {/* 買入金額 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>買入金額</Text>
          <TextInput
            style={styles.input}
            value={buyInAmount}
            onChangeText={setBuyInAmount}
            placeholder="輸入買入金額"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* 確認按鈕 */}
        <Button
          title="確認買入"
          onPress={handleBuyIn}
          size="lg"
        />
      </ScrollView>
    </Modal>
  );
};

export default BuyInModal;
