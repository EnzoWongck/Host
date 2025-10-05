import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { BuyInEntry, Player } from '../types/game';

interface PlayerDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  player: Player | null;
}

const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({ visible, onClose, player }) => {
  const { theme } = useTheme();
  const { state, addBuyInEntry, updateBuyInEntry, deleteBuyInEntry } = useGame();
  const currentGame = state.currentGame!;

  const [newAmount, setNewAmount] = useState('');

  const styles = StyleSheet.create({
    section: { marginBottom: theme.spacing.lg },
    title: { fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
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
    if (isNaN(amount) || amount <= 0 || !player) { Alert.alert('錯誤', '請輸入有效金額'); return; }
    addBuyInEntry(currentGame.id, player.id, amount);
    setNewAmount('');
  };

  const handleEdit = (entry: BuyInEntry) => {
    Alert.prompt?.('編輯金額', '請輸入新的金額', [
      { text: '取消', style: 'cancel' },
      { text: '確定', onPress: (text) => {
          const amt = parseFloat(text || '');
          if (isNaN(amt) || amt <= 0 || !player) { Alert.alert('錯誤', '金額無效'); return; }
          updateBuyInEntry(currentGame.id, player.id, { ...entry, amount: amt });
        } }
    ], 'plain-text', String(entry.amount));
  };

  const handleDelete = (entry: BuyInEntry) => {
    if (!player) return;
    Alert.alert('刪除確認', '確定刪除這筆買入？', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => deleteBuyInEntry(currentGame.id, player.id, entry.id) }
    ]);
  };

  const totalBuyIn = useMemo(() => {
    const list = player?.buyIns || [];
    return list.reduce((s, e) => s + e.amount, 0);
  }, [player]);

  return (
    <Modal visible={visible} onClose={onClose} title={player ? `${player.name} 的買入` : '玩家買入'}>
      {player && (
        <View>
          <View style={styles.section}>
            <Text style={styles.title}>總買入</Text>
            <Text style={{ fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.primary }}>$ {totalBuyIn.toLocaleString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>買入紀錄</Text>
            <View style={styles.listContainer}>
              <ScrollView nestedScrollEnabled>
                {(player.buyIns || []).slice().sort((a,b)=>new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime()).map(entry => (
                  <View style={styles.row} key={entry.id}>
                    <View>
                      <Text style={styles.amount}>$ {entry.amount.toLocaleString()}</Text>
                      <Text style={styles.time}>{new Date(entry.timestamp).toLocaleString('zh-TW')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => handleEdit(entry)} activeOpacity={1}>
                        <Text style={{ color: theme.colors.primary }}>編輯</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(entry)} activeOpacity={1}>
                        <Text style={styles.actionText}>刪除</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.title}>新增買入</Text>
            <View style={styles.addRow}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <TextInput
                  style={styles.input}
                  value={newAmount}
                  onChangeText={setNewAmount}
                  placeholder="金額"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <Button title="新增" onPress={handleAdd} />
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

export default PlayerDetailsModal;


