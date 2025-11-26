import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { InsurancePartner } from '../types/game';

interface InsuranceEditModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (v: string) => void;
  onSave: (payload: { amount: number; partners: InsurancePartner[] }) => void;
  partners: InsurancePartner[];
}

const InsuranceEditModal: React.FC<InsuranceEditModalProps> = ({
  visible,
  onClose,
  amount,
  setAmount,
  onSave,
  partners,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [localPartners, setLocalPartners] = React.useState<InsurancePartner[]>(partners);

  React.useEffect(() => {
    if (visible) {
      setLocalPartners(partners);
    }
  }, [visible, partners]);

  const styles = StyleSheet.create({
    group: { marginBottom: theme.spacing.lg },
    label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.md, color: theme.colors.text, backgroundColor: theme.colors.background },
    partnersRow: { paddingVertical: theme.spacing.sm },
    partnersText: { color: theme.colors.textSecondary },
    partnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    partnerName: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
    },
    percentageInput: {
      width: 80,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
      color: theme.colors.text,
      textAlign: 'right',
      marginLeft: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    percentageSuffix: {
      marginLeft: theme.spacing.xs,
      color: theme.colors.textSecondary,
    },
    totalRow: {
      marginTop: theme.spacing.xs,
      alignItems: 'flex-end',
    },
    totalText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
  });

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt)) return;
    const normalizedPartners = localPartners.map(p => ({
      ...p,
      percentage: isNaN(p.percentage as any) ? 0 : p.percentage,
    }));
    onSave({ amount: amt, partners: normalizedPartners });
  };

  const handleChangePartnerPercentage = (index: number, text: string) => {
    const numeric = text.replace(/[^0-9.]/g, '');
    const value = parseFloat(numeric);
    setLocalPartners(prev =>
      prev.map((p, i) =>
        i === index
          ? {
              ...p,
              percentage: isNaN(value) ? 0 : value,
            }
          : p,
      ),
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} title={t('insurance.modify')}>
      <ScrollView>
        <View style={styles.group}>
          <Text style={styles.label}>{t('insurance.partnerName')}</Text>
          <View style={styles.partnersRow}>
            {localPartners.length > 0 ? (
              <>
                {localPartners.map((p, index) => (
                  <View key={p.name + index} style={styles.partnerRow}>
                    <Text style={styles.partnerName}>{p.name}</Text>
                    <TextInput
                      style={styles.percentageInput}
                      keyboardType="numeric"
                      value={String(p.percentage ?? 0)}
                      onChangeText={text => handleChangePartnerPercentage(index, text)}
                    />
                    <Text style={styles.percentageSuffix}>%</Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalText}>
                    {t('insurance.totalPercentage') || '合計'}：
                    {localPartners.reduce((s, p) => s + (p.percentage || 0), 0)}%
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.partnersText}>—</Text>
            )}
          </View>
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>{t('insurance.insuranceAmount')}</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder={t('insurance.insuranceAmountPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <Button title={t('common.save')} onPress={handleSave} size="lg" />
      </ScrollView>
    </Modal>
  );
};

export default InsuranceEditModal;

 

