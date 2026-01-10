import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, FlatList } from 'react-native';
import CustomModal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
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
  const { theme, colorMode } = useTheme();
  const { state } = useGame();
  const [selectedHost, setSelectedHost] = useState<string | null>(defaultHost || null);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  
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

  const categories: { id: ExpenseCategory; label: string }[] = [
    { id: 'takeout', label: '外賣' },
    { id: 'miscellaneous', label: '雜費' },
    { id: 'taxi', label: '車費' },
    { id: 'venue', label: '場地' },
    { id: 'other', label: '其他' },
  ];

  const currentCategoryLabel = categories.find(c => c.id === category)?.label || '選擇類別';

  const styles = StyleSheet.create({
    group: { marginBottom: theme.spacing.lg },
    label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
    input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.sm, padding: theme.spacing.md, color: theme.colors.text, backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    chip: { 
      width: '30%', 
      aspectRatio: 1, 
      borderWidth: 2, 
      borderColor: theme.colors.border, 
      borderRadius: theme.borderRadius.md, 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: theme.spacing.md, 
      backgroundColor: theme.colors.background,
      padding: 6,
      paddingTop: 6,
      paddingBottom: 6,
    },
    chipContent: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingBottom: 4, // 減少文字與下邊框的間距
    },
    chipActive: { 
      borderColor: colorMode === 'dark' ? '#FFFFFF' : theme.colors.text, 
      backgroundColor: theme.colors.background,
    },
    chipText: { color: theme.colors.text, fontWeight: '600' },
    categoryButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.md,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryButtonText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
    },
    categoryPickerModal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    categoryPickerContainer: {
      width: '80%',
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      maxHeight: '60%',
    },
    categoryPickerHeader: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryPickerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
    },
    categoryPickerItem: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    categoryPickerItemSelected: {
      backgroundColor: theme.colors.primary + '20',
    },
    categoryPickerItemText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
    },
    categoryPickerItemTextSelected: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    hostChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
    hostChip: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
    hostChipActive: { borderColor: colorMode === 'dark' ? '#FFFFFF' : theme.colors.text, backgroundColor: theme.colors.background },
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
    <>
      <CustomModal visible={visible} onClose={onClose} title="編輯支出">
        <ScrollView>
          <View style={styles.group}>
            <Text style={styles.label}>支出類別</Text>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setCategoryPickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryButtonText}>{currentCategoryLabel}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>▼</Text>
            </TouchableOpacity>
          </View>

        <View style={styles.group}>
          <Text style={styles.label}>金額</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="$" keyboardType="numeric" placeholderTextColor={theme.colors.textSecondary} />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>描述（選填）</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="輸入描述" placeholderTextColor={theme.colors.textSecondary} />
        </View>

        {/* 選擇 Host（多 Host 顯示，單 Host 自動綁定不顯示） */}
        {showHostSelection && (
          <View style={styles.group}>
            <Text style={styles.label}>選擇 Host</Text>
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

        <Button 
          title="儲存" 
          onPress={handleSave} 
          size="lg" 
          variant="primary"
          style={{ marginBottom: theme.spacing.md }} // 增加底部間距確保陰影顯示
        />
      </ScrollView>
    </CustomModal>

    {/* 類別選擇滾輪 */}
    <Modal
      visible={categoryPickerVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setCategoryPickerVisible(false)}
    >
      <TouchableOpacity
        style={styles.categoryPickerModal}
        activeOpacity={1}
        onPress={() => setCategoryPickerVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.categoryPickerContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.categoryPickerHeader}>
            <Text style={styles.categoryPickerTitle}>選擇類別</Text>
            <TouchableOpacity onPress={() => setCategoryPickerVisible(false)}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 24, fontWeight: '300' }}>×</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryPickerItem,
                  category === item.id && styles.categoryPickerItemSelected,
                ]}
                onPress={() => {
                  setCategory(item.id);
                  setCategoryPickerVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPickerItemText,
                    category === item.id && styles.categoryPickerItemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
    </>
  );
};

export default ExpenseEditModal;


