import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import InsuranceEditModal from './InsuranceEditModal';

interface InsuranceRecordsModalProps {
  visible: boolean;
  onClose: () => void;
  onAddInsurance: () => void;
}

const InsuranceRecordsModal: React.FC<InsuranceRecordsModalProps> = ({ visible, onClose, onAddInsurance }) => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { state, updateInsurance, deleteInsurance } = useGame();
  const currentGame = state.currentGame;
  const scrollRef = React.useRef<ScrollView>(null);
  const [editVisible, setEditVisible] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editAmount, setEditAmount] = React.useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [insuranceToDelete, setInsuranceToDelete] = React.useState<{ id: string; label: string } | null>(null);

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
    rowLeft: {
      flexDirection: 'column',
      flex: 1,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: theme.spacing.sm,
    },
    actionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      marginLeft: theme.spacing.xs,
    },
    editButton: {
      backgroundColor: theme.colors.primary,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    actionText: {
      color: '#FFF',
      fontWeight: '600',
      fontSize: theme.fontSize.sm,
    },
    partnersText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
      // 同行顯示時沿用樣式（目前僅作為文字色彩與字級）
    },
  });

  React.useEffect(() => {
    if (visible) {
      // 開啟時自動滾到頂端
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} onClose={onClose} title={t('modals.insurance')}>
      {!currentGame ? (
        <Text style={{ color: theme.colors.textSecondary }}>{t('insurance.errorNoGame')}</Text>
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
                  const partnersLabel =
                    (ins.partners || []).length > 0
                      ? (ins.partners || [])
                          .map(p => `${p.name} ${p.percentage}%`)
                          .join('、')
                      : '';
                  const timeString = new Date(ins.timestamp).toLocaleString(
                    language === 'zh-TW' ? 'zh-TW' : 'zh-CN',
                  );
                  const headerLabel = partnersLabel
                    ? `${timeString}  ${partnersLabel}`
                    : timeString;
                  return (
                    <View key={ins.id} style={styles.row}>
                      <TouchableOpacity
                        style={styles.rowLeft}
                        onPress={() => {
                          setEditId(ins.id);
                          setEditAmount(String(ins.amount));
                          setEditVisible(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.timeText}>{headerLabel}</Text>
                        <Text style={isPos ? styles.amountPositive : styles.amountNegative}>
                          {isPos ? '+' : ''}${Math.abs(amt).toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.rowRight}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => {
                            setEditId(ins.id);
                            setEditAmount(String(ins.amount));
                            setEditVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.actionText}>{t('common.edit')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => {
                            if (!currentGame) return;
                            const label = `${new Date(ins.timestamp).toLocaleString(
                              language === 'zh-TW' ? 'zh-TW' : 'zh-CN',
                            )}  $${Math.abs(amt).toLocaleString()}`;
                            setInsuranceToDelete({ id: ins.id, label });
                            setDeleteConfirmVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.actionText}>{t('common.delete')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              {currentGame.insurances.length === 0 && (
                <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.md }}>
                  {t('insurance.noRecords')}
                </Text>
              )}
            </ScrollView>
          </View>

          <Button title={t('insurance.addInsurance')} onPress={onAddInsurance} size="lg" />

          {/* 刪除保險紀錄確認視窗（避免使用 Alert，在 Web 上也可正常顯示） */}
          <Modal
            visible={deleteConfirmVisible}
            onClose={() => {
              setDeleteConfirmVisible(false);
              setInsuranceToDelete(null);
            }}
            title={t('insurance.delete') || '刪除保險'}
          >
            <View style={{ paddingVertical: theme.spacing.md }}>
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  color: theme.colors.text,
                  marginBottom: theme.spacing.lg,
                }}
              >
                {insuranceToDelete
                  ? `${t('insurance.deleteConfirm') || '確定刪除這筆保險紀錄？'}\n\n${insuranceToDelete.label}`
                  : t('insurance.deleteConfirm') || '確定刪除這筆保險紀錄？'}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => {
                    setDeleteConfirmVisible(false);
                    setInsuranceToDelete(null);
                  }}
                  style={{ marginRight: theme.spacing.md }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (!currentGame || !insuranceToDelete) return;
                    deleteInsurance(currentGame.id, insuranceToDelete.id);
                    setDeleteConfirmVisible(false);
                    setInsuranceToDelete(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: theme.colors.error, fontWeight: '700' }}>
                    {t('common.delete')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <InsuranceEditModal
            visible={editVisible}
            onClose={() => setEditVisible(false)}
            amount={editAmount}
            setAmount={setEditAmount}
            onSave={({ amount, partners }) => {
              if (!currentGame || !editId) return;
              const origin = currentGame.insurances.find(i => i.id === editId);
              if (!origin) return;
              updateInsurance(currentGame.id, { ...origin, amount, partners });
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


