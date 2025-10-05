import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { Swipeable } from 'react-native-gesture-handler';
import InsuranceEditModal from './InsuranceEditModal';

interface InsuranceRecordsModalProps {
  visible: boolean;
  onClose: () => void;
  onAddInsurance: () => void;
}

const InsuranceRecordsModal: React.FC<InsuranceRecordsModalProps> = ({ visible, onClose, onAddInsurance }) => {
  const { theme } = useTheme();
  const { state, updateInsurance, deleteInsurance } = useGame();
  const currentGame = state.currentGame;
  const scrollRef = React.useRef<ScrollView>(null);
  const [editVisible, setEditVisible] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editAmount, setEditAmount] = React.useState('');

  const styles = StyleSheet.create({
    section: {
      marginBottom: theme.spacing.lg,
    },
    recordRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    amountPositive: { color: theme.colors.success, fontWeight: '600' },
    amountNegative: { color: theme.colors.error, fontWeight: '600' },
    timeText: { color: theme.colors.textSecondary },
    listContainer: {
      maxHeight: 380,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
  });

  React.useEffect(() => {
    if (visible) {
      // 開啟時自動滾到頂端
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} onClose={onClose} title="保險紀錄">
      {!currentGame ? (
        <Text style={{ color: theme.colors.textSecondary }}>沒有進行中的牌局</Text>
      ) : (
        <View>
          <View style={[styles.section, styles.listContainer]}> 
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled ref={scrollRef}>
              {currentGame.insurances
                .slice()
                .sort((a,b)=> new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((ins) => {
                  const amt = ins.amount;
                  const isPos = amt >= 0;
                  return (
                    <Swipeable
                      key={ins.id}
                      renderRightActions={() => (
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            style={{ justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.primary, marginRight: theme.spacing.xs, borderRadius: theme.borderRadius.sm }}
                            onPress={() => {
                              setEditId(ins.id);
                              setEditAmount(String(ins.amount));
                              setEditVisible(true);
                            }}
                          >
                            <Text style={{ color: '#FFF', fontWeight: '600' }}>編輯</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.error, borderRadius: theme.borderRadius.sm }}
                            onPress={() => {
                              if (!currentGame) return;
                              Alert.alert('刪除保險', '確定刪除這筆保險紀錄？', [
                                { text: '取消', style: 'cancel' },
                                { text: '刪除', style: 'destructive', onPress: () => deleteInsurance(currentGame.id, ins.id) },
                              ]);
                            }}
                          >
                            <Text style={{ color: '#FFF', fontWeight: '600' }}>刪除</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setEditId(ins.id);
                          setEditAmount(String(ins.amount));
                          setEditVisible(true);
                        }}
                        activeOpacity={1}
                      >
                        <View style={styles.row}>
                          <Text style={styles.timeText}>{new Date(ins.timestamp).toLocaleString('zh-TW')}</Text>
                          <Text style={isPos ? styles.amountPositive : styles.amountNegative}>
                            {isPos ? '+' : ''}${Math.abs(amt).toLocaleString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Swipeable>
                  );
                })}
              {currentGame.insurances.length === 0 && (
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.md }}>
                  尚無保險紀錄
                </Text>
              )}
            </ScrollView>
          </View>

          <Button title="新增保險" onPress={onAddInsurance} size="lg" />
          <InsuranceEditModal
            visible={editVisible}
            onClose={() => setEditVisible(false)}
            amount={editAmount}
            setAmount={setEditAmount}
            onSave={({ amount }) => {
              if (!currentGame || !editId) return;
              const origin = currentGame.insurances.find(i => i.id === editId);
              if (!origin) return;
              updateInsurance(currentGame.id, { ...origin, amount });
              setEditVisible(false);
              setEditId(null);
            }}
            partners={(currentGame?.insurances.find(i => i.id === editId)?.partners) || []}
          />
        </View>
      )}
    </Modal>
  );
};

export default InsuranceRecordsModal;


