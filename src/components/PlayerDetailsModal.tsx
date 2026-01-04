import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import BuyInEditModal from './BuyInEditModal';
import ConfirmModal from './ConfirmModal';
import CashOutModal from './CashOutModal';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { BuyInEntry, Player } from '../types/game';
// 靜態導入圖片
import EditIconImage from '../../assets/icons/edit.png';
import EditBlackIconImage from '../../assets/icons/edit.black.png';

interface PlayerDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  player: Player | null;
}

const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({ visible, onClose, player }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, addBuyInEntry, updateBuyInEntry, deleteBuyInEntry, deletePlayer } = useGame();
  const currentGame = state.currentGame!;
  
  // 從 state 中獲取最新的 player 數據，確保界面能立即更新
  const currentPlayer = currentGame?.players.find(p => p.id === player?.id) || player;

  const [newAmount, setNewAmount] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [editEntry, setEditEntry] = useState<BuyInEntry | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<BuyInEntry | null>(null);
  const [deletePlayerConfirmVisible, setDeletePlayerConfirmVisible] = useState(false);
  const [cashOutModalVisible, setCashOutModalVisible] = useState(false);
  const [buyInRecordsExpanded, setBuyInRecordsExpanded] = useState(false);
  const [cashOutRecordsExpanded, setCashOutRecordsExpanded] = useState(false);
  const [editCashOutModalVisible, setEditCashOutModalVisible] = useState(false);

  const styles = StyleSheet.create({
    section: { marginBottom: theme.spacing.lg },
    title: { fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
    totalBuyInRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalBuyInText: { fontSize: theme.fontSize.xl, fontWeight: '700', color: colorMode === 'dark' ? '#FFFFFF' : theme.colors.primary },
    listContainer: { maxHeight: 280, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm },
    expandableCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    cardTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    expandIcon: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    cardContent: {
      padding: theme.spacing.md,
      paddingTop: 0,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    amount: { fontWeight: '600', color: theme.colors.text },
    time: { color: theme.colors.textSecondary },
    actionText: { color: theme.colors.error, marginLeft: theme.spacing.md },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.md, color: theme.colors.text, backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface },
    addRow: { flexDirection: 'row', alignItems: 'center' },
    editButton: {
      color: colorMode === 'dark' ? '#666666' : '#9CA3AF',
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
    },
  });

  const handleAdd = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0 || !currentPlayer) { Alert.alert('錯誤', '請輸入有效金額'); return; }
    addBuyInEntry(currentGame.id, currentPlayer.id, amount);
    setNewAmount('');
  };

  const handleEdit = (entry: BuyInEntry) => {
    setEditEntry(entry);
    setEditAmount(String(entry.amount));
    setEditVisible(true);
  };

  const handleSaveEdit = (amount: number) => {
    if (!currentPlayer || !editEntry) return;
    updateBuyInEntry(currentGame.id, currentPlayer.id, { ...editEntry, amount });
    setEditEntry(null);
    setEditAmount('');
  };

  const handleDelete = (entry: BuyInEntry) => {
    if (!currentPlayer) return;
    
    // 在 Web 上使用自定義確認對話框，在移動端使用 Alert
    if (Platform.OS === 'web') {
      setEntryToDelete(entry);
      setDeleteConfirmVisible(true);
    } else {
      Alert.alert('刪除確認', '確定刪除這筆買入？', [
        { text: '取消', style: 'cancel' },
        { 
          text: '刪除', 
          style: 'destructive', 
          onPress: () => {
            deleteBuyInEntry(currentGame.id, currentPlayer.id, entry.id);
          }
        }
      ]);
    }
  };

  const handleConfirmDelete = () => {
    if (!currentPlayer || !entryToDelete) return;
    const remainingBuyIns = (currentPlayer.buyIns || []).filter(e => e.id !== entryToDelete.id);
    deleteBuyInEntry(currentGame.id, currentPlayer.id, entryToDelete.id);
    setEntryToDelete(null);
    
    // 如果刪除後沒有任何買入記錄，關閉 Modal
    if (remainingBuyIns.length === 0) {
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  // 刪除玩家
  const handleDeletePlayer = () => {
    if (Platform.OS === 'web') {
      setDeletePlayerConfirmVisible(true);
    } else {
      Alert.alert('刪除確認', `確定刪除玩家「${currentPlayer?.name}」？`, [
        { text: '取消', style: 'cancel' },
        { 
          text: '刪除', 
          style: 'destructive', 
          onPress: () => {
            if (currentPlayer) {
              deletePlayer(currentGame.id, currentPlayer.id);
              onClose();
            }
          }
        }
      ]);
    }
  };

  const handleConfirmDeletePlayer = () => {
    if (!currentPlayer) return;
    deletePlayer(currentGame.id, currentPlayer.id);
    setDeletePlayerConfirmVisible(false);
    onClose();
  };

  const totalBuyIn = useMemo(() => {
    const list = currentPlayer?.buyIns || [];
    return list.reduce((s, e) => s + e.amount, 0);
  }, [currentPlayer]);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const isCashedOut = currentPlayer?.status === 'cashed_out';
  const cashOutHost = (currentPlayer as any)?.cashOutHost as string | undefined;
  
  return (
    <Modal visible={visible} onClose={onClose} title={currentPlayer ? currentPlayer.name : t('game.players')}>
      {currentPlayer && (
        <View>
          <View style={styles.section}>
            {/* 刪除玩家按鈕 - 獨立一行，右對齊 */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: theme.spacing.xs }}>
              <TouchableOpacity 
                onPress={handleDeletePlayer}
                activeOpacity={0.7}
                style={{ 
                  paddingHorizontal: theme.spacing.sm, 
                  paddingVertical: theme.spacing.xs,
                }}
              >
                <Text style={{ 
                  color: theme.colors.error, 
                  fontSize: theme.fontSize.sm,
                  fontWeight: '600',
                }}>
                  刪除
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{t('playerDetails.totalBuyIn')}</Text>
            <View style={styles.totalBuyInRow}>
              <Text style={[styles.totalBuyInText, { color: colorMode === 'light' ? '#000000' : '#FFD700' }]}>$ {totalBuyIn.toLocaleString()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                {isCashedOut && (
                  <TouchableOpacity 
                    onPress={() => setEditCashOutModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Image 
                      source={colorMode === 'dark' 
                        ? EditBlackIconImage 
                        : EditIconImage} 
                      style={{ width: 20, height: 20 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                {!isCashedOut && (
                  <Button
                    title={t('modals.cashOut')}
                    onPress={() => setCashOutModalVisible(true)}
                    variant="primary"
                    size="md"
                    leftIconName="cashout"
                  />
                )}
              </View>
            </View>
          </View>

          {/* 已兌現玩家：兌現紀錄卡片 */}
          {isCashedOut && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.expandableCard}
                onPress={() => setEditCashOutModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>兌現紀錄</Text>
                </View>
                <View style={styles.cardContent}>
                  {cashOutHost && (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, marginBottom: theme.spacing.xs }}>
                      負責 Host：{cashOutHost}
                    </Text>
                  )}
                  <Text style={[
                    { fontSize: theme.fontSize.md, fontWeight: '600' },
                    currentPlayer.profit >= 0 ? { color: theme.colors.success } : { color: theme.colors.error }
                  ]}>
                    盈虧：{currentPlayer.profit >= 0 ? '+' : ''}{formatCurrency(currentPlayer.profit)}
                  </Text>
                  {(currentPlayer as any)?.cashOutAmount !== undefined && (
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, marginTop: theme.spacing.xs }}>
                      兌現金額：{formatCurrency((currentPlayer as any).cashOutAmount || 0)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* 未兌現玩家：買入紀錄可展開卡片 */}
          {!isCashedOut && (
            <View style={styles.section}>
              <View style={styles.expandableCard}>
                <TouchableOpacity 
                  style={styles.cardHeader}
                  onPress={() => setBuyInRecordsExpanded(!buyInRecordsExpanded)}
                  activeOpacity={1}
                >
                  <Text style={styles.cardTitle}>{t('playerDetails.buyInRecords')}</Text>
                  <Text style={styles.expandIcon}>{buyInRecordsExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                
                {buyInRecordsExpanded && (
                  <View style={styles.cardContent}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {(currentPlayer.buyIns || []).slice().sort((a,b)=>new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime()).map((entry, index, array) => (
                        <View 
                          key={entry.id}
                          style={[
                            styles.row,
                            { 
                              borderBottomWidth: index < array.length - 1 ? 1 : 0,
                              borderBottomColor: theme.colors.border,
                              paddingHorizontal: theme.spacing.md,
                              paddingVertical: theme.spacing.md,
                            }
                          ]}
                        >
                          <View>
                            <Text style={[styles.amount, { color: colorMode === 'light' ? '#000000' : '#FFD700' }]}>$ {entry.amount.toLocaleString()}</Text>
                            <Text style={styles.time}>
                              {new Date(entry.timestamp).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })} {new Date(entry.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity 
                              onPress={() => handleEdit(entry)} 
                              activeOpacity={0.7}
                              style={{ padding: theme.spacing.sm, marginRight: 0 }}
                            >
                              <Text style={{ color: colorMode === 'light' ? '#4B5563' : '#9CA3AF', fontWeight: '600' }}>{t('common.edit')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              onPress={() => handleDelete(entry)} 
                              activeOpacity={0.7}
                              style={{ padding: theme.spacing.sm }}
                            >
                              <Text style={[styles.actionText, { fontWeight: '600', marginLeft: 0 }]}>{t('common.delete')}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 未兌現玩家：新增買入 */}
          {!isCashedOut && (
            <View style={styles.section}>
              <Text style={styles.title}>{t('playerDetails.addBuyIn')}</Text>
              <View style={styles.addRow}>
                <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                  <TextInput
                    style={styles.input}
                    value={newAmount}
                    onChangeText={setNewAmount}
                    placeholder="$"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    textContentType="none"
                    autoComplete="off"
                    autoCorrect={false}
                  />
                </View>
                <Button 
                  title={t('common.add')} 
                  onPress={handleAdd} 
                  variant="primary"
                  style={{ marginBottom: 0 }}
                />
              </View>
            </View>
          )}
        </View>
      )}
      <BuyInEditModal
        visible={editVisible}
        onClose={() => {
          setEditVisible(false);
          setEditEntry(null);
          setEditAmount('');
        }}
        amount={editAmount}
        setAmount={setEditAmount}
        onSave={handleSaveEdit}
      />
      <ConfirmModal
        visible={deleteConfirmVisible}
        onClose={() => {
          setDeleteConfirmVisible(false);
          setEntryToDelete(null);
        }}
        title={t('common.delete')}
        message={t('playerDetails.deleteConfirm')}
        onConfirm={handleConfirmDelete}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="danger"
      />
      <CashOutModal
        visible={cashOutModalVisible || editCashOutModalVisible}
        onClose={() => {
          setCashOutModalVisible(false);
          setEditCashOutModalVisible(false);
        }}
        defaultPlayer={editCashOutModalVisible ? currentPlayer : (cashOutModalVisible ? currentPlayer : null)}
        isEditMode={editCashOutModalVisible}
        onCashOutSuccess={() => {
          // 兌現成功後，關閉買入 Modal，回到目前牌局界面
          setCashOutModalVisible(false);
          setEditCashOutModalVisible(false);
          if (cashOutModalVisible) {
            setTimeout(() => {
              onClose();
            }, 100);
          }
        }}
      />
      <ConfirmModal
        visible={deletePlayerConfirmVisible}
        onClose={() => setDeletePlayerConfirmVisible(false)}
        title="刪除玩家"
        message={`確定刪除玩家「${currentPlayer?.name}」？此操作無法復原。`}
        onConfirm={handleConfirmDeletePlayer}
        confirmText="刪除"
        cancelText="取消"
        confirmVariant="danger"
      />
    </Modal>
  );
};

export default PlayerDetailsModal;


