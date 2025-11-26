import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'danger';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  title,
  message,
  onConfirm,
  confirmText,
  cancelText,
  confirmVariant = 'default',
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const finalConfirmText = confirmText || t('common.confirm');
  const finalCancelText = cancelText || t('common.cancel');

  const styles = StyleSheet.create({
    message: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    buttonContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    buttonContainerLast: {
      flex: 1,
      marginRight: 0,
    },
  });

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <Button
            title={finalCancelText}
            onPress={onClose}
            variant="outline"
            size="lg"
          />
        </View>
        <View style={styles.buttonContainerLast}>
          <Button
            title={finalConfirmText}
            onPress={handleConfirm}
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            size="lg"
          />
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

