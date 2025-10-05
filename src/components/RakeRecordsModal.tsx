import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { Rake } from '../types/game';
import { Swipeable } from 'react-native-gesture-handler';

interface RakeRecordsModalProps {
  visible: boolean;
  onClose: () => void;
}

const RakeRecordsModal: React.FC<RakeRecordsModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { state, updateRake, deleteRake } = useGame();
  const currentGame = state.currentGame;

  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editTime, setEditTime] = useState('');

  const styles = StyleSheet.create({
    listContainer: { maxHeight: 420 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    amount: { fontWeight: '600', color: theme.colors.text },
    time: { color: theme.colors.textSecondary },
    editRow: { paddingVertical: theme.spacing.sm },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.sm, color: theme.colors.text, backgroundColor: theme.colors.background, marginBottom: theme.spacing.xs },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  });

  const startEdit = (r: Rake) => {
    setEditId(r.id);
    setEditAmount(String(r.amount));
    setEditTime(new Date(r.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }));
  };

  const confirmEdit = (r: Rake) => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0) { Alert.alert('錯誤', '請輸入有效金額'); return; }
    const tsBase = r.timestamp ? new Date(r.timestamp) : new Date();
    const [h,m] = (editTime || '').split(':');
    if (h && m) { tsBase.setHours(Number(h)); tsBase.setMinutes(Number(m)); }
    updateRake(currentGame!.id, { ...r, amount: amt, timestamp: tsBase });
    setEditId(null);
  };

  const askDelete = (id: string) => {
    Alert.alert('刪除抽水', '確定刪除這筆抽水？', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => deleteRake(currentGame!.id, id) },
    ]);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="抽水紀錄">
      {!currentGame ? (
        <Text style={{ color: theme.colors.textSecondary }}>沒有進行中的牌局</Text>
      ) : (
        <View style={styles.listContainer}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {currentGame.rakes
              .slice()
              .sort((a,b)=> new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(r => (
                <Swipeable
                  key={r.id}
                  renderRightActions={() => (
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity style={{ justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.primary, marginRight: theme.spacing.xs, borderRadius: theme.borderRadius.sm }} onPress={() => startEdit(r)} activeOpacity={1}>
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>編輯</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.error, borderRadius: theme.borderRadius.sm }} onPress={() => askDelete(r.id)} activeOpacity={1}>
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>刪除</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                >
                  <View style={styles.row}>
                    <Text style={styles.amount}>$ {r.amount.toLocaleString()}</Text>
                    <Text style={styles.time}>{new Date(r.timestamp).toLocaleString('zh-TW')}</Text>
                  </View>
                  {editId === r.id && (
                    <View style={styles.editRow}>
                      <TextInput style={styles.input} value={editAmount} onChangeText={setEditAmount} placeholder="金額" keyboardType="numeric" />
                      <TextInput style={styles.input} value={editTime} onChangeText={setEditTime} placeholder="時間 HH:MM" />
                      <View style={styles.editActions}>
                        <Button title="取消" variant="outline" onPress={() => setEditId(null)} style={{ marginRight: theme.spacing.sm }} />
                        <Button title="儲存" onPress={() => confirmEdit(r)} />
                      </View>
                    </View>
                  )}
                </Swipeable>
              ))}
            {currentGame.rakes.length === 0 && (
              <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.md }}>尚無抽水紀錄</Text>
            )}
          </ScrollView>
        </View>
      )}
    </Modal>
  );
};

export default RakeRecordsModal;


