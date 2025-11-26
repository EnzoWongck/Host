import React, { useState, useEffect } from 'react';
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
import { Game, Player } from '../types/game';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Button from './Button';
import PlayerEntryFeeEditModal from './PlayerEntryFeeEditModal';
import Icon from './Icon';

interface EntryFeeModalProps {
  visible: boolean;
  onClose: () => void;
}

const EntryFeeModal: React.FC<EntryFeeModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { state, updateGame, updatePlayer } = useGame();
  
  const currentGame = state.currentGame;
  
  const [entryFeeMode, setEntryFeeMode] = useState<'fixed' | 'custom'>('fixed');
  const [fixedEntryFee, setFixedEntryFee] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  
  // 編輯入場費狀態
  const [editEntryFeeVisible, setEditEntryFeeVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // 初始化狀態
  useEffect(() => {
    if (currentGame && visible) {
      const resolvedMode =
        currentGame.entryFeeMode === 'hourly'
          ? 'custom'
          : currentGame.entryFeeMode || 'fixed';
      setEntryFeeMode(resolvedMode);
      setFixedEntryFee(
        currentGame.fixedEntryFee !== undefined ? String(currentGame.fixedEntryFee) : ''
      );
      setHourlyRate(
        currentGame.hourlyRate !== undefined ? String(currentGame.hourlyRate) : ''
      );
    }
  }, [currentGame, visible]);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const getResolvedFixedFee = () => {
    const parsed = parseFloat(fixedEntryFee);
    if (!isNaN(parsed)) return parsed;
    if (currentGame?.fixedEntryFee !== undefined) return currentGame.fixedEntryFee;
    return 0;
  };

  const getResolvedHourlyRate = () => {
    const parsed = parseFloat(hourlyRate);
    if (!isNaN(parsed)) return parsed;
    if (currentGame?.hourlyRate !== undefined) return currentGame.hourlyRate;
    return 0;
  };

  const calculatePlayerCharge = (player: Player): number | null => {
    // 優先使用自訂入場費
    if (player.customEntryFee !== undefined) {
      return player.customEntryFee;
    }
    
    // 如果設定了統一入場費，優先使用統一入場費（無論當前模式）
    const fixedFee = getResolvedFixedFee();
    if (fixedFee > 0) {
      return fixedFee;
    }
    
    if (entryFeeMode === 'fixed') {
      return fixedFee;
    }
    
    // 自訂模式：按時長計算
    const rate = getResolvedHourlyRate();
    if (rate <= 0 || !player.buyInTime || !player.cashOutTime) {
      return null;
    }
    const buyInTime = new Date(player.buyInTime);
    const cashOutTime = new Date(player.cashOutTime);
    const diff = cashOutTime.getTime() - buyInTime.getTime();
    if (diff <= 0) {
      return null;
    }
    const minutes = Math.ceil(diff / 60000);
    const units = Math.max(1, Math.ceil(minutes / 30)); // 每30分鐘為一單位
    return units * rate;
  };

  // 計算基礎入場費（不包含自訂值）
  const calculateBasePlayerCharge = (player: Player): number => {
    // 如果設定了統一入場費，優先使用統一入場費（無論當前模式）
    const fixedFee = getResolvedFixedFee();
    if (fixedFee > 0) {
      return fixedFee;
    }
    
    if (entryFeeMode === 'fixed') {
      return fixedFee;
    }
    
    // 自訂模式：按時長計算
    const rate = getResolvedHourlyRate();
    if (rate <= 0 || !player.buyInTime || !player.cashOutTime) {
      return 0;
    }
    const buyInTime = new Date(player.buyInTime);
    const cashOutTime = new Date(player.cashOutTime);
    const diff = cashOutTime.getTime() - buyInTime.getTime();
    if (diff <= 0) {
      return 0;
    }
    const minutes = Math.ceil(diff / 60000);
    const units = Math.max(1, Math.ceil(minutes / 30)); // 每30分鐘為一單位
    return units * rate;
  };

  const styles = StyleSheet.create({
    scrollContainer: {
      maxHeight: 600,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.lg,
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
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      width: '100%',
    },
    totalFeeText: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.primary,
      flexShrink: 0,
      marginLeft: theme.spacing.md,
    },
    selectAllButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
    },
    selectAllText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
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
    modeContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modeTab: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginRight: theme.spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    inactiveTab: {
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    description: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      lineHeight: 20,
    },
    playerList: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
    playerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '20',
    },
    playerRowLast: {
      borderBottomWidth: 0,
    },
    playerName: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      fontWeight: '500',
    },
    playerAmount: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    playerCustomLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.primary,
      fontWeight: '500',
      marginTop: 2,
    },
    checkboxContainer: {
      marginLeft: theme.spacing.sm,
      padding: theme.spacing.xs,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    editButton: {
      marginLeft: theme.spacing.xs,
      padding: theme.spacing.xs,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
  });

  const handleSave = () => {
    if (!currentGame) {
      Alert.alert(t('common.error') || '錯誤', t('entryFee.errorNoGame'));
      return;
    }

    // 驗證輸入
    if (entryFeeMode === 'fixed') {
      const fee = parseFloat(fixedEntryFee);
      if (isNaN(fee) || fee < 0) {
        Alert.alert(t('common.error') || '錯誤', t('entryFee.errorEntryFeeRequired'));
        return;
      }
    } else {
      const rate = parseFloat(hourlyRate);
      if (isNaN(rate) || rate < 0) {
        Alert.alert(t('common.error') || '錯誤', t('entryFee.errorHourlyRateRequired'));
        return;
      }
    }

    try {
      // 更新牌局的入場費設定
      const updatedGame: Game = {
        ...currentGame,
        entryFeeMode,
        fixedEntryFee: entryFeeMode === 'fixed' ? parseFloat(fixedEntryFee) || 0 : undefined,
        hourlyRate: entryFeeMode === 'custom' ? parseFloat(hourlyRate) || 0 : undefined,
      };
      
      updateGame(updatedGame);
      Alert.alert(t('common.success') || '成功', t('entryFee.successSaved'));
      onClose();
    } catch (error) {
      Alert.alert(t('common.error') || '錯誤', t('entryFee.errorSaveFailed'));
    }
  };

  if (!currentGame || currentGame.gameMode !== 'noRake') {
    return null;
  }

  const players = currentGame.players || [];
  
  // 計算總入場費
  const totalEntryFee = players.reduce((sum, player) => {
    const charge = calculatePlayerCharge(player);
    return sum + (charge !== null ? charge : 0);
  }, 0);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('entryFee.title')}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 模式選擇 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('entryFee.mode')}</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity 
              onPress={() => setEntryFeeMode('fixed')}
              style={styles.modeTab}
              activeOpacity={0.7}
            >
              <Text style={entryFeeMode === 'fixed' ? styles.activeTab : styles.inactiveTab}>
                {t('entryFee.unifiedEntryFee')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setEntryFeeMode('custom')}
              style={styles.modeTab}
              activeOpacity={0.7}
            >
              <Text style={entryFeeMode === 'custom' ? styles.activeTab : styles.inactiveTab}>
                {t('entryFee.customHourly')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 統一入場費 */}
        {entryFeeMode === 'fixed' && (
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { marginBottom: 0, flex: 1 }]}>{t('entryFee.fixedEntryFee')}</Text>
              <Text style={styles.totalFeeText}>
                {t('summary.totalEntryFee')}：{formatCurrency(totalEntryFee)}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('entryFee.fixedEntryFeePlaceholder')}
              value={fixedEntryFee}
              onChangeText={setFixedEntryFee}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={styles.description}>
              {t('entryFee.fixedEntryFeeDescription')}
            </Text>
          </View>
        )}

        {/* 自訂/按時長計費 */}
        {entryFeeMode === 'custom' && (
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { marginBottom: 0, flex: 1 }]}>{t('entryFee.hourlyRate')}</Text>
              <Text style={styles.totalFeeText}>
                {t('summary.totalEntryFee')}：{formatCurrency(totalEntryFee)}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('entryFee.hourlyRatePlaceholder')}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={styles.description}>
              {t('entryFee.hourlyRateDescription')}
            </Text>
          </View>
        )}

        {/* 玩家收費列表 */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('entryFee.playerCharges')}</Text>
            {players.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  // 一鍵全部勾選
                  players.forEach(player => {
                    const charge = calculatePlayerCharge(player);
                    if (charge !== null && charge > 0 && !player.entryFeeDeducted) {
                      updatePlayer(currentGame!.id, {
                        ...player,
                        entryFeeDeducted: true,
                      });
                    }
                  });
                }}
                style={styles.selectAllButton}
              >
                <Text style={styles.selectAllText}>
                  {t('entryFee.selectAll') || '一鍵全部勾選'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {players.length === 0 ? (
            <Text style={styles.description}>{t('entryFee.noPlayers')}</Text>
          ) : (
            <View style={styles.playerList}>
              {players.map((player, index) => {
                const charge = calculatePlayerCharge(player);
                const isCustom = player.customEntryFee !== undefined;
                const isDeducted = player.entryFeeDeducted || false;
                return (
                  <View
                    key={player.id}
                    style={[
                      styles.playerRow,
                      index === players.length - 1 && styles.playerRowLast,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      {isCustom && (
                        <Text style={styles.playerCustomLabel}>
                          {t('entryFee.custom') || '自訂'}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.playerAmount}>
                      {charge === null ? t('entryFee.pending') : formatCurrency(charge)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        updatePlayer(currentGame!.id, {
                          ...player,
                          entryFeeDeducted: !isDeducted,
                        });
                      }}
                      style={styles.checkboxContainer}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkbox,
                        isDeducted && styles.checkboxChecked
                      ]}>
                        {isDeducted && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingPlayer(player);
                        setEditEntryFeeVisible(true);
                      }}
                      style={styles.editButton}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name="settings" 
                        size={20} 
                        style={{ color: theme.colors.textSecondary }}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 儲存按鈕 */}
        <View style={styles.buttonContainer}>
          <Button
            title={t('common.save')}
            onPress={handleSave}
            size="lg"
          />
        </View>
      </ScrollView>

      {/* 編輯玩家入場費 Modal */}
      {editingPlayer && currentGame && (
        <PlayerEntryFeeEditModal
          visible={editEntryFeeVisible}
          onClose={() => {
            setEditEntryFeeVisible(false);
            setEditingPlayer(null);
          }}
          player={editingPlayer}
          calculatedFee={calculateBasePlayerCharge(editingPlayer)}
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
    </Modal>
  );
};

export default EntryFeeModal;

