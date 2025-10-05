import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import Button from './Button';
import { Player } from '../types/game';

interface CashOutModalProps {
  visible: boolean;
  onClose: () => void;
}

const CashOutModal: React.FC<CashOutModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { state, updatePlayer } = useGame();
  const { showToast } = useToast();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [chipAmount, setChipAmount] = useState('');
  const [selectedHost, setSelectedHost] = useState<string | null>(null);

  const currentGame = state.currentGame;

  const styles = StyleSheet.create({
    inputGroup: { marginBottom: theme.spacing.lg },
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
      maxHeight: 280,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
    },
    playerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    playerName: { fontSize: theme.fontSize.md, color: theme.colors.text },
    selected: { backgroundColor: theme.colors.primary + '10' },
    hint: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    hostRow: { flexDirection: 'row', alignItems: 'center' },
    hostChips: { flexDirection: 'row' },
    chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.border, marginRight: theme.spacing.sm, backgroundColor: colorMode === 'light' ? '#FFFFFF' : theme.colors.background },
    chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
    chipText: { color: theme.colors.text, fontWeight: '600' },
  });

  const handleCashOut = () => {
    if (!currentGame) {
      Alert.alert('錯誤', '沒有進行中的牌局');
      return;
    }
    if (!selectedPlayer) {
      Alert.alert('錯誤', '請選擇玩家');
      return;
    }
    const chips = parseFloat(chipAmount);
    if (isNaN(chips) || chips < 0) {
      Alert.alert('錯誤', '請輸入有效的籌碼金額');
      return;
    }

    const hosts = currentGame.hosts || [];
    if (hosts.length > 1 && !selectedHost) {
      Alert.alert('錯誤', '請選擇 Host');
      return;
    }

    // 盈虧 = 兌現籌碼 - 總買入
    const profit = chips - selectedPlayer.buyIn;
    const updated: Player = {
      ...selectedPlayer,
      profit,
      status: 'cashed_out',
      updatedAt: new Date(),
    };

    updatePlayer(currentGame.id, updated);

    showToast(`${selectedPlayer.name} 已兌現 $${chips.toLocaleString()}，盈虧 ${profit >= 0 ? '+' : ''}${profit.toLocaleString()}`, 'success');
    setSelectedPlayer(null);
    setChipAmount('');
    setSelectedHost(null);
    onClose();
  };

  const activePlayers = currentGame?.players.filter(p => p.status === 'active') ?? [];

  return (
    <Modal
      visible={visible}
      onClose={() => {
        setSelectedPlayer(null);
        setChipAmount('');
        setSelectedHost(null);
        onClose();
      }}
      title="兌現"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 選擇玩家 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>選擇玩家</Text>
          <View style={[styles.playersList, { maxHeight: 360 }]}> 
            <ScrollView>
              {activePlayers.length === 0 ? (
                <View style={{ padding: theme.spacing.md }}>
                  <Text style={styles.hint}>目前沒有進行中的玩家</Text>
                </View>
              ) : (
                activePlayers.map(player => (
                  <TouchableOpacity
                    key={player.id}
                    style={[styles.playerRow, selectedPlayer?.id === player.id && styles.selected]}
                    onPress={() => setSelectedPlayer(player)}
                  >
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.hint}>買入 ${player.buyIn.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>

        {/* 輸入兌現金額 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>兌現籌碼金額</Text>
          <TextInput
            style={styles.input}
            value={chipAmount}
            onChangeText={setChipAmount}
            placeholder="輸入金額"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* 選擇 Host（多 Host 顯示，單 Host 自動綁定不顯示） */}
        {!!currentGame && (currentGame.hosts?.length || 0) > 1 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>選擇 Host</Text>
            <View style={styles.hostRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.hostChips}>
                  {currentGame.hosts.map((h) => (
                    <TouchableOpacity key={h} style={[styles.chip, selectedHost === h && styles.chipActive]} onPress={() => setSelectedHost(h)} activeOpacity={1}>
                      <Text style={styles.chipText}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            {!selectedHost && (
              <Text style={styles.hint}>請選擇本次兌現所屬的 Host</Text>
            )}
          </View>
        )}

        <Button title="確認兌現" onPress={handleCashOut} size="lg" leftIconName="cashout" />
      </ScrollView>
    </Modal>
  );
};

export default CashOutModal;


