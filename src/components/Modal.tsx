import React from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  closeOnBackdropPress?: boolean;
  leftIconName?: string;
  fullScreen?: boolean;
  maxWidth?: number | string;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  closeOnBackdropPress = true,
  leftIconName,
  fullScreen = false,
  maxWidth,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: fullScreen ? theme.colors.background : 'rgba(0, 0, 0, 0.6)',
      justifyContent: fullScreen ? 'flex-start' : 'center',
      alignItems: 'center',
      padding: fullScreen ? 0 : theme.spacing.lg,
      zIndex: 1000,
    },
    modalContainer: {
      backgroundColor: theme.colorMode === 'light' ? '#FFFFFF' : theme.colors.surface,
      borderRadius: fullScreen ? 0 : theme.borderRadius.lg,
      width: '100%',
      maxWidth: fullScreen ? '100%' : (maxWidth ?? 700),
      height: fullScreen ? '100%' : undefined,
      maxHeight: fullScreen ? '100%' : '90%',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: fullScreen ? 0 : 0.25,
      shadowRadius: fullScreen ? 0 : 8,
      elevation: fullScreen ? 0 : 8,
      zIndex: 1001,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl + 8,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.xl,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    titleIcon: {
      marginRight: theme.spacing.sm,
    },
    closeButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.border,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    content: {
      padding: theme.spacing.lg,
    },
  });

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      hardwareAccelerated
      presentationStyle="overFullScreen"
      supportedOrientations={["portrait", "landscape"]}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  {leftIconName ? (
                    <Icon name={leftIconName as any} size={20} style={styles.titleIcon} />
                  ) : null}
                  {typeof title === 'string' ? (
                    <Text style={styles.title}>{title}</Text>
                  ) : (
                    title
                  )}
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.content}>
                {children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export default Modal;
