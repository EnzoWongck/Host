import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Button from './Button';
import { Expense } from '../types/game';
import Icon from './Icon';
import ExpenseEditModal from './ExpenseEditModal';
import ExpenseRecordsModal from './ExpenseRecordsModal';

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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // 編輯彈窗狀態
  const [editVisible, setEditVisible] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<ExpenseCategory | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768; // 判斷是否為手機

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

  const categoryBackground = colorMode === 'dark' ? '#121212' : theme.colors.background;

  const styles = StyleSheet.create({
    categoriesGrid: {
      marginBottom: 0,
      alignSelf: 'center',
      width: '100%', // 放大支出視窗時，讓類別按鈕可用寬度更大
      paddingHorizontal: 0, // 確保與 categoryRow 的 padding 配合
    },
    categoryGroup: {
      marginBottom: theme.spacing.sm, // 縮短與下方元素的間距
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm, // 縮短行與行之間的間距
      paddingHorizontal: theme.spacing.md, // 增加左右內邊距，確保按鈕陰影完整顯示
    },
    categoryButton: {
      width: '26%',          // 縮小按鈕寬度，icon 看起來更貼邊
      aspectRatio: 0.9,      // 稍微壓扁，高度也縮小一點
      borderWidth: 2,        // 預留邊框空間
      borderColor: 'transparent', // 未選擇時透明邊框
      borderRadius: theme.borderRadius.md,
      justifyContent: 'space-between', // 改為 space-between 以控制布局
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
      backgroundColor: categoryBackground,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
      padding: 6,
      paddingTop: 6, // icon 頂部間距
      paddingBottom: 6, // 統一內邊距
    },
    categoryButtonContent: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingBottom: 4, // 減少文字與下邊框的間距
    },
    categoryButtonSelected: {
      borderWidth: 2,
      borderColor: '#0891B2', // 湖水綠
      backgroundColor: categoryBackground,
    },
    categoryIcon: {
      fontSize: 60,
    },
    categoryLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    categoryLabelSelected: {
      color: colorMode === 'dark' ? '#FFFFFF' : theme.colors.text,
    },
    categoryPlaceholder: {
      width: '26%',   // 與 categoryButton 一致，保持對齊
      aspectRatio: 0.9,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    descriptionGroup: {
      // 與上方類別區塊的間距更緊湊
      marginTop: 0,
      marginBottom: theme.spacing.lg, // 與金額輸入欄保持一致間距
    },
    descriptionToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
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
      // 淺色模式下移除輸入框邊框，僅保留淡背景；深色模式維持原有邊框
      borderWidth: colorMode === 'light' ? 0 : 1,
      borderColor: colorMode === 'light' ? 'transparent' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: 16, // 必須 >= 16px 防止 iOS Safari 縮放
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
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
    chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: colorMode === 'dark' ? theme.colors.border : '#F4F4F5', marginRight: theme.spacing.sm, backgroundColor: theme.colors.background },
    chipActive: { borderColor: colorMode === 'dark' ? '#FFFFFF' : '#E2E8F0', backgroundColor: theme.colors.background },
    chipText: { color: colorMode === 'light' ? '#4B5563' : theme.colors.text, fontWeight: '600' },
    // WhatsApp 風格輸入框 + 按鈕
    inputWithButtonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
      borderRadius: 24,
      paddingLeft: theme.spacing.md,
      paddingRight: 4,
      marginBottom: theme.spacing.md,
      borderWidth: colorMode === 'light' ? 0 : 1,
      borderColor: theme.colors.border,
    },
    inputInline: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: 12,
      paddingLeft: 8,
      backgroundColor: 'transparent',
    },
    inputIcon: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      opacity: 0.5,
    },
    viewRecordsLink: {
      textAlign: 'center',
      color: colorMode === 'dark' ? '#666666' : '#9CA3AF',
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#0891B2', // 湖水綠
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#0891B2',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '600',
    },
  });

  const handleAddExpense = async () => {
    if (!currentGame) {
      Alert.alert('錯誤', '沒有進行中的牌局');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Alert.alert('錯誤', '請輸入有效的支出金額');
      return;
    }

    // 如果沒有選擇類別，預設使用 'other'
    const categoryToUse = selectedCategory || 'other';

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
        category: categoryToUse,
        description: description.trim() || undefined,
        amount: expenseAmount,
        host: hostToUse || undefined,
      } as Expense;
      updateExpense(currentGame.id, updated);
      setEditingExpenseId(null);
      showToast('已更新支出紀錄', 'success');
    } else {
      const newExpense: Omit<Expense, 'id' | 'timestamp'> = {
        category: categoryToUse,
        description: description.trim() || undefined,
        amount: expenseAmount,
        host: hostToUse || undefined,
      };
      try {
        await addExpense(currentGame.id, newExpense);
        const categoryLabel = expenseCategories.find(cat => cat.id === categoryToUse)?.label;
        showToast(`已新增 ${categoryLabel} 支出 金額：$${expenseAmount.toLocaleString()}`, 'success');
      } catch (error: any) {
        console.error('添加支出失敗:', error);
        Alert.alert('錯誤', error?.message || '添加支出失敗，請稍後再試');
        return;
      }
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
  const totalExpenses = (currentGame?.expenses || []).reduce((sum, e) => sum + e.amount, 0);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('modals.expense')}
      maxWidth={isMobile ? screenWidth - 32 : 480}
      maxHeight={isMobile ? screenHeight * 0.9 : undefined}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : { width: 480, minWidth: 480, maxWidth: 'none' }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        contentContainerStyle={{ maxWidth: 480, alignSelf: 'center', width: '100%', paddingHorizontal: theme.spacing.lg }}
      >
        {/* 查看支出紀錄入口（置中暗字，像服務費記錄一樣） */}
        <TouchableOpacity onPress={() => setRecordsExpanded(true)} activeOpacity={0.7}>
          <Text style={styles.viewRecordsLink}>
            查看支出紀錄 (${totalExpenses.toLocaleString()})
          </Text>
        </TouchableOpacity>

        {/* 支出類別選擇（按鈕樣式） */}
        <View style={[styles.inputGroup, styles.categoryGroup]}>
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
                  <View style={styles.categoryButtonContent}>
                    <View style={{ 
                      flex: 1, 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      marginBottom: category.icon === 'taxi' ? theme.spacing.sm : 0 
                    }}>
                      {category.icon === 'table' ? (
                        <Icon name="table" size={48} />
                      ) : category.icon === 'misc711' ? (
                        <Icon name="misc711" size={48} />
                      ) : category.icon === 'taxi' ? (
                        <Icon name="taxi" size={60} />
                      ) : category.icon === 'burger' ? (
                        <Icon name={'burger' as any} size={48} />
                      ) : category.icon === 'other' ? (
                        <Icon name={'other' as any} size={48} />
                      ) : (
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === category.id && styles.categoryLabelSelected,
                        { marginTop: 'auto', marginBottom: -theme.spacing.sm },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </View>
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
                  <View style={styles.categoryButtonContent}>
                    <View style={{ 
                      flex: 1, 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      marginBottom: category.icon === 'taxi' ? theme.spacing.sm : 0 
                    }}>
                      {category.icon === 'table' ? (
                        <Icon name="table" size={48} />
                      ) : category.icon === 'misc711' ? (
                        <Icon name="misc711" size={48} />
                      ) : category.icon === 'taxi' ? (
                        <Icon name="taxi" size={60} />
                      ) : category.icon === 'burger' ? (
                        <Icon name={'burger' as any} size={48} />
                      ) : category.icon === 'other' ? (
                        <Icon name={'other' as any} size={48} />
                      ) : (
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selectedCategory === category.id && styles.categoryLabelSelected,
                        { marginTop: 'auto', marginBottom: -theme.spacing.sm },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {/* 佔位以使第五個在第二個正下方 */}
              <View style={styles.categoryPlaceholder} />
            </View>
          </View>
        </View>

        {/* 支出描述（可展開） */}
        <View style={[styles.inputGroup, styles.descriptionGroup]}>
          <TouchableOpacity
            onPress={() => setDescriptionExpanded(!descriptionExpanded)}
            activeOpacity={0.7}
            style={styles.descriptionToggle}
          >
            <Text style={styles.label}>{t('expense.description')}</Text>
            <Text style={styles.expandIcon}>{descriptionExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {descriptionExpanded && (
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="輸入描述"
              placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
              multiline={false}
              numberOfLines={1}
            />
          )}
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

        {/* 支出金額 + 新增按鈕（WhatsApp 風格） */}
        <View style={styles.inputWithButtonRow}>
          <Text style={styles.inputIcon}>$</Text>
          <TextInput
            style={styles.inputInline}
            value={amount}
            onChangeText={setAmount}
            placeholder="輸入金額"
            placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
            keyboardType="decimal-pad"
          />
          {amount.trim() !== '' && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleAddExpense}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>✓</Text>
            </TouchableOpacity>
          )}
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

        {/* 支出記錄獨立視窗 */}
        <ExpenseRecordsModal
          visible={recordsExpanded}
          onClose={() => setRecordsExpanded(false)}
          onEdit={(expense) => {
            setEditExpenseId(expense.id);
            setEditCategory(expense.category);
            setEditDescription(expense.description || '');
            setEditAmount(String(expense.amount));
            setSelectedHost(expense.host || null);
            setEditVisible(true);
          }}
        />
      </ScrollView>
    </Modal>
  );
};

export default ExpenseModal;
