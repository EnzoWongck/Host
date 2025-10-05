import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal as RNModal,
  SafeAreaView,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import Button from './Button';
import { Expense } from '../types/game';
import Icon from './Icon';
import ExpenseEditModal from './ExpenseEditModal';
import Card from './Card';

interface ExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

type ExpenseCategory = Expense['category'];

const ExpenseModal: React.FC<ExpenseModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { state, addExpense, updateExpense, deleteExpense } = useGame();
  const { showToast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [recordsExpanded, setRecordsExpanded] = useState(false);

  // 編輯彈窗狀態
  const [editVisible, setEditVisible] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<ExpenseCategory | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const currentGame = state.currentGame;

  const expenseCategories = [
    { id: 'takeout' as ExpenseCategory, icon: 'burger', label: '外賣' },
    { id: 'miscellaneous' as ExpenseCategory, icon: 'misc711', label: '雜項' },
    { id: 'taxi' as ExpenseCategory, icon: 'taxi', label: '的士' },
    { id: 'venue' as ExpenseCategory, icon: 'table', label: '場租' }, // 第四個
    { id: 'other' as ExpenseCategory, icon: 'other', label: '其他' }, // 第五個
  ];

  const firstRow = expenseCategories.slice(0, 3);
  const secondRow = expenseCategories.slice(3);

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    headerTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: colorMode === 'light' ? '#F5F5F5' : theme.colors.surface,
    },
    closeButtonText: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
    },
    scrollContainer: {
      flex: 1,
      padding: theme.spacing.md,
    },
    categoriesGrid: {
      marginBottom: 0,
    },
    categoryGroup: {
      marginBottom: theme.spacing.sm, // 縮短與下方元素的間距
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm, // 縮短行與行之間的間距
    },
    categoryButton: {
      width: '30%',
      aspectRatio: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    categoryButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    categoryIcon: {
      fontSize: 40, // 放大圖案大小
      marginBottom: theme.spacing.xs, // 縮短圖案與文字的間距
    },
    categoryLabel: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    categoryLabelSelected: {
      color: theme.colors.primary,
    },
    categoryPlaceholder: {
      width: '30%',
      aspectRatio: 1,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    descriptionGroup: {
      // 與上方類別區塊的間距更緊湊
      marginTop: 0,
      marginBottom: theme.spacing.sm, // 縮短與下方元素的間距
    },
    categoryButtonHalf: {
      width: '48%',
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
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    selectedCategoryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.lg,
    },
    selectedCategoryIcon: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    selectedCategoryText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    expenseListContainer: {
      paddingTop: theme.spacing.sm,
    },
    expenseScrollView: {
      maxHeight: 400, // 增加最大高度
      minHeight: 100, // 確保有最小高度
    },
    emptyMessage: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
      fontSize: theme.fontSize.md,
    },
    recordsGroup: {
      // 整個支出記錄區塊往下移（增加頂部間距）
      marginTop: theme.spacing.xl,
    },
    recordsCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    recordsHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    expandIcon: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    recordsHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    recordsTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    recordsTotal: {
      fontSize: theme.fontSize.md,
      fontWeight: '700',
      color: theme.colors.error,
    },
    chevron: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },
    expenseItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    expenseItemLeft: { flex: 1, color: theme.colors.text },
    expenseItemAmount: { width: 100, textAlign: 'right', fontWeight: '600', color: theme.colors.error },
    expenseItemTime: { width: 160, textAlign: 'right', color: theme.colors.textSecondary },
    hostChips: { flexDirection: 'row' },
    chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.border, marginRight: theme.spacing.sm, backgroundColor: theme.colors.background },
    chipActive: { borderColor: theme.colors.primary, backgroundColor: '#FFFFFF' },
    chipText: { color: theme.colors.text, fontWeight: '600' },
  });

  const handleAddExpense = () => {
    if (!currentGame) {
      Alert.alert('錯誤', '沒有進行中的牌局');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('錯誤', '請選擇支出類別');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Alert.alert('錯誤', '請輸入有效的支出金額');
      return;
    }

    const hosts = currentGame.hosts || [];
    const hostToUse = hosts.length > 1 ? selectedHost : hosts[0] || null;
    if (hosts.length > 1 && !hostToUse) {
      Alert.alert('錯誤', '請選擇 Host');
      return;
    }

    if (editingExpenseId) {
      const original = currentGame.expenses.find(e => e.id === editingExpenseId);
      if (!original) return;
      const updated: Expense = {
        ...original,
        category: selectedCategory,
        description: description.trim() || undefined,
        amount: expenseAmount,
        host: hostToUse || undefined,
      } as Expense;
      updateExpense(currentGame.id, updated);
      setEditingExpenseId(null);
      showToast('已更新支出紀錄', 'success');
    } else {
      const newExpense: Omit<Expense, 'id' | 'timestamp'> = {
        category: selectedCategory,
        description: description.trim() || undefined,
        amount: expenseAmount,
        host: hostToUse || undefined,
      };
      addExpense(currentGame.id, newExpense);
      const categoryLabel = expenseCategories.find(cat => cat.id === selectedCategory)?.label;
      showToast(`已新增 ${categoryLabel} 支出${description.trim() ? `：${description.trim()}` : ''} 金額：$${expenseAmount.toLocaleString()}`, 'success');
    }

    // 清空輸入但保留在本介面
    setSelectedCategory(null);
    setDescription('');
    setAmount('');
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setDescription('');
    setAmount('');
  };

  const selectedCategoryInfo = expenseCategories.find(cat => cat.id === selectedCategory);
  const categoryLabelMap: Record<string, string> = Object.fromEntries(expenseCategories.map(c => [c.id, c.label]));
  const totalExpenses = (currentGame?.expenses || []).reduce((sum, e) => sum + e.amount, 0);
  const renderRecord = (expense: Expense) => (
    <Swipeable
      key={expense.id}
      renderRightActions={() => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: theme.colors.primary, marginRight: theme.spacing.xs, borderRadius: theme.borderRadius.sm }}
            onPress={() => {
              // 使用獨立彈窗編輯
              setEditExpenseId(expense.id);
              setEditCategory(expense.category);
              setEditDescription(expense.description || '');
              setEditAmount(String(expense.amount));
              setEditVisible(true);
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>編輯</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.error, borderRadius: theme.borderRadius.sm }}
            onPress={() => {
              if (!currentGame) return;
              Alert.alert('刪除支出', '確定要刪除這筆支出嗎？', [
                { text: '取消', style: 'cancel' },
                { text: '刪除', style: 'destructive', onPress: () => deleteExpense(currentGame.id, expense.id) },
              ]);
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>刪除</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      <View style={styles.expenseItemRow}>
        <Text style={styles.expenseItemLeft}>
          {categoryLabelMap[expense.category]}
          {expense.host ? ` · ${expense.host}` : ''}
        </Text>
        <Text style={styles.expenseItemAmount}>$ {expense.amount.toLocaleString()}</Text>
        <Text style={styles.expenseItemTime}>{new Date(expense.timestamp).toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
      </View>
    </Swipeable>
  );

  if (!visible) {
    return null;
  }

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* 頂部標題欄 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>支出</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={1}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEnabled={true}
            decelerationRate="fast"
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            contentContainerStyle={{ flexGrow: 1 }}
          >
        {/* 支出類別選擇（按鈕樣式） */}
        <View style={[styles.inputGroup, styles.categoryGroup]}>
          <Text style={styles.label}>支出類別</Text>
          <View style={styles.categoriesGrid}>
            <View style={styles.categoryRow}>
              {firstRow.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={1}
                >
                  {category.icon === 'table' ? (
                    <Icon name="table" size={40} style={{ marginBottom: theme.spacing.xs }} />
                  ) : category.icon === 'misc711' ? (
                    <Icon name="misc711" size={40} style={{ marginBottom: theme.spacing.xs }} />
                  ) : category.icon === 'taxi' ? (
                    <Icon name="taxi" size={44} style={{ marginBottom: theme.spacing.xs }} />
                  ) : category.icon === 'burger' ? (
                    <Icon name={'burger' as any} size={40} style={{ marginBottom: theme.spacing.xs }} />
                  ) : category.icon === 'other' ? (
                    <Icon name={'other' as any} size={40} style={{ marginBottom: theme.spacing.xs }} />
                  ) : (
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  )}
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.categoryLabelSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.categoryRow}>
              {secondRow.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={1}
                >
                  {category.icon === 'table' ? (
                    <Icon name="table" size={40} style={{ marginBottom: theme.spacing.xs }} />
                  ) : category.icon === 'misc711' ? (
                    <Icon name="misc711" size={40} style={{ marginBottom: theme.spacing.xs }} />
                  ) : category.icon === 'taxi' ? (
                    <Icon name="taxi" size={44} style={{ marginBottom: theme.spacing.xs }} />
                  ) : category.icon === 'burger' ? (
                    <Icon name={'burger' as any} size={40} style={{ marginBottom: theme.spacing.xs }} />
                  ) : category.icon === 'other' ? (
                    <Icon name={'other' as any} size={40} style={{ marginBottom: theme.spacing.xs }} />
                  ) : (
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  )}
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.categoryLabelSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {/* 佔位以使第五個在第二個正下方 */}
              <View style={styles.categoryPlaceholder} />
            </View>
          </View>
        </View>

        {/* 已選擇提示依需求移除，保持介面簡潔 */}

        {/* 支出描述 */}
        <View style={[styles.inputGroup, styles.descriptionGroup]}>
          <Text style={styles.label}>支出描述（可選）</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="輸入支出描述..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline={false}
            numberOfLines={1}
          />
        </View>

        {/* 支出金額 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>支出金額</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="輸入支出金額"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* 選擇 Host（多 Host 顯示，單 Host 自動綁定不顯示） */}
        {!!currentGame && (currentGame.hosts?.length || 0) > 1 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>選擇 Host</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.hostChips}>
                {currentGame.hosts.map(h => (
                  <TouchableOpacity key={h} style={[styles.chip, selectedHost === h && styles.chipActive]} onPress={() => setSelectedHost(h)} activeOpacity={1}>
                    <Text style={styles.chipText}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 新增按鈕 */}
        <Button
          title={editingExpenseId ? '更新支出' : '新增支出'}
          onPress={handleAddExpense}
          size="lg"
        />

        {/* 支出記錄（可展開的卡片式設計） */}
        <View style={[styles.inputGroup, styles.recordsGroup]}>
          <Card>
            <TouchableOpacity 
              style={styles.recordsCardHeader}
              onPress={() => setRecordsExpanded(!recordsExpanded)}
              activeOpacity={1}
            >
              <View style={styles.recordsHeaderLeft}>
                <Icon name="cost" size={24} style={{ marginRight: theme.spacing.sm }} />
                <Text style={styles.recordsTitle}>支出記錄</Text>
              </View>
              <View style={styles.recordsHeaderRight}>
                <Text style={styles.recordsTotal}>$ {totalExpenses.toLocaleString()}</Text>
                <Text style={styles.expandIcon}>{recordsExpanded ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>
            {recordsExpanded && (
              <View style={styles.expenseListContainer}>
                <ScrollView 
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true} 
                  style={styles.expenseScrollView}
                  scrollEnabled={true}
                  bounces={true}
                  decelerationRate="fast"
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  {currentGame?.expenses
                    .slice()
                    .sort((a,b)=> new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(renderRecord)}
                  {currentGame?.expenses.length === 0 && (
                    <Text style={styles.emptyMessage}>尚無支出紀錄</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </Card>
        </View>
        {/* 編輯彈窗 */}
        <ExpenseEditModal
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          category={editCategory}
          description={editDescription}
          amount={editAmount}
          setCategory={(c) => setEditCategory(c)}
          setDescription={setEditDescription}
          setAmount={setEditAmount}
          onSave={({ category, description, amount }) => {
            if (!currentGame || !editExpenseId) return;
            const origin = currentGame.expenses.find(e => e.id === editExpenseId);
            if (!origin) return;
            updateExpense(currentGame.id, { ...origin, category, description, amount } as Expense);
            setEditVisible(false);
          }}
          />
          </ScrollView>
        </SafeAreaView>
      </View>
    </RNModal>
  );
};

export default ExpenseModal;
