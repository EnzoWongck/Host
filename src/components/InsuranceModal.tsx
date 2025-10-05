import React, { useState } from 'react';
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
  const { state, addInsurance, setDefaultInsurancePartners } = useGame();
  const { showToast } = useToast();
  
  const [partners, setPartners] = useState<InsurancePartner[]>([]);
  const [partnerName, setPartnerName] = useState('');
  const [partnerPercentage, setPartnerPercentage] = useState('');
  const [insuranceAmount, setInsuranceAmount] = useState('');
  const [editingDefaults, setEditingDefaults] = useState(false);
  const [editingCurrent, setEditingCurrent] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'default' | 'custom' | null>(null);

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

  const addPartner = () => {
    if (!partnerName.trim()) {
      Alert.alert('錯誤', '請輸入分成者名稱');
      return;
    }

    const percentage = parseFloat(partnerPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      Alert.alert('錯誤', '請輸入有效的分成百分比（1-100）');
      return;
    }

    // 檢查總百分比
    const totalPercentage = partners.reduce((sum, p) => sum + p.percentage, 0) + percentage;
    if (totalPercentage > 100) {
      Alert.alert('錯誤', '分成總百分比不能超過 100%');
      return;
    }

    const newPartner: InsurancePartner = {
      id: Date.now().toString(),
      name: partnerName.trim(),
      percentage,
    };

    setPartners([...partners, newPartner]);
    setPartnerName('');
    setPartnerPercentage('');
  };

  const removePartner = (partnerId: string) => {
    setPartners(partners.filter(p => p.id !== partnerId));
  };

  const handleAddInsurance = () => {
    if (!currentGame) {
      Alert.alert('錯誤', '沒有進行中的牌局');
      return;
    }

    const amount = parseFloat(insuranceAmount);
    if (isNaN(amount)) {
      Alert.alert('錯誤', '請輸入有效的保險金額（可為負數）');
      return;
    }

    if (partners.length === 0) {
      Alert.alert('錯誤', '請至少新增一個分成者');
      return;
    }

    const totalPercentage = partners.reduce((sum, p) => sum + p.percentage, 0);
    if (totalPercentage !== 100) {
      Alert.alert('錯誤', '分成總百分比必須等於 100%');
      return;
    }

    const newInsurance: Omit<Insurance, 'id' | 'timestamp'> = {
      amount,
      partners: [...partners],
    };

    addInsurance(currentGame.id, newInsurance);

    showToast(`已記錄保險：保險金額：$${amount.toLocaleString()} 分成者：${partners.length} 人`, 'success');

    // 重置表單
    resetForm();
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
          <Text style={styles.actionText}>修改</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => removePartner(item.id)} activeOpacity={1}>
          <Text style={styles.actionText}>刪除</Text>
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
      title="保險"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 目前預設 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>目前預設</Text>
          {(state.currentGame?.defaultInsurancePartners || []).map(p => (
            <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={styles.partnerInlineText}>{p.name}</Text>
              <Text style={styles.partnerInlinePct}>{p.percentage}%</Text>
            </View>
          ))}
          <Button
            title="設定預設分成"
            onPress={() => {
              setPartners(state.currentGame?.defaultInsurancePartners || []);
              setEditingDefaults(true);
            }}
            size="md"
            style={{ marginTop: theme.spacing.md }}
          />

          {editingDefaults && (
            <View style={{ marginTop: theme.spacing.md }}>
              <View style={styles.partnerForm}>
                <View style={styles.partnerNameInput}>
                  <Text style={styles.label}>名稱</Text>
                  <TextInput
                    style={styles.input}
                    value={partnerName}
                    onChangeText={setPartnerName}
                    placeholder="分成者名稱"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.partnerPercentageInput}>
                  <Text style={styles.label}>百分比</Text>
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
                  <Text style={styles.addPartnerText}>新增</Text>
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
                  總分成比例：{totalPercentage}%{isPercentageValid ? ' ✓' : isPercentageExceeded ? ' (超過 100%)' : ' (需要 100%)'}
                </Text>
              </View>

              <Button
                title="儲存為預設"
                onPress={() => {
                  if (!isPercentageValid || partners.length === 0) {
                    Alert.alert('錯誤', '預設分成需合計 100% 且至少 1 人');
                    return;
                  }
                  if (!state.currentGame) return;
                  setDefaultInsurancePartners(state.currentGame.id, partners);
                  Alert.alert('完成', '已儲存預設分成');
                  setEditingDefaults(false);
                }}
              />
            </View>
          )}
        </View>

        {/* 保險金額 + 快捷按鈕 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>保險金額</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.insuranceFormItem, { marginHorizontal: 0 }]}> 
              <TextInput
                style={styles.input}
                value={insuranceAmount}
                onChangeText={setInsuranceAmount}
                placeholder="可輸入正負值"
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
              title={editingCurrent ? '完成分成' : '調整分成'}
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
                <Text style={styles.label}>名稱</Text>
                <TextInput
                  style={styles.input}
                  value={partnerName}
                  onChangeText={setPartnerName}
                  placeholder="分成者名稱"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={styles.partnerPercentageInput}>
                <Text style={styles.label}>百分比</Text>
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
                <Text style={styles.addPartnerText}>新增</Text>
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
          title="記錄保險"
          onPress={handleAddInsurance}
          size="lg"
          disabled={!isPercentageValid || partners.length === 0}
        />
      </ScrollView>
    </Modal>
  );
};

export default InsuranceModal;
