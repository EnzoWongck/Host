import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import Icon from './Icon';
import SwipeHint from './SwipeHint';
import ConfirmModal from './ConfirmModal';
import { Expense } from '../types/game';
// 靜態導入圖片
import EditIconImage from '../../assets/icons/edit.png';
import EditBlackIconImage from '../../assets/icons/edit.black.png';

interface ExpenseRecordsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit?: (expense: Expense) => void;
}

const ExpenseRecordsModal: React.FC<ExpenseRecordsModalProps> = ({ 
  visible, 
  onClose,
  onEdit,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, deleteExpense } = useGame();
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768;

  const currentGame = state.currentGame;

  const expenseCategories = [
    { id: 'takeout', icon: 'burger', label: t('expenseCategories.takeout') },
    { id: 'miscellaneous', icon: 'misc711', label: t('expenseCategories.miscellaneous') },
    { id: 'taxi', icon: 'taxi', label: t('expenseCategories.taxi') },
    { id: 'venue', icon: 'table', label: t('expenseCategories.venue') },
    { id: 'other', icon: 'other', label: t('expenseCategories.other') },
  ];

  const categoryLabelMap: Record<string, string> = Object.fromEntries(
    expenseCategories.map(c => [c.id, c.label])
  );

  const totalExpenses = (currentGame?.expenses || []).reduce((sum, e) => sum + e.amount, 0);

  const styles = StyleSheet.create({
    summaryCard: {
      backgroundColor: colorMode === 'dark' ? '#1A1A2E' : '#FEF2F2',
      borderRadius: 10,
      padding: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#2A2A4E' : '#FECACA',
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.error,
    },
    expenseItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      minHeight: 44,
    },
    expenseItemLeft: { 
      flex: 1, 
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
      marginRight: theme.spacing.md,
    },
    expenseItemAmount: { 
      width: 100, 
      textAlign: 'right', 
      fontWeight: '600', 
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
      marginRight: theme.spacing.md,
    },
    editIconContainer: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.xs,
    },
    emptyMessage: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.xl,
      fontSize: theme.fontSize.md,
    },
    actionButton: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minWidth: 70,
    },
    editButton: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 6,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
      borderRadius: 6,
    },
    actionButtonText: {
      fontWeight: '600',
      fontSize: 12,
    },
  });

  const renderRecord = (expense: Expense) => {
    const handleEdit = () => {
      if (onEdit) {
        onEdit(expense);
        onClose();
      }
    };

    const recordContent = (
      <View style={styles.expenseItemRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {expense.category === 'venue' ? (
            <Icon name="table" size={20} style={{ marginRight: theme.spacing.sm }} />
          ) : expense.category === 'miscellaneous' ? (
            <Icon name="misc711" size={20} style={{ marginRight: theme.spacing.sm }} />
          ) : expense.category === 'taxi' ? (
            <Icon name="taxi" size={20} style={{ marginRight: theme.spacing.sm }} />
          ) : expense.category === 'takeout' ? (
            <Icon name="burger" size={20} style={{ marginRight: theme.spacing.sm }} />
          ) : expense.category === 'other' ? (
            <Icon name="other" size={20} style={{ marginRight: theme.spacing.sm }} />
          ) : null}
          <Text style={styles.expenseItemLeft}>
            {categoryLabelMap[expense.category]}
            {expense.host ? ` · ${expense.host}` : ''}
          </Text>
        </View>
        <Text style={styles.expenseItemAmount}>$ {expense.amount.toLocaleString()}</Text>
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Image 
            source={colorMode === 'dark' 
              ? EditBlackIconImage 
              : EditIconImage} 
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );

    // Web 平台直接顯示點擊可編輯的記錄，並添加刪除按鈕
    if (Platform.OS === 'web') {
      return (
        <View key={expense.id} style={{ flexDirection: 'row', alignItems: 'center', width: '100%', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {expense.category === 'venue' ? (
              <Icon name="table" size={20} style={{ marginRight: theme.spacing.sm }} />
            ) : expense.category === 'miscellaneous' ? (
              <Icon name="misc711" size={20} style={{ marginRight: theme.spacing.sm }} />
            ) : expense.category === 'taxi' ? (
              <Icon name="taxi" size={20} style={{ marginRight: theme.spacing.sm }} />
            ) : expense.category === 'takeout' ? (
              <Icon name="burger" size={20} style={{ marginRight: theme.spacing.sm }} />
            ) : expense.category === 'other' ? (
              <Icon name="other" size={20} style={{ marginRight: theme.spacing.sm }} />
            ) : null}
            <Text style={styles.expenseItemLeft}>
              {categoryLabelMap[expense.category]}
              {expense.host ? ` · ${expense.host}` : ''}
            </Text>
          </View>
          <Text style={styles.expenseItemAmount}>$ {expense.amount.toLocaleString()}</Text>
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Image 
              source={colorMode === 'dark' 
                ? EditBlackIconImage 
                : EditIconImage} 
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={(e) => {
              e.stopPropagation();
              if (!currentGame) return;
              setExpenseToDelete(expense);
              setDeleteConfirmVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
              {t('common.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Swipeable
        key={expense.id}
        renderRightActions={() => (
          <View style={{ flexDirection: 'row' }}>
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEdit}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                  {t('expense.editExpense')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                if (!currentGame) return;
                Alert.alert(t('expense.deleteExpense'), t('expense.deleteConfirm'), [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.delete'), style: 'destructive', onPress: () => deleteExpense(currentGame.id, expense.id) },
                ]);
              }}
            >
              <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
                {t('common.delete')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      >
        {recordContent}
      </Swipeable>
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="支出紀錄"
      maxWidth={isMobile ? screenWidth - 32 : 500}
      maxHeight={isMobile ? screenHeight * 0.9 : undefined}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : { width: 500, minWidth: 500, maxWidth: 'none' }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          maxWidth: 500, 
          alignSelf: 'center', 
          width: '100%', 
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
        }}
      >
        {/* 總支出統計 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>總支出</Text>
          <Text style={styles.summaryValue}>$ {totalExpenses.toLocaleString()}</Text>
        </View>

        {/* 滑動提示（首次顯示，僅移動端） */}
        {currentGame?.expenses && currentGame.expenses.length > 0 && Platform.OS !== 'web' && (
          <SwipeHint storageKey="expenseRecords" />
        )}

        {/* 支出列表 */}
        {currentGame?.expenses && currentGame.expenses.length > 0 ? (
          currentGame.expenses
            .slice()
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map(renderRecord)
        ) : (
          <Text style={styles.emptyMessage}>{t('expense.noRecords')}</Text>
        )}
      </ScrollView>
      
      {/* 刪除確認對話框（Web） */}
      <ConfirmModal
        visible={deleteConfirmVisible}
        onClose={() => {
          setDeleteConfirmVisible(false);
          setExpenseToDelete(null);
        }}
        title="刪除支出"
        message="確定刪除這筆支出紀錄？"
        onConfirm={() => {
          if (currentGame && expenseToDelete) {
            deleteExpense(currentGame.id, expenseToDelete.id);
          }
          setDeleteConfirmVisible(false);
          setExpenseToDelete(null);
        }}
        confirmText="刪除"
        cancelText="取消"
        confirmVariant="danger"
      />
    </Modal>
  );
};

export default ExpenseRecordsModal;

