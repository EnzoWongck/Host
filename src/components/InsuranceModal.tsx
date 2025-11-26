import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
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

const InsuranceModal: React.FC<InsuranceModalProps> = ({ visible, onClose, onCompleted }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, addInsurance, setDefaultInsurancePartners } = useGame();
  const { showToast } = useToast();
  
  const [partners, setPartners] = useState<InsurancePartner[]>([]);
  const [partnerName, setPartnerName] = useState('');
  const [partnerPercentage, setPartnerPercentage] = useState('');
  const [insuranceAmount, setInsuranceAmount] = useState('');
  const [defaultModalVisible, setDefaultModalVisible] = useState(false);
  const [editingCurrent, setEditingCurrent] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'default' | 'custom' | null>('default');

  const currentGame = state.currentGame;

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
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    partnerForm: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: theme.spacing.md,
    },
    partnerNameInput: {
      flex: 2,
      marginRight: theme.spacing.sm,
    },
    partnerPercentageInput: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    addPartnerButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      height: 52, // 匹配 input 高度
    },
    addPartnerText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: theme.fontSize.sm,
    },
    partnersList: { marginBottom: theme.spacing.lg },
    partnerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    partnerInlineText: { color: theme.colors.text },
    partnerInlinePct: { color: theme.colors.textSecondary },
    partnerActions: { flexDirection: 'row' },
    actionBtn: { marginLeft: theme.spacing.sm, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.sm, borderWidth: 1, borderColor: theme.colors.border },
    actionText: { color: theme.colors.text },
    totalPercentage: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      marginBottom: theme.spacing.lg,
    },
    totalPercentageText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.primary,
      textAlign: 'center',
    },
    totalPercentageWarning: {
      backgroundColor: theme.colors.error + '10',
      borderColor: theme.colors.error,
    },
    totalPercentageWarningText: {
      color: theme.colors.error,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
    },
    emptyText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    insuranceFormGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    insuranceFormItem: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
  });

  useEffect(() => {
    if (visible) {
      const current = state.currentGame;
      const defaultPartners = current?.defaultInsurancePartners || [];

      // 開啟視窗時，預設套用已儲存的預設分成，讓使用者可以直接輸入金額新增
      setSelectedMethod('default');
      setEditingCurrent(false);
      if (defaultPartners.length > 0) {
        setPartners(defaultPartners);
      } else {
        // 沒有預設分成時仍保持原本行為：不自動帶入任何分成
        setPartners([]);
      }
    }
  }, [visible, state.currentGame]);

  const addPartner = () => {
    if (!partnerName.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('insurance.errorPercentageRequired'));
      return;
    }

    const percentage = parseFloat(partnerPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      Alert.alert(t('common.error') || '錯誤', t('insurance.errorPercentageRequired'));
      return;
    }

    // 檢查總百分比
    const totalPercentageExisting = partners.reduce((sum, p) => sum + p.percentage, 0);
    const normalizedName = partnerName.trim();
    const existingIndex = partners.findIndex(p => p.name === normalizedName);
    const totalPercentage = existingIndex >= 0
      ? totalPercentageExisting - partners[existingIndex].percentage + percentage
      : totalPercentageExisting + percentage;
    if (totalPercentage > 100) {
      Alert.alert(t('common.error') || '錯誤', t('insurance.errorTotalPercentage'));
      return;
    }

    if (existingIndex >= 0) {
      const updatedPartners = [...partners];
      updatedPartners[existingIndex] = {
        ...updatedPartners[existingIndex],
        percentage,
      };
      setPartners(updatedPartners);
    } else {
      const newPartner: InsurancePartner = {
        id: Date.now().toString(),
        name: normalizedName,
        percentage,
      };
      setPartners([...partners, newPartner]);
    }
    setPartnerName('');
    setPartnerPercentage('');
  };

  const removePartner = (partnerId: string) => {
    setPartners(partners.filter(p => p.id !== partnerId));
  };

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
    if (totalPercentage !== 100) {
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
    resetForm();
    // 重置狀態，下一次新增時恢復預設
    setSelectedMethod('default');
    setEditingCurrent(false);
    onClose();
    onCompleted?.();
  };

  const resetForm = () => {
    setPartners([]);
    setPartnerName('');
    setPartnerPercentage('');
    setInsuranceAmount('');
  };

  const totalPercentage = partners.reduce((sum, p) => sum + p.percentage, 0);
  const isPercentageValid = totalPercentage === 100;
  const isPercentageExceeded = totalPercentage > 100;

  const renderPartnerItem = ({ item }: { item: InsurancePartner }) => (
    <View style={styles.partnerRow}>
      <Text style={styles.partnerInlineText}>{item.name} <Text style={styles.partnerInlinePct}>{item.percentage}%</Text></Text>
      <View style={styles.partnerActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => {
          setPartnerName(item.name);
          setPartnerPercentage(String(item.percentage));
          // 先刪除舊項，再讓使用者按「新增」以更新（簡潔處理）
          removePartner(item.id);
        }}>
          <Text style={styles.actionText}>{t('insurance.modify')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => removePartner(item.id)} activeOpacity={1}>
          <Text style={styles.actionText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 不自動套用預設，改由按鈕觸發

  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={t('modals.insurance')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 目前預設 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('insurance.defaultPartners')}</Text>
          {(state.currentGame?.defaultInsurancePartners || []).map(p => (
            <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={styles.partnerInlineText}>{p.name}</Text>
              <Text style={styles.partnerInlinePct}>{p.percentage}%</Text>
            </View>
          ))}
          <TouchableOpacity
            style={{ backgroundColor: '#06b6d4', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginTop: theme.spacing.md }}
            onPress={() => {
              setPartners(state.currentGame?.defaultInsurancePartners || []);
              setDefaultModalVisible(true);
            }}
            activeOpacity={0.9}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', textAlign: 'center' }}>設定預設分成</Text>
          </TouchableOpacity>

        </View>

        {/* 保險金額 + 快捷按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('insurance.insuranceAmount')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.insuranceFormItem, { marginHorizontal: 0 }]}> 
              <TextInput
                style={styles.input}
                value={insuranceAmount}
                onChangeText={setInsuranceAmount}
                placeholder={t('insurance.insuranceAmountPlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={{ width: theme.spacing.sm }} />
            <Button
              title="預設分成"
              onPress={() => {
                setPartners(state.currentGame?.defaultInsurancePartners || []);
                setEditingCurrent(false);
                setSelectedMethod('default');
              }}
              size="sm"
              variant="outline"
              style={{ backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: selectedMethod === 'default' ? theme.colors.primary : theme.colors.border }}
            />
            <View style={{ width: theme.spacing.sm }} />
            <Button
              title={editingCurrent ? '完成' : '調整本次分成'}
              onPress={() => {
                const next = !editingCurrent;
                setEditingCurrent(next);
                setSelectedMethod(next ? 'custom' : null);
              }}
              size="sm"
              variant="outline"
              style={{ backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: selectedMethod === 'custom' ? theme.colors.primary : theme.colors.border }}
            />
          </View>
        </View>

        {editingCurrent && (
          <>
            <View style={styles.partnerForm}>
              <View style={styles.partnerNameInput}>
                <Text style={styles.label}>{t('insurance.partnerName')}</Text>
                <TextInput
                  style={styles.input}
                  value={partnerName}
                  onChangeText={setPartnerName}
                  placeholder={t('insurance.namePlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={styles.partnerPercentageInput}>
                <Text style={styles.label}>{t('insurance.percentage')}</Text>
                <TextInput
                  style={styles.input}
                  value={partnerPercentage}
                  onChangeText={setPartnerPercentage}
                  placeholder="%"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity style={styles.addPartnerButton} onPress={addPartner}>
                <Text style={styles.addPartnerText}>{t('insurance.addPartner')}</Text>
              </TouchableOpacity>
            </View>
            {partners.length > 0 && (
              <FlatList
                data={partners}
                renderItem={renderPartnerItem}
                keyExtractor={(item) => item.id}
                style={styles.partnersList}
                scrollEnabled={false}
              />
            )}
          </>
        )}

        {/* 依需求：套用分成後不再顯示列表，保持介面簡潔 */}

        {/* 確認按鈕 */}
        <Button
          title={t('insurance.addInsurance')}
          onPress={handleAddInsurance}
          size="lg"
          disabled={!isPercentageValid || partners.length === 0}
        />
      </ScrollView>
      <Modal
        visible={defaultModalVisible}
        onClose={() => setDefaultModalVisible(false)}
        title="設定預設分成"
        closeOnBackdropPress={false}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: theme.spacing.lg }}>
            <View style={styles.partnerForm}>
              <View style={styles.partnerNameInput}>
                <Text style={styles.label}>{t('insurance.partnerName')}</Text>
                <TextInput
                  style={styles.input}
                  value={partnerName}
                  onChangeText={setPartnerName}
                  placeholder={t('insurance.namePlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={styles.partnerPercentageInput}>
                <Text style={styles.label}>{t('insurance.percentage')}</Text>
                <TextInput
                  style={styles.input}
                  value={partnerPercentage}
                  onChangeText={setPartnerPercentage}
                  placeholder="%"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity style={styles.addPartnerButton} onPress={addPartner} activeOpacity={1}>
                <Text style={styles.addPartnerText}>{t('insurance.addPartner')}</Text>
              </TouchableOpacity>
            </View>

            {partners.length > 0 && (
              <FlatList
                data={partners}
                renderItem={renderPartnerItem}
                keyExtractor={(item) => item.id}
                style={styles.partnersList}
                scrollEnabled={false}
              />
            )}

            <View style={[styles.totalPercentage, isPercentageExceeded && styles.totalPercentageWarning]}>
              <Text style={[styles.totalPercentageText, isPercentageExceeded && styles.totalPercentageWarningText]}>
                {t('insurance.totalPercentage')}{totalPercentage}%{isPercentageValid ? t('insurance.valid') : isPercentageExceeded ? t('insurance.exceeded') : t('insurance.needs100')}
              </Text>
            </View>

            <Button
              title={t('insurance.saveDefault')}
              onPress={() => {
                if (!isPercentageValid || partners.length === 0) {
                  Alert.alert(t('common.error') || '錯誤', t('insurance.errorDefaultRequired'));
                  return;
                }
                if (!state.currentGame) return;
                setDefaultInsurancePartners(state.currentGame.id, partners);
                Alert.alert(t('common.done') || '完成', t('insurance.successDefaultSaved'));
                setDefaultModalVisible(false);
              }}
            />
          </View>
        </ScrollView>
      </Modal>
    </Modal>
  );
};

export default InsuranceModal;
