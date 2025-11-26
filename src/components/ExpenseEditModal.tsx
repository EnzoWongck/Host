import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import Icon from './Icon';
import { Expense } from '../types/game';

type ExpenseCategory = Expense['category'];

interface ExpenseEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: { category: ExpenseCategory; description?: string; amount: number; host?: string }) => void;
  category: ExpenseCategory | null;
  description: string;
  amount: string;
  setCategory: (c: ExpenseCategory) => void;
  setDescription: (s: string) => void;
  setAmount: (s: string) => void;
  defaultHost?: string | null;
}

const ExpenseEditModal: React.FC<ExpenseEditModalProps> = ({ visible, onClose, onSave, category, description, amount, setCategory, setDescription, setAmount, defaultHost }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { state } = useGame();
  const [selectedHost, setSelectedHost] = useState<string | null>(defaultHost || null);
  
  const currentGame = state.currentGame;
  const hosts = currentGame?.hosts || [];
  const showHostSelection = hosts.length > 1;
  
  // 獲取 host 名稱（兼容舊的 string[] 格式）
  const getHostName = (h: string | any): string => {
    return typeof h === 'string' ? h : h.name;
  };

  // 當 defaultHost 改變時同步 selectedHost
  useEffect(() => {
    if (visible && defaultHost !== undefined) {
      setSelectedHost(defaultHost);
    }
  }, [visible, defaultHost]);

  const categories: { id: ExpenseCategory; label: string; icon: any }[] = [
    { id: 'takeout', label: t('expenseCategories.takeout'), icon: 'burger' },
    { id: 'miscellaneous', label: t('expenseCategories.miscellaneous'), icon: 'misc711' },
    { id: 'taxi', label: t('expenseCategories.taxi'), icon: 'taxi' },
    { id: 'venue', label: t('expenseCategories.venue'), icon: 'table' },
    { id: 'other', label: t('expenseCategories.other'), icon: 'other' },
  ];

  const styles = StyleSheet.create({
    group: { marginBottom: theme.spacing.lg },
    label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.md, color: theme.colors.text, backgroundColor: theme.colors.background },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    chip: { width: '30%', aspectRatio: 1, borderWidth: 2, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md, backgroundColor: theme.colors.background },
    chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
    chipText: { marginTop: theme.spacing.sm, color: theme.colors.text, fontWeight: '600' },
    hostChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    hostChip: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
    hostChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
    hostChipText: { color: theme.colors.text, fontWeight: '600' },
  });

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!category || isNaN(amt) || amt <= 0) return;
    const firstHostName = hosts[0] ? getHostName(hosts[0]) : null;
    const hostToUse = showHostSelection ? selectedHost : firstHostName;
    if (showHostSelection && !hostToUse) {
      // 可以選擇不設置 host，允許為 undefined
    }
    onSave({ category, description: description.trim() || undefined, amount: amt, host: hostToUse || undefined });
  };

  return (
    <Modal visible={visible} onClose={onClose} title={t('modals.editExpense')}>
      <ScrollView>
        <View style={styles.group}>
          <Text style={styles.label}>{t('modals.expenseCategory')}</Text>
          <View style={styles.row}>
            {categories.slice(0,3).map(c => (
              <TouchableOpacity key={c.id} style={[styles.chip, category===c.id && styles.chipActive]} onPress={() => setCategory(c.id)} activeOpacity={1}>
                <Icon name={c.icon} size={28} />
                <Text style={styles.chipText}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.row}>
            {categories.slice(3).map(c => (
              <TouchableOpacity key={c.id} style={[styles.chip, category===c.id && styles.chipActive]} onPress={() => setCategory(c.id)} activeOpacity={1}>
                <Icon name={c.icon} size={28} />
                <Text style={styles.chipText}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>{t('modals.expenseAmount')}</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder={t('modals.enterExpenseAmount')} keyboardType="numeric" placeholderTextColor={theme.colors.textSecondary} />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>{t('modals.expenseDescriptionOptional')}</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder={t('modals.enterExpenseDescription')} placeholderTextColor={theme.colors.textSecondary} />
        </View>

        {/* 選擇 Host（多 Host 顯示，單 Host 自動綁定不顯示） */}
        {showHostSelection && (
          <View style={styles.group}>
            <Text style={styles.label}>{t('modals.selectHost')}</Text>
            <View style={styles.hostChips}>
              {hosts.map(h => {
                const hostName = getHostName(h);
                return (
                <TouchableOpacity 
                  key={hostName} 
                  style={[styles.hostChip, selectedHost === hostName && styles.hostChipActive]} 
                  onPress={() => setSelectedHost(hostName)} 
                  activeOpacity={1}
                >
                  <Text style={styles.hostChipText}>{hostName}</Text>
                </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <Button title={t('common.save')} onPress={handleSave} size="lg" />
      </ScrollView>
    </Modal>
  );
};

export default ExpenseEditModal;


