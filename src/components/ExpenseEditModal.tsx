import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import { Expense } from '../types/game';

type ExpenseCategory = Expense['category'];

interface ExpenseEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: { category: ExpenseCategory; description?: string; amount: number }) => void;
  category: ExpenseCategory | null;
  description: string;
  amount: string;
  setCategory: (c: ExpenseCategory) => void;
  setDescription: (s: string) => void;
  setAmount: (s: string) => void;
}

const ExpenseEditModal: React.FC<ExpenseEditModalProps> = ({ visible, onClose, onSave, category, description, amount, setCategory, setDescription, setAmount }) => {
  const { theme } = useTheme();

  const categories: { id: ExpenseCategory; label: string; icon: any }[] = [
    { id: 'takeout', label: '外賣', icon: 'burger' },
    { id: 'miscellaneous', label: '雜項', icon: 'misc711' },
    { id: 'taxi', label: '的士', icon: 'taxi' },
    { id: 'venue', label: '場租', icon: 'table' },
    { id: 'other', label: '其他', icon: 'other' },
  ];

  const styles = StyleSheet.create({
    group: { marginBottom: theme.spacing.lg },
    label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.md, color: theme.colors.text, backgroundColor: theme.colors.background },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    chip: { width: '30%', aspectRatio: 1, borderWidth: 2, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md, backgroundColor: theme.colors.background },
    chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
    chipText: { marginTop: theme.spacing.sm, color: theme.colors.text, fontWeight: '600' },
  });

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!category || isNaN(amt) || amt <= 0) return;
    onSave({ category, description: description.trim() || undefined, amount: amt });
  };

  return (
    <Modal visible={visible} onClose={onClose} title="編輯支出">
      <ScrollView>
        <View style={styles.group}>
          <Text style={styles.label}>支出類別</Text>
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
          <Text style={styles.label}>金額</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="輸入金額" keyboardType="numeric" placeholderTextColor={theme.colors.textSecondary} />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>備註（可選）</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="輸入備註..." placeholderTextColor={theme.colors.textSecondary} />
        </View>

        <Button title="儲存" onPress={handleSave} size="lg" />
      </ScrollView>
    </Modal>
  );
};

export default ExpenseEditModal;


