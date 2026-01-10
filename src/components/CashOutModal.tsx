import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
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
  isEditMode?: boolean;
}

const CashOutModal: React.FC<CashOutModalProps> = ({ visible, onClose, defaultPlayer, onCashOutSuccess, isEditMode = false }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, updatePlayer } = useGame();
  const { showToast } = useToast();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [chipAmount, setChipAmount] = useState('');
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [entryFeeDeducted, setEntryFeeDeducted] = useState(false);

  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768; // 判斷是否為手機

  const currentGame = state.currentGame;
  const isNoRakeMode = currentGame?.gameMode === 'noRake';

  // 當 Modal 打開且有預設玩家時，自動設置
  React.useEffect(() => {
    if (visible && defaultPlayer) {
      setSelectedPlayer(defaultPlayer);
      // 編輯模式時，預填現有的兌現金額和 Host
      if (isEditMode && defaultPlayer?.cashOutAmount !== undefined) {
        setChipAmount(String(defaultPlayer.cashOutAmount));
        if (defaultPlayer.cashOutHost) {
          setSelectedHost(defaultPlayer.cashOutHost);
        }
      }
    } else if (!visible) {
      setSelectedPlayer(null);
      setChipAmount('');
      setSelectedHost(null);
      setEntryFeeDeducted(false);
    }
  }, [visible, defaultPlayer, isEditMode]);

  // 當 host 更新時，如果選擇的 host 不存在了，清除選擇
  React.useEffect(() => {
    if (visible && currentGame && selectedHost) {
      const hostNames = (currentGame.hosts || []).map((h) => typeof h === 'string' ? h : h.name);
      if (!hostNames.includes(selectedHost)) {
        setSelectedHost(null);
      }
    }
  }, [visible, currentGame, currentGame?.hosts, selectedHost]);

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
      // 淺色模式下移除輸入框邊框，僅保留淡背景；深色模式維持原有邊框
      borderWidth: colorMode === 'light' ? 0 : 1,
      borderColor: colorMode === 'light' ? 'transparent' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: 16, // 必須 >= 16px 防止 iOS Safari 縮放
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    playersList: {
      maxHeight: 300, // 顯示5個玩家（約每個玩家60px高度）
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    playerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 0,
      borderRadius: 0,
    },
    playerName: { fontSize: theme.fontSize.md, color: theme.colors.text },
    selected: { 
      backgroundColor: colorMode === 'dark' ? 'rgba(8, 145, 178, 0.3)' : 'rgba(8, 145, 178, 0.15)', // 湖水綠
      borderWidth: 1,
      borderColor: '#0891B2',
    },
    hint: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    hostRow: { flexDirection: 'row', alignItems: 'center' },
    hostChips: { flexDirection: 'row' },
    chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: colorMode === 'dark' ? theme.colors.border : '#F4F4F5', marginRight: theme.spacing.sm, backgroundColor: colorMode === 'light' ? '#FFFFFF' : theme.colors.background },
    chipActive: { borderColor: colorMode === 'dark' ? '#FFFFFF' : '#E2E8F0', backgroundColor: colorMode === 'light' ? '#FFFFFF' : theme.colors.background },
    chipText: { color: colorMode === 'light' ? '#4B5563' : theme.colors.text, fontWeight: '600' },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
    },
    entryFeeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
    },
    entryFeeLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    entryFeeCheckbox: {
      fontSize: 24,
      color: '#999999',
    },
    entryFeeCheckboxActive: {
      color: '#0891b2',
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
    placeholderColor: {
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
      cashOutHost: hostToUse || undefined, // 設置 cashOutHost
      entryFeeDeducted: isNoRakeMode ? entryFeeDeducted : false,
      updatedAt: now,
    };

    updatePlayer(currentGame.id, updated);

    if (isEditMode) {
      showToast(`${selectedPlayer.name} 兌現紀錄已更新：$${chips.toLocaleString()}，${t('game.profit')} ${profit >= 0 ? '+' : ''}${profit.toLocaleString()}`, 'success');
    } else {
      showToast(`${selectedPlayer.name} ${t('cashOut.successCashOut') || '已兌現'} $${chips.toLocaleString()}，${t('game.profit')} ${profit >= 0 ? '+' : ''}${profit.toLocaleString()}`, 'success');
    }
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
      title={isEditMode ? '編輯兌現紀錄' : t('modals.cashOut')}
      maxWidth={isMobile ? screenWidth - 64 : 600}
      maxHeight={isMobile ? screenHeight * 0.9 : undefined}
      containerStyle={isMobile ? { width: screenWidth - 64, maxWidth: screenWidth - 64 } : { width: 600, minWidth: 600, maxWidth: 'none' }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        contentContainerStyle={{ maxWidth: '100%', alignSelf: 'center', width: '100%', paddingHorizontal: theme.spacing.lg }}
      >
        {/* 選擇玩家（如果有預設玩家則隱藏） */}
        {!defaultPlayer && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('cashOut.selectPlayer')}</Text>
            <View style={[styles.playersList, { maxHeight: 300 }]}> 
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 0 }}
              >
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
            <View style={[
              styles.playerRow, 
              { 
                backgroundColor: colorMode === 'dark' ? '#202124' : theme.colors.primary + '10',
                borderRadius: theme.borderRadius.md,
              }
            ]}>
              <Text style={styles.playerName}>{selectedPlayer.name}</Text>
              <Text style={styles.hint}>{t('game.buyIn')} ${selectedPlayer.buyIn.toLocaleString()}</Text>
            </View>
          </View>
        )}

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

        {/* 入場費扣除（無抽水模式） */}
        {isNoRakeMode && selectedPlayer && (
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.entryFeeRow}
              onPress={() => setEntryFeeDeducted((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.entryFeeLabel}>已扣入場費</Text>
              <Text style={[styles.entryFeeCheckbox, entryFeeDeducted && styles.entryFeeCheckboxActive]}>
                {entryFeeDeducted ? '✓' : '☐'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 輸入兌現金額 + 確認按鈕（WhatsApp 風格） */}
        <View style={styles.inputWithButtonRow}>
          <Text style={styles.inputIcon}>$</Text>
          <TextInput
            style={styles.inputInline}
            value={chipAmount}
            onChangeText={setChipAmount}
            placeholder="輸入兌現籌碼"
            placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
            keyboardType="decimal-pad"
          />
          {chipAmount.trim() !== '' && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleCashOut}
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

export default CashOutModal;


