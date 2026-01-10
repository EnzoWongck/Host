import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform, Dimensions } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import InsuranceEditModal from './InsuranceEditModal';
import { InsurancePartner } from '../types/game';

interface InsuranceRecordsModalProps {
  visible: boolean;
  onClose: () => void;
  onAddInsurance: () => void;
  showOnlyDefaultPartners?: boolean;
}

interface DefaultPartnerInput {
  id: string;
  name: string;
  percentage: string;
}

const InsuranceRecordsModal: React.FC<InsuranceRecordsModalProps> = ({ visible, onClose, onAddInsurance, showOnlyDefaultPartners = false }) => {
  const { theme, colorMode } = useTheme();
  const { t, language } = useLanguage();
  const { state, updateInsurance, deleteInsurance, setDefaultInsurancePartners } = useGame();
  const { showToast } = useToast();

  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768; // 判斷是否為手機

  const currentGame = state.currentGame;
  const scrollRef = React.useRef<ScrollView>(null);
  const [editVisible, setEditVisible] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editAmount, setEditAmount] = React.useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = React.useState(false);
  const [insuranceToDelete, setInsuranceToDelete] = React.useState<{ id: string; label: string } | null>(null);

  // 設定預設分成的狀態
  const [defaultPartnerInputs, setDefaultPartnerInputs] = useState<DefaultPartnerInput[]>([]);
  const [isSavingDefault, setIsSavingDefault] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [editingDefaultPartners, setEditingDefaultPartners] = useState(false);

  const selectionBorderColor = colorMode === 'dark' ? '#FFFFFF' : theme.colors.text;
  const selectionCardBackground = colorMode === 'dark' ? theme.colors.surface : '#FFFFFF';

  const styles = StyleSheet.create({
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
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
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    inputFocused: {
      borderColor: colorMode === 'light' ? '#E2E8F0' : theme.colors.primary,
      borderWidth: 2,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    partnerRow: {
      marginBottom: theme.spacing.xs,
    },
    partnerInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    partnerNameInput: {
      flex: 2,
      marginRight: theme.spacing.xs,
    },
    partnerPercentageInput: {
      flex: 1,
      marginRight: theme.spacing.xs,
    },
    partnerRemoveButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    partnerRemoveText: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.error,
    },
    addPartnerButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xs,
      marginVertical: theme.spacing.sm,
    },
    addPartnerText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    totalPercentage: {
      padding: theme.spacing.md,
      backgroundColor: selectionCardBackground,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: selectionBorderColor,
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    totalPercentageText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: colorMode === 'dark' ? '#FFFFFF' : theme.colors.text,
      textAlign: 'center',
    },
    totalPercentageWarning: {
      backgroundColor: theme.colors.error + '10',
      borderColor: theme.colors.error,
    },
    totalPercentageWarningText: {
      color: theme.colors.error,
    },
    defaultPartnerDisplay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    defaultPartnerText: {
      color: theme.colors.text,
    },
    defaultPartnerPct: {
      color: theme.colors.textSecondary,
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
    },
  });

  // 計算預設分成的總百分比（實時更新）
  const calculateDefaultTotalPercentage = () => {
    return defaultPartnerInputs.reduce((sum, input) => {
      const pct = parseFloat(input.percentage) || 0;
      return sum + pct;
    }, 0);
  };

  // 自動round up到100%
  const roundUpPercentages = (inputs: DefaultPartnerInput[]): InsurancePartner[] => {
    const total = inputs.reduce((sum, input) => {
      const pct = parseFloat(input.percentage) || 0;
      return sum + pct;
    }, 0);

    if (total === 0) return [];

    // 如果總和接近100%（在99.9%到100.1%之間），自動調整
    if (Math.abs(total - 100) <= 0.1) {
      return inputs
        .filter(input => input.name.trim() && (parseFloat(input.percentage) || 0) > 0)
        .map(input => ({
          id: input.id,
          name: input.name.trim(),
          percentage: parseFloat(input.percentage) || 0,
        }));
    }

    // 否則按比例調整到100%
    const scale = 100 / total;
    return inputs
      .filter(input => input.name.trim() && (parseFloat(input.percentage) || 0) > 0)
      .map((input, index, filtered) => {
        const pct = (parseFloat(input.percentage) || 0) * scale;
        // 最後一個調整到100%以確保總和精確
        if (index === filtered.length - 1) {
          const prevSum = filtered.slice(0, index).reduce((sum, i) => {
            return sum + (parseFloat(i.percentage) || 0) * scale;
          }, 0);
          return {
            id: input.id,
            name: input.name.trim(),
            percentage: Math.round((100 - prevSum) * 10) / 10,
          };
        }
        return {
          id: input.id,
          name: input.name.trim(),
          percentage: Math.round(pct * 10) / 10,
        };
      });
  };

  useEffect(() => {
    if (visible && currentGame) {
      // 每次開啟視窗時，重置為非編輯模式
      setEditingDefaultPartners(false);
      // 初始化設定預設分成的輸入欄
      const defaultPartners = currentGame.defaultInsurancePartners || [];
      if (defaultPartners.length > 0) {
        setDefaultPartnerInputs(
          defaultPartners.map(p => ({
            id: p.id,
            name: p.name,
            percentage: p.percentage.toString(),
          }))
        );
      } else {
        setDefaultPartnerInputs([
          { id: Date.now().toString(), name: '', percentage: '' },
        ]);
      }
    }
  }, [visible, currentGame]);

  React.useEffect(() => {
    if (visible) {
      // 開啟時自動滾到頂端
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 0);
    }
  }, [visible]);

  const addDefaultPartnerInput = () => {
    setDefaultPartnerInputs([
      ...defaultPartnerInputs,
      { id: Date.now().toString() + Math.random(), name: '', percentage: '' },
    ]);
  };

  const removeDefaultPartnerInput = (id: string) => {
    if (defaultPartnerInputs.length > 1) {
      setDefaultPartnerInputs(defaultPartnerInputs.filter(input => input.id !== id));
    }
  };

  const updateDefaultPartnerName = (id: string, name: string) => {
    setDefaultPartnerInputs(
      defaultPartnerInputs.map(input =>
        input.id === id ? { ...input, name } : input
      )
    );
  };

  const updateDefaultPartnerPercentage = (id: string, percentage: string) => {
    // 只允許數字和小數點
    const numericValue = percentage.replace(/[^0-9.]/g, '');
    
    // 檢測是否輸入 "33" 且為整數（用於自動設置3等份）
    const currentInputIndex = defaultPartnerInputs.findIndex(input => input.id === id);
    const isFirstInput = currentInputIndex === 0;
    
    // 如果輸入為 "33" 且沒有小數點，且是第一個輸入欄
    if (numericValue === '33' && !numericValue.includes('.') && isFirstInput) {
      // 確保有3個分成者輸入欄
      let updatedInputs = [...defaultPartnerInputs];
      
      // 如果只有一個分成者，添加另外兩個
      if (updatedInputs.length < 3) {
        while (updatedInputs.length < 3) {
          updatedInputs.push({
            id: Date.now().toString() + Math.random(),
            name: '',
            percentage: '',
          });
        }
      }
      
      // 將所有分成者（最多3個）設置為 33.3
      updatedInputs = updatedInputs.slice(0, 3).map((input, index) => ({
        ...input,
        percentage: '33.3',
      }));
      
      setDefaultPartnerInputs(updatedInputs);
      return;
    }
    
    setDefaultPartnerInputs(
      defaultPartnerInputs.map(input =>
        input.id === id ? { ...input, percentage: numericValue } : input
      )
    );
  };

  const handleSaveDefaultPartners = () => {
    if (!currentGame) return;

    const validInputs = defaultPartnerInputs.filter(
      input => input.name.trim() && (parseFloat(input.percentage) || 0) > 0
    );

    if (validInputs.length === 0) {
      Alert.alert(t('common.error') || '錯誤', '請至少輸入一個分成者');
      return;
    }

    const totalPercentage = calculateDefaultTotalPercentage();
    const roundedPartners = roundUpPercentages(validInputs);
    const roundedTotal = roundedPartners.reduce((sum, p) => sum + p.percentage, 0);

    // 如果調整後仍不是100%，顯示錯誤（但允許在99.9-100.1%範圍內）
    if (Math.abs(roundedTotal - 100) > 0.1) {
      Alert.alert(
        t('common.error') || '錯誤',
        `總分成比例必須接近 100%，目前為 ${roundedTotal.toFixed(1)}%`
      );
      return;
    }

    setIsSavingDefault(true);
    setDefaultInsurancePartners(currentGame.id, roundedPartners);
    
    // 儲存後關閉編輯模式
    setEditingDefaultPartners(false);

    setIsSavingDefault(false);
    showToast(t('insurance.successDefaultSaved') || '預設分成已儲存', 'success');
  };

  const defaultTotalPercentage = calculateDefaultTotalPercentage();
  const isDefaultPercentageValid = Math.abs(defaultTotalPercentage - 100) <= 0.1 && defaultTotalPercentage > 0;
  const defaultTotalPercentageWarning = defaultTotalPercentage > 0 && !isDefaultPercentageValid;

  return (
    <Modal 
      visible={visible} 
      onClose={onClose} 
      title={showOnlyDefaultPartners ? (t('insurance.defaultPartners') || '預設分成') : t('modals.insurance')} 
      maxWidth={isMobile ? screenWidth - 32 : 400} 
      maxHeight={isMobile ? screenHeight * 0.9 : undefined}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : { width: 400, minWidth: 400, maxWidth: 'none' }}
    >
      {!currentGame ? (
        <Text style={{ color: theme.colors.textSecondary }}>{t('insurance.errorNoGame')}</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled ref={scrollRef} contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}>
          {/* 設定預設分成 - 移到主視窗，放在保險記錄上方 */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <Text style={styles.sectionTitle}>{t('insurance.defaultPartners') || '預設分成'}</Text>
            </View>
            
            {/* 顯示當前預設分成 */}
            {(currentGame.defaultInsurancePartners || []).length > 0 && (
              <View style={{ marginBottom: theme.spacing.md }}>
                {(currentGame.defaultInsurancePartners || []).map(p => (
                  <View key={p.id} style={styles.defaultPartnerDisplay}>
                    <Text style={styles.defaultPartnerText}>{p.name}</Text>
                    <Text style={styles.defaultPartnerPct}>{p.percentage}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 設定預設分成按鈕 */}
            {!editingDefaultPartners && (
              <TouchableOpacity
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colorMode === 'dark' ? theme.colors.border : '#06b6d4',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 10,
                  marginBottom: theme.spacing.md,
                }}
                onPress={() => {
                  // 開啟編輯模式時，初始化輸入欄
                  const defaultPartners = currentGame.defaultInsurancePartners || [];
                  if (defaultPartners.length > 0) {
                    setDefaultPartnerInputs(
                      defaultPartners.map(p => ({
                        id: p.id,
                        name: p.name,
                        percentage: p.percentage.toString(),
                      }))
                    );
                  } else {
                    setDefaultPartnerInputs([
                      { id: Date.now().toString(), name: '', percentage: '' },
                    ]);
                  }
                  setEditingDefaultPartners(true);
                }}
                activeOpacity={0.9}
              >
                <Text style={{ color: colorMode === 'dark' ? theme.colors.text : '#06b6d4', fontWeight: '700', textAlign: 'center' }}>
                  設定預設分成
                </Text>
              </TouchableOpacity>
            )}

            {/* 編輯預設分成的表單 */}
            {editingDefaultPartners && (
              <>
                {/* 設定預設分成的輸入欄 */}
                {defaultPartnerInputs.map((input, index) => (
                  <View key={input.id} style={styles.partnerRow}>
                    <View style={styles.partnerInputRow}>
                    <View style={styles.partnerNameInput}>
                      {index === 0 && (
                        <Text style={[styles.label, { marginBottom: theme.spacing.xs }]}>
                          {t('insurance.partnerName') || '分成者名稱'}
                        </Text>
                      )}
                      <TextInput
                        style={[
                          styles.input,
                          focusedInput === `default-name-${input.id}` && styles.inputFocused,
                        ]}
                        value={input.name}
                        onChangeText={(value) => updateDefaultPartnerName(input.id, value)}
                        placeholder={t('insurance.namePlaceholder') || '名稱'}
                        placeholderTextColor={
                          focusedInput === `default-name-${input.id}`
                            ? 'transparent'
                            : theme.colors.textSecondary
                        }
                        onFocus={() => setFocusedInput(`default-name-${input.id}`)}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>
                    <View style={styles.partnerPercentageInput}>
                      {index === 0 && (
                        <Text style={[styles.label, { marginBottom: theme.spacing.xs }]}>
                          {t('insurance.percentage') || '百分比'}
                        </Text>
                      )}
                      <TextInput
                        style={[
                          styles.input,
                          focusedInput === `default-pct-${input.id}` && styles.inputFocused,
                        ]}
                        value={input.percentage}
                        onChangeText={(value) => updateDefaultPartnerPercentage(input.id, value)}
                        placeholder="%"
                        placeholderTextColor={
                          focusedInput === `default-pct-${input.id}`
                            ? 'transparent'
                            : theme.colors.textSecondary
                        }
                        onFocus={() => setFocusedInput(`default-pct-${input.id}`)}
                        onBlur={() => setFocusedInput(null)}
                        keyboardType="numeric"
                        inputMode="decimal"
                        {...(Platform.OS === 'web' ? { pattern: '[0-9.]*' } : {})}
                      />
                    </View>
                      {defaultPartnerInputs.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeDefaultPartnerInput(input.id)}
                          activeOpacity={0.7}
                          style={styles.partnerRemoveButton}
                        >
                          <Text style={styles.partnerRemoveText}>{t('common.delete') || '刪除'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                {/* +新增分成者 */}
                <TouchableOpacity
                  onPress={addDefaultPartnerInput}
                  activeOpacity={0.7}
                  style={[styles.addPartnerButton, { alignItems: 'center', justifyContent: 'center' }]}
                >
                  <Text style={styles.addPartnerText}>+分成者</Text>
                </TouchableOpacity>

                {/* 總分成比例顯示 */}
                {defaultTotalPercentage > 0 && (
                  <View
                    style={[
                      styles.totalPercentage,
                      defaultTotalPercentageWarning && styles.totalPercentageWarning,
                    ]}
                  >
                    <Text
                      style={[
                        styles.totalPercentageText,
                        defaultTotalPercentageWarning && styles.totalPercentageWarningText,
                      ]}
                    >
                      {t('insurance.totalPercentage') || '總分成比例'}{defaultTotalPercentage.toFixed(1)}%
                      {isDefaultPercentageValid
                        ? ' ✓'
                        : defaultTotalPercentageWarning
                        ? ' (需要100%)'
                        : ''}
                    </Text>
                  </View>
                )}

                {/* 儲存預設分成按鈕 */}
                <Button
                  title={t('insurance.saveDefault') || '儲存預設分成'}
                  onPress={handleSaveDefaultPartners}
                  size="sm"
                  variant="primary"
                  disabled={isSavingDefault}
                  style={{ marginBottom: theme.spacing.md }}
                />
              </>
            )}
          </View>

          {/* 保險記錄列表（當正在編輯預設分成時也隱藏） */}
          {!showOnlyDefaultPartners && !editingDefaultPartners && (
            <>
              <View style={[styles.section, styles.listContainer, { marginTop: -theme.spacing.sm }]}>
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
                          <Text style={styles.partnersText}>{partnersLabel || '-'}</Text>
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
                  <Text style={{ color: colorMode === 'dark' ? '#6B7280' : '#9CA3AF', textAlign: 'center', paddingVertical: theme.spacing.md }}>
                    {t('insurance.noRecords')}
                  </Text>
                )}
              </View>

              <Button 
                title={t('insurance.addInsurance')} 
                onPress={onAddInsurance} 
                size="sm"
                variant="primary"
                style={{ marginBottom: theme.spacing.md }}
              />
            </>
          )}
        </ScrollView>
      )}

      {/* 刪除保險紀錄確認視窗 */}
      <ConfirmModal
        visible={deleteConfirmVisible}
        onClose={() => {
          setDeleteConfirmVisible(false);
          setInsuranceToDelete(null);
        }}
        title={t('insurance.delete') || '刪除保險'}
        message={insuranceToDelete
          ? `${t('insurance.deleteConfirm') || '確定刪除這筆保險紀錄？'}\n\n${insuranceToDelete.label}`
          : t('insurance.deleteConfirm') || '確定刪除這筆保險紀錄？'}
        onConfirm={() => {
          if (!currentGame || !insuranceToDelete) return;
          deleteInsurance(currentGame.id, insuranceToDelete.id);
          setDeleteConfirmVisible(false);
          setInsuranceToDelete(null);
        }}
        confirmText={t('common.delete') || '刪除'}
        cancelText={t('common.cancel') || '取消'}
        confirmVariant="danger"
      />
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
        timestamp={currentGame?.insurances.find(i => i.id === editId)?.timestamp}
      />
    </Modal>
  );
};

export default InsuranceRecordsModal;
