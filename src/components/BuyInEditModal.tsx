import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface BuyInEditModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (amount: string) => void;
  onSave: (amount: number) => void;
}

const BuyInEditModal: React.FC<BuyInEditModalProps> = ({
  visible,
  onClose,
  amount,
  setAmount,
  onSave,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const styles = StyleSheet.create({
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
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
  });

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert(t('common.error') || '錯誤', t('buyIn.errorAmountRequired') || '請輸入有效的金額');
      return;
    }
    onSave(amt);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title={t('modals.editBuyIn')}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('modals.buyInAmount')}</Text>
        <TextInput
          style={[styles.input, focusedInput === 'amount' && styles.inputFocused]}
          value={amount}
          onChangeText={setAmount}
          placeholder="$"
          placeholderTextColor={
            focusedInput === 'amount'
              ? 'transparent'
              : theme.colors.textSecondary
          }
          onFocus={() => setFocusedInput('amount')}
          onBlur={() => setFocusedInput(null)}
          keyboardType="numeric"
          textContentType="none"
          autoComplete="off"
          autoCorrect={false}
          autoFocus
        />
      </View>
      <Button 
        title={t('common.confirm')} 
        onPress={handleSave} 
        size="lg" 
        variant="primary"
        style={{ marginBottom: theme.spacing.md }}
      />
    </Modal>
  );
};

export default BuyInEditModal;

