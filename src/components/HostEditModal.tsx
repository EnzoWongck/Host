import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import Button from './Button';
import { Host } from '../types/game';

interface HostEditModalProps {
  visible: boolean;
  onClose: () => void;
}

const HostEditModal: React.FC<HostEditModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state, updateGame } = useGame();
  const { showToast } = useToast();
  const currentGame = state.currentGame;

  const [hosts, setHosts] = useState<{ name: string; shareRatio: number }[]>([]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // 格式化百分比：整數時不顯示小數點
  const formatPercentage = (ratio: number): string => {
    const percent = ratio * 100;
    if (percent % 1 === 0) {
      return percent.toString(); // 整數時直接返回整數字符串
    }
    return percent.toFixed(1); // 有小數時顯示一位小數
  };

  useEffect(() => {
    if (visible && currentGame) {
      const rawHosts = currentGame.hosts || [];
      const equalShare = rawHosts.length > 0 ? 1 / rawHosts.length : 0;
      const initialHosts = rawHosts.map((h) => {
        if (typeof h === 'string') {
          return { name: h, shareRatio: equalShare };
        }
        return { name: h.name, shareRatio: h.shareRatio ?? equalShare };
      });
      setHosts(initialHosts);
    }
  }, [visible, currentGame, currentGame?.hosts]); // 添加 currentGame?.hosts 依賴，確保 host 更新時觸發

  const handleAddHost = () => {
    const equalShare = hosts.length > 0 ? (1 - hosts.reduce((sum, h) => sum + h.shareRatio, 0)) / (hosts.length + 1) : 1;
    setHosts([...hosts, { name: '', shareRatio: equalShare }]);
  };

  const handleRemoveHost = (index: number) => {
    if (hosts.length <= 1) {
      Alert.alert('錯誤', '至少需要一個 Host');
      return;
    }
    const newHosts = hosts.filter((_, i) => i !== index);
    // 重新分配比例
    const totalRemainingShare = newHosts.reduce((sum, h) => sum + h.shareRatio, 0);
    if (totalRemainingShare > 0) {
      const scale = 1 / totalRemainingShare;
      setHosts(newHosts.map(h => ({ ...h, shareRatio: h.shareRatio * scale })));
    } else {
      const equalShare = 1 / newHosts.length;
      setHosts(newHosts.map(h => ({ ...h, shareRatio: equalShare })));
    }
  };

  const handleUpdateHostName = (index: number, name: string) => {
    const newHosts = [...hosts];
    newHosts[index].name = name;
    setHosts(newHosts);
  };

  const handleUpdateHostShare = (index: number, shareRatio: number) => {
    const newHosts = [...hosts];
    newHosts[index].shareRatio = shareRatio;
    setHosts(newHosts);
  };

  const handleSave = () => {
    if (!currentGame) return;

    // 驗證所有 host 都有名稱
    const invalidHosts = hosts.filter(h => !h.name.trim());
    if (invalidHosts.length > 0) {
      Alert.alert('錯誤', '請為所有 Host 輸入名稱');
      return;
    }

    // 驗證比例總和必須為100%
    const totalShare = hosts.reduce((sum, h) => sum + h.shareRatio, 0);
    if (Math.abs(totalShare - 1) > 0.001) {
      Alert.alert('錯誤', `總分成比例必須為 100%，目前為 ${(totalShare * 100).toFixed(1)}%`);
      return;
    }

    // 轉換為 Host 對象
    const updatedHosts: Host[] = hosts.map(h => ({
      name: h.name.trim(),
      cost: 0,
      dealerSalary: 0,
      totalCashOut: 0,
      shareRatio: h.shareRatio,
      transferAmount: 0,
    }));

    updateGame({ ...currentGame, hosts: updatedHosts });
    showToast('Host 設定已更新', 'success');
    onClose();
  };

  const styles = StyleSheet.create({
    scrollContent: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    hostItem: {
      marginBottom: 4,
      paddingVertical: 2,
      paddingHorizontal: 0,
      backgroundColor: 'transparent',
      borderRadius: 0,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    hostRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    hostNameInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
      marginRight: theme.spacing.sm,
    },
    hostNameInputFocused: {
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.primary,
    },
    shareInput: {
      width: 70,
      borderWidth: 1,
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: colorMode === 'light' ? '#F8F9FA' : theme.colors.surface,
      textAlign: 'center',
    },
    shareInputFocused: {
      borderColor: colorMode === 'light' ? '#E5E7EB' : theme.colors.primary,
    },
    shareSuffix: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginLeft: 2,
      marginRight: theme.spacing.xs,
    },
    removeButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      marginLeft: 4,
    },
    removeButtonText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.error,
      fontWeight: '600',
    },
    addButton: {
      marginTop: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: 'transparent',
      borderRadius: 0,
      alignItems: 'center',
    },
    addButtonText: {
      fontSize: theme.fontSize.md,
      color: colorMode === 'dark' ? '#FFFFFF' : '#4B5563',
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="編輯 Host"
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hosts.map((host, index) => (
          <View key={index} style={styles.hostItem}>
            <View style={styles.hostRow}>
              <TextInput
                style={[
                  styles.hostNameInput,
                  focusedInput === `hostName-${index}` && styles.hostNameInputFocused,
                ]}
                value={host.name}
                onChangeText={(value) => handleUpdateHostName(index, value)}
                placeholder="Host 名稱"
                placeholderTextColor={focusedInput === `hostName-${index}` ? 'transparent' : theme.colors.textSecondary}
                onFocus={() => setFocusedInput(`hostName-${index}`)}
                onBlur={() => setFocusedInput(null)}
              />
              <TextInput
                style={[
                  styles.shareInput,
                  focusedInput === `share-${index}` && styles.shareInputFocused,
                ]}
                value={host.shareRatio === 0 ? '' : formatPercentage(host.shareRatio)}
                onChangeText={(value) => {
                  // 允許刪除"0"，空值時設為0
                  if (value === '' || value === '0') {
                    handleUpdateHostShare(index, 0);
                    return;
                  }
                  // 允許輸入整數或小數（不強制小數點）
                  const numericValue = value.replace(/[^0-9.]/g, '');
                  // 只允許一個小數點
                  const parts = numericValue.split('.');
                  const cleanValue = parts.length > 2 
                    ? parts[0] + '.' + parts.slice(1).join('') 
                    : numericValue;
                  const ratio = parseFloat(cleanValue) / 100;
                  handleUpdateHostShare(index, isNaN(ratio) ? 0 : ratio);
                }}
                placeholder="比例"
                placeholderTextColor={focusedInput === `share-${index}` ? 'transparent' : theme.colors.textSecondary}
                keyboardType="numeric"
                inputMode="decimal"
                {...(Platform.OS === 'web' ? { pattern: '[0-9]*' } : {})}
                onFocus={() => setFocusedInput(`share-${index}`)}
                onBlur={() => setFocusedInput(null)}
              />
              <Text style={styles.shareSuffix}>%</Text>
              {hosts.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveHost(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeButtonText}>刪除</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddHost}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ 新增 Host</Text>
        </TouchableOpacity>

        <Button
          title="儲存"
          onPress={handleSave}
          size="md"
          variant="primary"
          style={{ marginTop: theme.spacing.md }}
        />
      </ScrollView>
    </Modal>
  );
};

export default HostEditModal;

