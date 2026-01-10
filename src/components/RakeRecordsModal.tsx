import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { Rake } from '../types/game';
import { Swipeable } from 'react-native-gesture-handler';
import SwipeHint from './SwipeHint';

interface RakeRecordsModalProps {
  visible: boolean;
  onClose: () => void;
}

const RakeRecordsModal: React.FC<RakeRecordsModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { t, language } = useLanguage();
  const { state, updateRake, deleteRake } = useGame();
  const currentGame = state.currentGame;

  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editTime, setEditTime] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [rakeToDelete, setRakeToDelete] = useState<string | null>(null);

  const styles = StyleSheet.create({
    listContainer: { maxHeight: 420 },
    row: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingVertical: theme.spacing.sm, 
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1, 
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    rowContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
    },
    amount: { fontWeight: '600', color: theme.colors.text, fontSize: theme.fontSize.md },
    time: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm },
    actionButtons: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
    actionButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      minWidth: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButton: {
      backgroundColor: theme.colors.primary,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    editRow: { 
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surface + '80',
      marginTop: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    input: { 
      borderWidth: 1, 
      borderColor: theme.colors.border, 
      borderRadius: theme.borderRadius.sm, 
      padding: theme.spacing.sm, 
      color: theme.colors.text, 
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface, 
      marginBottom: theme.spacing.xs 
    },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: theme.spacing.xs },
  });

  const startEdit = (r: Rake) => {
    setEditId(r.id);
    setEditAmount(String(r.amount));
    setEditTime(new Date(r.timestamp).toLocaleTimeString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }));
  };

  const confirmEdit = (r: Rake) => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt)) { Alert.alert(t('common.error') || '錯誤', t('rake.errorAmountRequired')); return; }
    const tsBase = r.timestamp ? new Date(r.timestamp) : new Date();
    const [h,m] = (editTime || '').split(':');
    if (h && m) { tsBase.setHours(Number(h)); tsBase.setMinutes(Number(m)); }
    updateRake(currentGame!.id, { ...r, amount: amt, timestamp: tsBase });
    setEditId(null);
  };

  const askDelete = (id: string) => {
    if (Platform.OS === 'web') {
      setRakeToDelete(id);
      setDeleteConfirmVisible(true);
    } else {
      Alert.alert(t('rake.deleteRake') || '刪除抽水', t('rake.deleteConfirm') || '確定刪除這筆抽水？', [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteRake(currentGame!.id, id) },
      ]);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title={t('rake.viewRecords')}>
      {!currentGame ? (
        <Text style={{ color: theme.colors.textSecondary }}>{t('rake.errorNoGame')}</Text>
      ) : (
        <View style={styles.listContainer}>
          {/* 滑動提示（首次顯示） */}
          {currentGame.rakes && currentGame.rakes.length > 0 && Platform.OS !== 'web' && (
            <SwipeHint storageKey="rakeRecords" />
          )}
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {currentGame.rakes
              .slice()
              .sort((a,b)=> new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(r => {
                const rowContent = (
                  <View style={styles.row}>
                    <View style={styles.rowContent}>
                      <Text style={styles.amount}>$ {r.amount.toLocaleString()}</Text>
                      <Text style={styles.time}>{new Date(r.timestamp).toLocaleString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    {/* 在 Web 平台顯示編輯和刪除按鈕 */}
                    {Platform.OS === 'web' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.editButton]} 
                          onPress={() => startEdit(r)} 
                          activeOpacity={0.7}
                        >
                          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: theme.fontSize.sm, paddingHorizontal: theme.spacing.xs }}>{t('common.edit')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.deleteButton]} 
                          onPress={() => askDelete(r.id)} 
                          activeOpacity={0.7}
                        >
                          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: theme.fontSize.sm, paddingHorizontal: theme.spacing.xs }}>{t('common.delete')}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );

                // 在移動平台使用 Swipeable，Web 平台直接顯示按鈕
                if (Platform.OS === 'web') {
                  return (
                    <View key={r.id}>
                      {rowContent}
                      {editId === r.id && (
                        <View style={styles.editRow}>
                          <TextInput style={styles.input} value={editAmount} onChangeText={setEditAmount} placeholder="$" keyboardType={Platform.OS === 'web' ? 'default' : 'numbers-and-punctuation'} />
                          <TextInput style={styles.input} value={editTime} onChangeText={setEditTime} placeholder={t('rake.timePlaceholder')} />
                          <View style={styles.editActions}>
                            <Button title={t('common.cancel')} variant="outline" onPress={() => setEditId(null)} size="sm" style={{ marginRight: theme.spacing.sm }} />
                            <Button title={t('common.save')} onPress={() => confirmEdit(r)} size="sm" />
                          </View>
                        </View>
                      )}
                    </View>
                  );
                }

                return (
                  <Swipeable
                    key={r.id}
                    renderRightActions={() => (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity 
                          style={{ 
                            justifyContent: 'center', 
                            paddingHorizontal: theme.spacing.md, 
                            backgroundColor: theme.colors.primary, 
                            marginRight: theme.spacing.xs, 
                            borderRadius: theme.borderRadius.sm,
                            height: '100%',
                          }} 
                          onPress={() => startEdit(r)} 
                          activeOpacity={1}
                        >
                          <Text style={{ color: '#FFF', fontWeight: '600' }}>{t('common.edit')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={{ 
                            justifyContent: 'center', 
                            paddingHorizontal: theme.spacing.md, 
                            backgroundColor: theme.colors.error, 
                            borderRadius: theme.borderRadius.sm,
                            height: '100%',
                          }} 
                          onPress={() => askDelete(r.id)} 
                          activeOpacity={1}
                        >
                          <Text style={{ color: '#FFF', fontWeight: '600' }}>{t('common.delete')}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  >
                    {rowContent}
                    {editId === r.id && (
                      <View style={styles.editRow}>
                        <TextInput style={styles.input} value={editAmount} onChangeText={setEditAmount} placeholder="$" keyboardType="numeric" />
                        <TextInput style={styles.input} value={editTime} onChangeText={setEditTime} placeholder={t('rake.timePlaceholder')} />
                        <View style={styles.editActions}>
                          <Button title={t('common.cancel')} variant="outline" onPress={() => setEditId(null)} size="sm" style={{ marginRight: theme.spacing.sm }} />
                          <Button title={t('common.save')} onPress={() => confirmEdit(r)} size="sm" />
                        </View>
                      </View>
                    )}
                  </Swipeable>
                );
              })}
            {currentGame.rakes.length === 0 && (
              <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.md }}>{t('rake.noRecords')}</Text>
            )}
          </ScrollView>
        </View>
      )}
      
      {/* 刪除確認對話框（Web） */}
      <ConfirmModal
        visible={deleteConfirmVisible}
        onClose={() => {
          setDeleteConfirmVisible(false);
          setRakeToDelete(null);
        }}
        title={t('rake.deleteRake') || '刪除抽水'}
        message={t('rake.deleteConfirm') || '確定刪除這筆抽水？'}
        onConfirm={() => {
          if (currentGame && rakeToDelete) {
            deleteRake(currentGame.id, rakeToDelete);
          }
          setDeleteConfirmVisible(false);
          setRakeToDelete(null);
        }}
        confirmText={t('common.delete') || '刪除'}
        cancelText={t('common.cancel') || '取消'}
        confirmVariant="danger"
      />
    </Modal>
  );
};

export default RakeRecordsModal;


