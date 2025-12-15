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
import Button from './Button';
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
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

        {/* 抽水金額 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('rake.amount')}</Text>
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
            inputMode="decimal"
            {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
          />
        </View>

        {/* 時間 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('rake.time')}</Text>
          <TextInput
            style={[styles.input, focusedInput === 'time' && styles.inputFocused, { color: colorMode === 'light' ? '#4B5563' : theme.colors.text }]}
            value={time}
            onChangeText={setTime}
            placeholder={t('rake.timePlaceholder')}
            placeholderTextColor={
              focusedInput === 'time'
                ? 'transparent'
                : theme.colors.textSecondary
            }
            onFocus={() => setFocusedInput('time')}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* 確認按鈕 */}
        <Button
          title={t('rake.recordRake')}
          onPress={handleAddRake}
          size="lg"
        />

        {/* 抽水紀錄彈窗 */}
        <RakeRecordsModal visible={recordsVisible} onClose={() => setRecordsVisible(false)} />
      </ScrollView>
    </Modal>
  );
};

export default RakeModal;
