import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Button from './Button';
import { Insurance, InsurancePartner } from '../types/game';

interface InsuranceModalProps {
  visible: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

interface DefaultPartnerInput {
  id: string;
  name: string;
  percentage: string;
}

const InsuranceModal: React.FC<InsuranceModalProps> = ({ visible, onClose, onCompleted }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, addInsurance } = useGame();
  const { showToast } = useToast();
  
  const [partners, setPartners] = useState<InsurancePartner[]>([]);
  const [insuranceAmount, setInsuranceAmount] = useState('');
  const [editingCurrent, setEditingCurrent] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'default' | 'custom' | null>('default');

  // 調整本次分成的狀態
  const [customPartnerInputs, setCustomPartnerInputs] = useState<DefaultPartnerInput[]>([]);

  const currentGame = state.currentGame;

  const grayButtonBackground = '#303134';
  const selectionBorderColor = colorMode === 'dark' ? '#FFFFFF' : theme.colors.text;
  const selectionCardBackground = colorMode === 'dark' ? theme.colors.surface : '#FFFFFF';

  const styles = StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
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
    input: {
      borderWidth: colorMode === 'light' ? 0 : 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
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
      marginRight: theme.spacing.sm,
    },
    partnerPercentageInput: {
      flex: 1,
      marginRight: theme.spacing.sm,
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
      marginTop: theme.spacing.sm,
      alignSelf: 'center',
      alignItems: 'center',
    },
    addPartnerText: {
      fontSize: theme.fontSize.lg,
      fontWeight: '800',
      color: theme.colors.textSecondary,
    },
    totalPercentage: {
      padding: theme.spacing.md,
      backgroundColor: selectionCardBackground,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: selectionBorderColor,
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.md,
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
    insuranceFormItem: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
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
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
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
      fontSize: 16,
      fontWeight: '600',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
  });

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
    if (visible) {
      const current = state.currentGame;
      const defaultPartners = current?.defaultInsurancePartners || [];

      // 開啟視窗時，預設套用已儲存的預設分成
      setSelectedMethod('default');
      setEditingCurrent(false);
      if (defaultPartners.length > 0) {
        setPartners(defaultPartners);
      } else {
        setPartners([]);
      }
    }
  }, [visible, state.currentGame]);

  // 實時更新partners（當調整本次分成時）
  useEffect(() => {
    if (editingCurrent && selectedMethod === 'custom') {
      const validInputs = customPartnerInputs.filter(
        input => input.name.trim() && (parseFloat(input.percentage) || 0) > 0
      );
      if (validInputs.length > 0) {
        const roundedPartners = roundUpPercentages(validInputs);
        setPartners(roundedPartners);
      } else {
        setPartners([]);
      }
    } else if (selectedMethod === 'default') {
      setPartners(state.currentGame?.defaultInsurancePartners || []);
    }
  }, [editingCurrent, selectedMethod, customPartnerInputs, state.currentGame?.defaultInsurancePartners]);

  // 當開始編輯時，初始化自定義輸入
  useEffect(() => {
    if (editingCurrent && selectedMethod === 'custom' && customPartnerInputs.length === 0) {
      const currentPartners = partners.length > 0 ? partners : (state.currentGame?.defaultInsurancePartners || []);
      if (currentPartners.length > 0) {
        setCustomPartnerInputs(
          currentPartners.map(p => ({
            id: p.id,
            name: p.name,
            percentage: p.percentage.toString(),
          }))
        );
      } else {
        setCustomPartnerInputs([
          { id: Date.now().toString(), name: '', percentage: '' },
        ]);
      }
    } else if (!editingCurrent || selectedMethod !== 'custom') {
      // 當退出編輯模式時，清空自定義輸入
      setCustomPartnerInputs([]);
    }
  }, [editingCurrent, selectedMethod]);

  const handleAddInsurance = () => {
    if (!currentGame) {
      Alert.alert(t('common.error') || '錯誤', t('insurance.errorNoGame'));
      return;
    }

    const amount = parseFloat(insuranceAmount);
    if (isNaN(amount)) {
      Alert.alert(t('common.error') || '錯誤', t('insurance.errorAmountRequired'));
      return;
    }

    if (partners.length === 0) {
      Alert.alert(t('common.error') || '錯誤', t('insurance.errorPartnersRequired'));
      return;
    }

    const totalPercentage = partners.reduce((sum, p) => sum + p.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.1) {
      Alert.alert(t('common.error') || '錯誤', t('insurance.errorTotalPercentage'));
      return;
    }

    const newInsurance: Omit<Insurance, 'id' | 'timestamp'> = {
      amount,
      partners: [...partners],
    };

    addInsurance(currentGame.id, newInsurance);

    showToast(`${t('insurance.successRecorded')}$${amount.toLocaleString()} ${t('insurance.partnerName')}：${partners.length} ${t('summaryExport.people')}`, 'success');

    // 重置表單
    setInsuranceAmount('');
    setSelectedMethod('default');
    setEditingCurrent(false);
    if (currentGame.defaultInsurancePartners && currentGame.defaultInsurancePartners.length > 0) {
      setPartners(currentGame.defaultInsurancePartners);
    } else {
      setPartners([]);
    }
    onClose();
    onCompleted?.();
  };

  const addCustomPartnerInput = () => {
    setCustomPartnerInputs([
      ...customPartnerInputs,
      { id: Date.now().toString() + Math.random(), name: '', percentage: '' },
    ]);
  };

  const removeCustomPartnerInput = (id: string) => {
    if (customPartnerInputs.length > 1) {
      setCustomPartnerInputs(customPartnerInputs.filter(input => input.id !== id));
    }
  };

  const updateCustomPartnerName = (id: string, name: string) => {
    setCustomPartnerInputs(
      customPartnerInputs.map(input =>
        input.id === id ? { ...input, name } : input
      )
    );
  };

  const updateCustomPartnerPercentage = (id: string, percentage: string) => {
    const numericValue = percentage.replace(/[^0-9.]/g, '');
    setCustomPartnerInputs(
      customPartnerInputs.map(input =>
        input.id === id ? { ...input, percentage: numericValue } : input
      )
    );
  };

  const calculateCustomTotalPercentage = () => {
    return customPartnerInputs.reduce((sum, input) => {
      const pct = parseFloat(input.percentage) || 0;
      return sum + pct;
    }, 0);
  };

  const customTotalPercentage = calculateCustomTotalPercentage();
  const isCustomPercentageValid = Math.abs(customTotalPercentage - 100) <= 0.1 && customTotalPercentage > 0;
  const customTotalPercentageWarning = customTotalPercentage > 0 && !isCustomPercentageValid;

  // 計算動態視窗高度
  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768; // 判斷是否為手機

  const getModalMaxHeight = () => {
    if (editingCurrent) {
      return '90%'; // 調整本次分成時增加高度
    }
    return '95%';
  };

  return (
    <Modal
      visible={visible}
      onClose={() => {
        setInsuranceAmount('');
        setSelectedMethod('default');
        setEditingCurrent(false);
        onClose();
      }}
      title={t('insurance.addInsurance') || '新增保險'}
      maxWidth={isMobile ? screenWidth - 32 : 400}
      maxHeight={isMobile ? screenHeight * 0.75 : undefined}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : { width: 400, minWidth: 400, maxWidth: 'none' }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ maxWidth: 480, alignSelf: 'center', width: '100%', paddingHorizontal: theme.spacing.lg }}
      >
        {/* 快捷按鈕 */}
        <View style={styles.buttonRow}>
          <Button
            title="預設分成"
            onPress={() => {
              setPartners(state.currentGame?.defaultInsurancePartners || []);
              setEditingCurrent(false);
              setSelectedMethod('default');
            }}
            size="sm"
            variant="primary"
            textStyle={{ color: colorMode === 'dark' ? '#FFFFFF' : '#4B5563', fontSize: 13 }}
            style={{
              flex: 1,
              paddingHorizontal: 8,
              minWidth: 0,
              backgroundColor:
                selectedMethod === 'default'
                  ? 'rgba(8, 145, 178, 0.1)' // 湖水綠淡色背景
                  : colorMode === 'dark'
                  ? '#121212'
                  : theme.colors.background,
              borderWidth: 1.5,
              borderColor: selectedMethod === 'default' ? '#0891B2' : theme.colors.border, // 湖水綠
            }}
          />
          <Button
            title={editingCurrent ? '完成' : '調整本次分成'}
            onPress={() => {
              const next = !editingCurrent;
              setEditingCurrent(next);
              setSelectedMethod(next ? 'custom' : 'default');
              if (!next) {
                // 完成調整時，使用預設分成
                setPartners(state.currentGame?.defaultInsurancePartners || []);
              }
            }}
            size="sm"
            variant="primary"
            textStyle={{ color: colorMode === 'dark' ? '#FFFFFF' : '#4B5563', fontSize: 13 }}
            style={{
              flex: 1,
              paddingHorizontal: 8,
              minWidth: 0,
              backgroundColor:
                selectedMethod === 'custom'
                  ? 'rgba(8, 145, 178, 0.1)' // 湖水綠淡色背景
                  : colorMode === 'dark'
                  ? '#121212'
                  : theme.colors.background,
              borderWidth: 1.5,
              borderColor: selectedMethod === 'custom' ? '#0891B2' : theme.colors.border, // 湖水綠
            }}
          />
        </View>

        {/* 調整本次分成 */}
        {editingCurrent && selectedMethod === 'custom' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>調整本次分成</Text>
            
            {customPartnerInputs.map((input, index) => (
              <View key={input.id} style={styles.partnerRow}>
                <View style={styles.partnerInputRow}>
                  <View style={styles.partnerNameInput}>
                    <Text style={styles.label}>{t('insurance.partnerName') || '分成者名稱'}</Text>
                    <TextInput
                      style={styles.input}
                      value={input.name}
                      onChangeText={(value) => updateCustomPartnerName(input.id, value)}
                      placeholder={t('insurance.namePlaceholder') || '輸入名稱'}
                      placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
                    />
                  </View>
                  <View style={styles.partnerPercentageInput}>
                    <Text style={styles.label}>{t('insurance.percentage') || '百分比'}</Text>
                    <TextInput
                      style={styles.input}
                      value={input.percentage}
                      onChangeText={(value) => updateCustomPartnerPercentage(input.id, value)}
                      placeholder="%"
                      placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {customPartnerInputs.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeCustomPartnerInput(input.id)}
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
              onPress={addCustomPartnerInput}
              activeOpacity={0.7}
              style={styles.addPartnerButton}
            >
              <Text style={styles.addPartnerText}>+ {t('insurance.addPartner') || '新增分成者'}</Text>
            </TouchableOpacity>

            {/* 總分成比例顯示 */}
            {customTotalPercentage > 0 && (
              <View
                style={[
                  styles.totalPercentage,
                  customTotalPercentageWarning && styles.totalPercentageWarning,
                ]}
              >
                <Text
                  style={[
                    styles.totalPercentageText,
                    customTotalPercentageWarning && styles.totalPercentageWarningText,
                  ]}
                >
                  {t('insurance.totalPercentage') || '總分成比例'}{customTotalPercentage.toFixed(1)}%
                  {isCustomPercentageValid
                    ? ' ✓'
                    : customTotalPercentageWarning
                    ? ' (需要100%)'
                    : ''}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 保險金額 + 確認按鈕（WhatsApp 風格） */}
        <View style={styles.inputWithButtonRow}>
          <Text style={styles.inputIcon}>$</Text>
          <TextInput
            style={styles.inputInline}
            value={insuranceAmount}
            onChangeText={setInsuranceAmount}
            placeholder="輸入保險金額（可為負數）"
            placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
            keyboardType="numbers-and-punctuation"
          />
          {insuranceAmount.trim() !== '' && partners.length > 0 && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleAddInsurance}
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

export default InsuranceModal;
