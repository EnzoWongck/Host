import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import BuyInEditModal from './BuyInEditModal';
import ConfirmModal from './ConfirmModal';
import CashOutModal from './CashOutModal';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { BuyInEntry, Player } from '../types/game';

interface PlayerDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  player: Player | null;
}

const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({ visible, onClose, player }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { state, addBuyInEntry, updateBuyInEntry, deleteBuyInEntry } = useGame();
  const currentGame = state.currentGame!;
  
  // 從 state 中獲取最新的 player 數據，確保界面能立即更新
  const currentPlayer = currentGame?.players.find(p => p.id === player?.id) || player;

  const [newAmount, setNewAmount] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [editEntry, setEditEntry] = useState<BuyInEntry | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<BuyInEntry | null>(null);
  const [cashOutModalVisible, setCashOutModalVisible] = useState(false);

  const styles = StyleSheet.create({
    section: { marginBottom: theme.spacing.lg },
    title: { fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
    totalBuyInRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalBuyInText: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.primary },
    listContainer: { maxHeight: 280, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    amount: { fontWeight: '600', color: theme.colors.text },
    time: { color: theme.colors.textSecondary },
    actionText: { color: theme.colors.error, marginLeft: theme.spacing.md },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.md, color: theme.colors.text, backgroundColor: theme.colors.background },
    addRow: { flexDirection: 'row', alignItems: 'center' },
  });

  const handleAdd = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0 || !currentPlayer) { Alert.alert('錯誤', '請輸入有效金額'); return; }
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

  const totalBuyIn = useMemo(() => {
    const list = currentPlayer?.buyIns || [];
    return list.reduce((s, e) => s + e.amount, 0);
  }, [currentPlayer]);

  return (
    <Modal visible={visible} onClose={onClose} title={currentPlayer ? `${currentPlayer.name} ${t('playerDetails.buyIn')}` : `${t('game.players')}${t('playerDetails.buyIn')}`}>
      {currentPlayer && (
        <View>
          <View style={styles.section}>
            <Text style={styles.title}>{t('playerDetails.totalBuyIn')}</Text>
            <View style={styles.totalBuyInRow}>
              <Text style={styles.totalBuyInText}>$ {totalBuyIn.toLocaleString()}</Text>
              <Button
                title={t('modals.cashOut')}
                onPress={() => setCashOutModalVisible(true)}
                variant="primary"
                size="md"
                leftIconName="cashout"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>{t('playerDetails.buyInRecords')}</Text>
            <View style={styles.listContainer}>
              <ScrollView nestedScrollEnabled>
                {(currentPlayer.buyIns || []).slice().sort((a,b)=>new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime()).map(entry => (
                  <View style={styles.row} key={entry.id}>
                    <View>
                      <Text style={styles.amount}>$ {entry.amount.toLocaleString()}</Text>
                      <Text style={styles.time}>{new Date(entry.timestamp).toLocaleString('zh-TW')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity 
                        onPress={() => handleEdit(entry)} 
                        activeOpacity={0.7}
                        style={{ padding: theme.spacing.sm, marginRight: theme.spacing.md }}
                      >
                        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{t('common.edit')}</Text>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>{t('playerDetails.addBuyIn')}</Text>
            <View style={styles.addRow}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <TextInput
                  style={styles.input}
                  value={newAmount}
                  onChangeText={setNewAmount}
                  placeholder={t('playerDetails.amount')}
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <Button title={t('common.add')} onPress={handleAdd} />
            </View>
          </View>
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
        visible={cashOutModalVisible}
        onClose={() => {
          setCashOutModalVisible(false);
        }}
        defaultPlayer={currentPlayer}
        onCashOutSuccess={() => {
          // 兌現成功後，關閉買入 Modal，回到目前牌局界面
          setCashOutModalVisible(false);
          setTimeout(() => {
            onClose();
          }, 100);
        }}
      />
    </Modal>
  );
};

export default PlayerDetailsModal;


