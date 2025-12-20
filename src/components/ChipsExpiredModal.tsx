import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useChips } from '../context/ChipsContext';

interface ChipsExpiredModalProps {
  visible: boolean;
  onClose: () => void;
  gameId: string;
  onContinue?: () => void;
}

const ChipsExpiredModal: React.FC<ChipsExpiredModalProps> = ({
  visible,
  onClose,
  gameId,
  onContinue,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { chips, consumeChip, openPurchaseModal, loadChipsBalance } = useChips();
  
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (chips < 1) {
      // 沒有 Chips，打開購買視窗
      onClose();
      openPurchaseModal();
      return;
    }

    setLoading(true);
    
    try {
      const success = await consumeChip(gameId, 'session_renewal');
      
      if (success) {
        // 立即刷新 chips 餘額
        await loadChipsBalance();
        onClose();
        if (onContinue) {
          onContinue();
        }
      } else {
        alert('消耗 Chip 失敗，請稍後再試');
      }
    } catch (error) {
      console.error('續費失敗:', error);
      alert(`續費失敗：${error instanceof Error ? error.message : '未知錯誤'}，請稍後再試`);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyChips = () => {
    onClose();
    openPurchaseModal();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 152, 0, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    iconText: {
      fontSize: 40,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
      lineHeight: 22,
    },
    balanceContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.sm,
    },
    balanceValue: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: chips > 0 ? theme.colors.success : theme.colors.error,
    },
    infoBox: {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      width: '100%',
    },
    infoText: {
      fontSize: theme.fontSize.sm,
      color: '#2196F3',
      textAlign: 'center',
      lineHeight: 20,
    },
    buttonContainer: {
      width: '100%',
      gap: theme.spacing.md,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    continueButtonDisabled: {
      opacity: 0.6,
    },
    continueButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buyButton: {
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    buyButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    viewOnlyButton: {
      padding: theme.spacing.sm,
      alignItems: 'center',
    },
    viewOnlyText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    warningText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.error,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
  });

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>⏰</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Chip 時間已到</Text>
          <Text style={styles.subtitle}>
            您的牌局編輯時間已用完{'\n'}
            需要消耗 1 個 Chip 才能繼續編輯
          </Text>

          {/* Current Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>目前餘額：</Text>
            <Text style={styles.balanceValue}>{chips} Chips</Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 每 1 Chip 提供 12 小時牌局編輯時間{'\n'}
              您仍可查看數據，但無法進行編輯操作
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {chips > 0 ? (
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  loading && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.continueButtonText}>
                    消耗 1 Chip 繼續編輯
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleBuyChips}
                >
                  <Text style={styles.continueButtonText}>
                    購買 Chips
                  </Text>
                </TouchableOpacity>
                <Text style={styles.warningText}>
                  您的 Chips 餘額不足，請先購買
                </Text>
              </>
            )}

            <TouchableOpacity
              style={styles.buyButton}
              onPress={handleBuyChips}
            >
              <Text style={styles.buyButtonText}>查看更多套餐</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewOnlyButton}
              onPress={onClose}
            >
              <Text style={styles.viewOnlyText}>暫時只查看（無法編輯）</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChipsExpiredModal;

