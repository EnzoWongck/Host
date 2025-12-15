import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  
  const finalConfirmText = confirmText || t('common.confirm');
  const finalCancelText = cancelText || t('common.cancel');

  // 獲取螢幕尺寸
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768; // 判斷是否為手機

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
    <Modal 
      visible={visible} 
      onClose={onClose} 
      title={title} 
      maxWidth={isMobile ? screenWidth - 32 : 500}
      maxHeight={isMobile ? '90%' : undefined}
      containerStyle={isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : undefined}
    >
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <Button
            title={finalCancelText}
            onPress={onClose}
            variant="outline"
            size="sm"
            style={[
              colorMode === 'light' && {
                borderColor: theme.colors.primary,
              },
            ]}
            textStyle={{
              color: colorMode === 'light' ? '#64748B' : '#FFFFFF',
            }}
          />
        </View>
        <View style={styles.buttonContainerLast}>
          <Button
            title={finalConfirmText}
            onPress={handleConfirm}
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            style={{
              width: '100%',
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

