import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from './Modal';
import { Rake } from '../types/game';
import RakeRecordsModal from './RakeRecordsModal';

interface RakeModalProps {
  visible: boolean;
  onClose: () => void;
}

const RakeModal: React.FC<RakeModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, addRake } = useGame();
  const { showToast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [time, setTime] = useState('');
  const [recordsVisible, setRecordsVisible] = useState(false);

  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isMobile = screenWidth < 768; // 判斷是否為手機

  const currentGame = state.currentGame;

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
      // 淺色模式下移除輸入框邊框，僅保留淡背景；深色模式維持原有邊框
      borderWidth: colorMode === 'light' ? 0 : 1,
      borderColor: colorMode === 'light' ? 'transparent' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
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
      fontSize: 20,
      fontWeight: '600',
    },
    timeInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    timeLabel: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: theme.spacing.sm,
    },
    timeInput: {
      flex: 1,
      fontSize: 16,
      color: colorMode === 'light' ? '#4B5563' : theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderWidth: colorMode === 'light' ? 0 : 1,
      borderColor: theme.colors.border,
    },
    summaryCard: {
      backgroundColor: theme.colors.primary + '10',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    summaryTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    summaryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
    },
    summaryValue: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
    },
  });

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleAddRake = () => {
    if (!currentGame) {
      Alert.alert(t('common.error') || '錯誤', t('rake.errorNoGame'));
      return;
    }

    const rakeAmount = parseFloat(amount);
    if (isNaN(rakeAmount) || rakeAmount <= 0) {
      Alert.alert(t('common.error') || '錯誤', t('rake.errorAmountRequired'));
      return;
    }

    const rakeTime = time.trim() || getCurrentTime();

    const newRake: Omit<Rake, 'id' | 'timestamp'> = {
      amount: rakeAmount,
    };

    addRake(currentGame.id, newRake);

    showToast(`${t('rake.successRecorded')}${rakeAmount.toLocaleString()} ${t('rake.time')}：${rakeTime}`, 'success');

    // 重置表單
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setAmount('');
    setTime('');
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  // 計算當前抽水統計
  const totalRakes = currentGame?.rakes.reduce((sum, rake) => sum + rake.amount, 0) || 0;
  const rakeCount = currentGame?.rakes.length || 0;
  const averageRake = rakeCount > 0 ? totalRakes / rakeCount : 0;

  React.useEffect(() => {
    if (visible) {
      setTime(getCurrentTime());
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={t('modals.rake')}
      maxWidth={isMobile ? screenWidth - 32 : 800}
      maxHeight={isMobile ? screenHeight * 0.9 : undefined}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ maxWidth: 680, alignSelf: 'center', width: '100%', paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }}>
        {/* 查看服務費紀錄入口（使用較暗的文字顏色） */}
        <TouchableOpacity onPress={() => setRecordsVisible(true)} activeOpacity={0.7}>
          <Text
            style={{
              color: colorMode === 'dark' ? '#666666' : '#9CA3AF', // 使用更暗的顏色
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: theme.spacing.sm,
            }}
          >
            {t('rake.viewRecords')}
          </Text>
        </TouchableOpacity>

        {/* 當前服務費統計（點擊可開啟列表） */}
        {currentGame && rakeCount > 0 && (
          <TouchableOpacity onPress={() => setRecordsVisible(true)} style={styles.summaryCard} activeOpacity={1}>
            <Text
              style={[
                styles.summaryTitle,
                { color: theme.colors.textSecondary }, // 使用與輸入金額相同的文字顏色
              ]}
            >
              {t('rake.currentStats')}
            </Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('rake.totalCount')}</Text>
              <Text style={styles.summaryValue}>{rakeCount} {t('rake.times')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('rake.totalAmount')}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalRakes)}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 時間輸入欄 */}
        <View style={[styles.timeInputRow, { marginBottom: theme.spacing.lg }]}>
          <TextInput
            style={styles.timeInput}
            value={time}
            onChangeText={setTime}
            placeholder="時間"
            placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
          />
        </View>

        {/* 抽水金額 + 確認按鈕（WhatsApp 風格） */}
        <View style={[styles.inputWithButtonRow, { marginBottom: theme.spacing.sm }]}>
          <Text style={styles.inputIcon}>$</Text>
          <TextInput
            style={styles.inputInline}
            value={amount}
            onChangeText={setAmount}
            placeholder="輸入服務費金額"
            placeholderTextColor={colorMode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
            keyboardType="decimal-pad"
          />
          {amount.trim() !== '' && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleAddRake}
              activeOpacity={0.8}
            >
              <Text style={styles.sendButtonText}>✓</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 抽水紀錄彈窗 */}
        <RakeRecordsModal visible={recordsVisible} onClose={() => setRecordsVisible(false)} />
      </ScrollView>
    </Modal>
  );
};

export default RakeModal;
