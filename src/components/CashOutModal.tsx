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
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Button from './Button';
import { Player } from '../types/game';

interface CashOutModalProps {
  visible: boolean;
  onClose: () => void;
  defaultPlayer?: Player | null;
  onCashOutSuccess?: () => void;
}

const CashOutModal: React.FC<CashOutModalProps> = ({ visible, onClose, defaultPlayer, onCashOutSuccess }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, updatePlayer } = useGame();
  const { showToast } = useToast();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [chipAmount, setChipAmount] = useState('');
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [entryFeeDeducted, setEntryFeeDeducted] = useState(false);

  const currentGame = state.currentGame;
  const isNoRakeMode = currentGame?.gameMode === 'noRake';

  // 當 Modal 打開且有預設玩家時，自動設置
  React.useEffect(() => {
    if (visible && defaultPlayer) {
      setSelectedPlayer(defaultPlayer);
    } else if (!visible) {
      setSelectedPlayer(null);
      setChipAmount('');
      setSelectedHost(null);
      setEntryFeeDeducted(false);
    }
  }, [visible, defaultPlayer]);

  React.useEffect(() => {
    if (selectedPlayer) {
      setEntryFeeDeducted(selectedPlayer.entryFeeDeducted ?? false);
    } else {
      setEntryFeeDeducted(false);
    }
  }, [selectedPlayer]);

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
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
    },
    entryFeeToggle: {
      marginLeft: theme.spacing.md,
      alignItems: 'center',
    },
    entryFeeToggleLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    entryFeeToggleButton: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },
    entryFeeToggleText: {
      fontSize: theme.fontSize.xl,
      color: '#999999',
    },
    entryFeeToggleTextActive: {
      color: '#0891b2',
    },
  });

  const handleCashOut = () => {
    if (!currentGame) {
      Alert.alert(t('common.error') || '錯誤', t('cashOut.errorNoGame') || '沒有進行中的牌局');
      return;
    }
    if (!selectedPlayer) {
      Alert.alert(t('common.error') || '錯誤', t('cashOut.errorPlayerRequired') || '請選擇玩家');
      return;
    }
    const chips = parseFloat(chipAmount);
    if (isNaN(chips) || chips < 0) {
      Alert.alert(t('common.error') || '錯誤', t('cashOut.errorAmountRequired') || '請輸入有效的籌碼金額');
      return;
    }

    const hosts = currentGame.hosts || [];
    if (hosts.length > 1 && !selectedHost) {
      Alert.alert(t('common.error') || '錯誤', t('cashOut.errorHostRequired') || '請選擇 Host');
      return;
    }

    // 盈虧 = 兌現籌碼 - 總買入
    const profit = chips - selectedPlayer.buyIn;
    const now = new Date();
    
    // 確定使用的 Host 名稱（使用前面已宣告的 hosts）
    const firstHostName = hosts[0] ? (typeof hosts[0] === 'string' ? hosts[0] : (hosts[0] as any).name) : null;
    const hostToUse = hosts.length > 1 ? selectedHost : firstHostName;
    
    const updated: Player = {
      ...selectedPlayer,
      profit,
      status: 'cashed_out',
      cashOutTime: now, // 記錄兌現時間
      cashOutAmount: chips,
      entryFeeDeducted: isNoRakeMode ? entryFeeDeducted : false,
      updatedAt: now,
    } as any;
    
    // 設置 cashOutHost（如果有多個 Host）
    if (hostToUse) {
      (updated as any).cashOutHost = hostToUse;
    }

    updatePlayer(currentGame.id, updated);

    showToast(`${selectedPlayer.name} ${t('cashOut.successCashOut') || '已兌現'} $${chips.toLocaleString()}，${t('game.profit')} ${profit >= 0 ? '+' : ''}${profit.toLocaleString()}`, 'success');
    setSelectedPlayer(null);
    setChipAmount('');
    setSelectedHost(null);
    setEntryFeeDeducted(false);
    
    // 如果有成功回調，先執行回調再關閉
    if (onCashOutSuccess) {
      onCashOutSuccess();
    }
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
      title={t('modals.cashOut')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 選擇玩家（如果有預設玩家則隱藏） */}
        {!defaultPlayer && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('cashOut.selectPlayer')}</Text>
            <View style={[styles.playersList, { maxHeight: 360 }]}> 
              <ScrollView>
                {activePlayers.length === 0 ? (
                  <View style={{ padding: theme.spacing.md }}>
                    <Text style={styles.hint}>{t('cashOut.noActivePlayers')}</Text>
                  </View>
                ) : (
                  activePlayers.map(player => (
                    <TouchableOpacity
                      key={player.id}
                      style={[styles.playerRow, selectedPlayer?.id === player.id && styles.selected]}
                      onPress={() => setSelectedPlayer(player)}
                    >
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.hint}>{t('game.buyIn')} ${player.buyIn.toLocaleString()}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}
        
        {/* 如果已有預設玩家，顯示玩家信息 */}
        {defaultPlayer && selectedPlayer && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('cashOut.player')}</Text>
            <View style={[styles.playerRow, { backgroundColor: theme.colors.primary + '10' }]}>
              <Text style={styles.playerName}>{selectedPlayer.name}</Text>
              <Text style={styles.hint}>{t('game.buyIn')} ${selectedPlayer.buyIn.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* 輸入兌現金額 + 入場費扣除 */}
        <View style={styles.inputGroup}>
          <View style={styles.amountRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('cashOut.chipsAmount')}</Text>
              <TextInput
                style={styles.input}
                value={chipAmount}
                onChangeText={setChipAmount}
                placeholder={t('cashOut.enterAmount')}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {isNoRakeMode && selectedPlayer && (
              <View style={styles.entryFeeToggle}>
                <Text style={styles.entryFeeToggleLabel}>已扣入場費</Text>
                <TouchableOpacity
                  style={styles.entryFeeToggleButton}
                  onPress={() => setEntryFeeDeducted((prev) => !prev)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.entryFeeToggleText, entryFeeDeducted && styles.entryFeeToggleTextActive]}>
                    {entryFeeDeducted ? '✓' : '☐'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 選擇 Host（多 Host 顯示，單 Host 自動綁定不顯示） */}
        {!!currentGame && (currentGame.hosts?.length || 0) > 1 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('cashOut.selectHost')}</Text>
            <View style={styles.hostRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.hostChips}>
                  {currentGame.hosts.map((h) => {
                    const hostName = typeof h === 'string' ? h : h.name;
                    return (
                    <TouchableOpacity key={hostName} style={[styles.chip, selectedHost === hostName && styles.chipActive]} onPress={() => setSelectedHost(hostName)} activeOpacity={1}>
                      <Text style={styles.chipText}>{hostName}</Text>
                    </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
            {!selectedHost && (
              <Text style={styles.hint}>{t('cashOut.selectHostHint')}</Text>
            )}
          </View>
        )}

        <Button title={t('common.confirm') + t('modals.cashOut')} onPress={handleCashOut} size="lg" leftIconName="cashout" />
      </ScrollView>
    </Modal>
  );
};

export default CashOutModal;


