import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
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
    { id: 'takeout' as ExpenseCategory, icon: 'burger', label: t('expenseCategories.takeout') },
    { id: 'miscellaneous' as ExpenseCategory, icon: 'misc711', label: t('expenseCategories.miscellaneous') },
    { id: 'taxi' as ExpenseCategory, icon: 'taxi', label: t('expenseCategories.taxi') },
    { id: 'venue' as ExpenseCategory, icon: 'table', label: t('expenseCategories.venue') },
    { id: 'other' as ExpenseCategory, icon: 'other', label: t('expenseCategories.other') },
  ];

  const firstRow = expenseCategories.slice(0, 3);
  const secondRow = expenseCategories.slice(3);

  const styles = StyleSheet.create({
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
    const firstHostName = hosts[0] ? (typeof hosts[0] === 'string' ? hosts[0] : hosts[0].name) : null;
    const hostToUse = hosts.length > 1 ? selectedHost : firstHostName;
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
              // 使用獨立彈窗編輯（已使用翻譯）
              setEditExpenseId(expense.id);
              setEditCategory(expense.category);
              setEditDescription(expense.description || '');
              setEditAmount(String(expense.amount));
              setSelectedHost(expense.host || null);
              setEditVisible(true);
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>{t('expense.editExpense')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.error, borderRadius: theme.borderRadius.sm }}
            onPress={() => {
              if (!currentGame) return;
              Alert.alert(t('expense.deleteExpense'), t('expense.deleteConfirm'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.delete'), style: 'destructive', onPress: () => deleteExpense(currentGame.id, expense.id) },
              ]);
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>{t('common.delete')}</Text>
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

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('modals.expense')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 支出類別選擇（按鈕樣式） */}
        <View style={[styles.inputGroup, styles.categoryGroup]}>
          <Text style={styles.label}>{t('expense.category')}</Text>
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
          <Text style={styles.label}>{t('expense.description')}</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder={t('expense.descriptionPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline={false}
            numberOfLines={1}
          />
        </View>

        {/* 支出金額 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('expense.amount')}</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder={t('expense.amountPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* 選擇 Host（多 Host 顯示，單 Host 自動綁定不顯示） */}
        {!!currentGame && (currentGame.hosts?.length || 0) > 1 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('expense.selectHost')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.hostChips}>
                {currentGame.hosts.map(h => {
                  const hostName = typeof h === 'string' ? h : h.name;
                  return (
                  <TouchableOpacity key={hostName} style={[styles.chip, selectedHost === hostName && styles.chipActive]} onPress={() => setSelectedHost(hostName)} activeOpacity={1}>
                    <Text style={styles.chipText}>{hostName}</Text>
                  </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* 新增按鈕 */}
        <Button
          title={editingExpenseId ? t('expense.updateExpense') : t('expense.addExpense')}
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
                <Text style={styles.recordsTitle}>{t('expense.records')}</Text>
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
                    <Text style={styles.emptyMessage}>{t('expense.noRecords')}</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </Card>
        </View>
        {/* 編輯彈窗 */}
        <ExpenseEditModal
          visible={editVisible}
          onClose={() => {
            setEditVisible(false);
            setEditExpenseId(null);
            setSelectedHost(null);
          }}
          category={editCategory}
          description={editDescription}
          amount={editAmount}
          setCategory={(c) => setEditCategory(c)}
          setDescription={setEditDescription}
          setAmount={setEditAmount}
          defaultHost={selectedHost}
          onSave={({ category, description, amount, host }) => {
            if (!currentGame || !editExpenseId) return;
            const origin = currentGame.expenses.find(e => e.id === editExpenseId);
            if (!origin) return;
            updateExpense(currentGame.id, { ...origin, category, description, amount, host } as Expense);
            setEditVisible(false);
            setEditExpenseId(null);
            setSelectedHost(null);
          }}
          />
      </ScrollView>
    </Modal>
  );
};

export default ExpenseModal;
