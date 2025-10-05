import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

interface InOutModalProps {
  visible: boolean;
  onClose: () => void;
  onBuyIn: () => void;
  onCashOut: () => void;
}

const InOutModal: React.FC<InOutModalProps> = ({
  visible,
  onClose,
  onBuyIn,
  onCashOut,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      minWidth: 300,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    buttonBase: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 56,
    },
    buyButton: {
      backgroundColor: theme.colors.primary,
    },
    cashButton: {
      backgroundColor: theme.colors.success,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      padding: theme.spacing.xs,
      borderRadius: 16,
      backgroundColor: theme.colors.border,
    },
    closeButtonText: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    spacer: { height: theme.spacing.sm },
  });

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      hardwareAccelerated
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.buttonBase, styles.buyButton]}
              onPress={() => {
                onClose();
                onBuyIn();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Icon name="buy-in" size={22} />
                <Text style={styles.buttonText}>買入</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonBase, styles.cashButton]}
              onPress={() => {
                onClose();
                onCashOut();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Icon name="cashout" size={22} />
                <Text style={styles.buttonText}>兌現</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InOutModal;
