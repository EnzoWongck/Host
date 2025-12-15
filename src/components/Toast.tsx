import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onClose,
}) => {
  const { theme, colorMode } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // 立即顯示，無動畫
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      
      // 自動關閉
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // 立即隱藏，無動畫
      fadeAnim.setValue(0);
      slideAnim.setValue(-100);
    }
  }, [visible, duration, onClose, fadeAnim, slideAnim]);

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        // 深色模式下使用深綠色背景，淺色模式下使用主題的 success 顏色
        const successBg = colorMode === 'dark' ? '#10B981' : theme.colors.success;
        return {
          backgroundColor: successBg,
          borderColor: successBg,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
        };
      case 'info':
        // 深色模式下使用深色背景，淺色模式下使用主題的 primary 顏色
        const infoBg = colorMode === 'dark' ? '#3B82F6' : theme.colors.primary;
        return {
          backgroundColor: infoBg,
          borderColor: infoBg,
        };
      default:
        const defaultBg = colorMode === 'dark' ? '#10B981' : theme.colors.success;
        return {
          backgroundColor: defaultBg,
          borderColor: defaultBg,
        };
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'number'; // 使用現有的圖標
      case 'error':
        return 'close';
      case 'info':
        return 'settings';
      default:
        return 'number';
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 50,
      left: 16,
      right: 16,
      zIndex: 9999,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    message: {
      flex: 1,
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: '#FFFFFF',
      lineHeight: 20,
    },
    closeButton: {
      marginLeft: theme.spacing.sm,
      padding: 4,
    },
    closeText: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.toast, getToastStyle()]}>
        <Icon
          name={getIconName()}
          size={20}
          style={[styles.icon, { tintColor: '#FFFFFF' }]}
        />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={1}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default Toast;





