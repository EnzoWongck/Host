import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { InsurancePartner } from '../types/game';

interface InsuranceEditModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (v: string) => void;
  onSave: (payload: { amount: number }) => void;
  partners: InsurancePartner[];
}

const InsuranceEditModal: React.FC<InsuranceEditModalProps> = ({ visible, onClose, amount, setAmount, onSave, partners }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    group: { marginBottom: theme.spacing.lg },
    label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.md, color: theme.colors.text, backgroundColor: theme.colors.background },
    partnersRow: { paddingVertical: theme.spacing.sm },
    partnersText: { color: theme.colors.textSecondary },
  });

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt)) return;
    onSave({ amount: amt });
  };

  return (
    <Modal visible={visible} onClose={onClose} title="編輯保險">
      <ScrollView>
        <View style={styles.group}>
          <Text style={styles.label}>分成者</Text>
          <View style={styles.partnersRow}>
            <Text style={styles.partnersText}>
              {partners.length > 0 ? partners.map(p => `${p.name} ${p.percentage}%`).join('、') : '—'}
            </Text>
          </View>
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>保險金額</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="可輸入正負值"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <Button title="儲存" onPress={handleSave} size="lg" />
      </ScrollView>
    </Modal>
  );
};

export default InsuranceEditModal;

 

