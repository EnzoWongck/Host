import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../context/ToastContext';
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
  const { state, addRake } = useGame();
  const { showToast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [time, setTime] = useState('');
  const [recordsVisible, setRecordsVisible] = useState(false);

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
      Alert.alert('錯誤', '沒有進行中的牌局');
      return;
    }

    const rakeAmount = parseFloat(amount);
    if (isNaN(rakeAmount) || rakeAmount <= 0) {
      Alert.alert('錯誤', '請輸入有效的抽水金額');
      return;
    }

    const rakeTime = time.trim() || getCurrentTime();

    const newRake: Omit<Rake, 'id' | 'timestamp'> = {
      amount: rakeAmount,
    };

    addRake(currentGame.id, newRake);

    showToast(`已記錄抽水：$${rakeAmount.toLocaleString()} 時間：${rakeTime}`, 'success');

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
      title="抽水"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 查看抽水紀錄入口 */}
        <TouchableOpacity onPress={() => setRecordsVisible(true)} activeOpacity={1}>
          <Text style={{ color: theme.colors.primary, textAlign: 'center', fontWeight: '600', marginBottom: theme.spacing.sm }}>
            查看抽水紀錄
          </Text>
        </TouchableOpacity>

        {/* 當前抽水統計（點擊可開啟列表） */}
        {currentGame && rakeCount > 0 && (
          <TouchableOpacity onPress={() => setRecordsVisible(true)} style={styles.summaryCard} activeOpacity={1}>
            <Text style={styles.summaryTitle}>當前抽水統計</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>總抽水次數：</Text>
              <Text style={styles.summaryValue}>{rakeCount} 次</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>總抽水金額：</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalRakes)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>平均抽水：</Text>
              <Text style={styles.summaryValue}>{formatCurrency(averageRake)}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 抽水金額 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>抽水金額</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="輸入抽水金額"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        {/* 時間 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>時間（可選）</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="自動填入當前時間"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* 確認按鈕 */}
        <Button
          title="記錄抽水"
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
