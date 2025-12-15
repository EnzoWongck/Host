import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIconName?: 'buy-in' | 'close' | 'home' | 'insurance' | 'rent' | 'settings' | 'expense' | 'rake' | 'dealer' | 'table' | 'taxi' | 'misc711' | 'pokercard' | 'number' | 'cashout' | 'player' | 'player2' | 'cost' | 'burger' | 'other';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  leftIconName,
}) => {
  const { theme, colorMode } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...sizes[size],
    };

    switch (variant) {
      case 'primary':
        // 主按鈕添加微光和內陰影效果（3D 擬物風格）
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.textSecondary : theme.colors.primary,
          shadowColor: theme.colorMode === 'light' ? '#000' : '#000',
          shadowOffset: { width: 0, height: 4 }, // 增加陰影深度
          shadowOpacity: theme.colorMode === 'light' ? 0.15 : 0.25, // 增強陰影
          shadowRadius: 8, // 增加陰影半徑
          elevation: 5, // 增加 elevation
          // 添加內陰影效果（通過偽元素或額外 View 實現，這裡先設置基礎）
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.border : theme.colors.textSecondary,
          shadowColor: theme.colorMode === 'light' ? '#000' : '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.colorMode === 'light' ? 0.05 : 0.1,
          shadowRadius: 2,
          elevation: 1,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? theme.colors.border : theme.colors.primary,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.textSecondary : theme.colors.error, // 已更新為 #D70015
          shadowColor: theme.colorMode === 'light' ? '#000' : '#000',
          shadowOffset: { width: 0, height: 4 }, // 與 primary 相同
          shadowOpacity: theme.colorMode === 'light' ? 0.15 : 0.25, // 與 primary 相同
          shadowRadius: 8, // 與 primary 相同
          elevation: 5, // 與 primary 相同
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: '600' as const,
      letterSpacing: 0.3,
      textAlign: 'center' as const,
      ...textSizes[size],
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: colorMode === 'light' ? '#64748B' : '#FFFFFF',
        };
      case 'danger':
        return {
          ...baseTextStyle,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseTextStyle,
          color: theme.colors.background,
        };
      case 'outline':
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.textSecondary : theme.colors.primary,
        };
      default:
        return baseTextStyle;
    }
  };

  // 主按鈕的內陰影效果（僅 primary variant）
  const hasInnerShadow = variant === 'primary' && !disabled;
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style, { overflow: 'visible' }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
    >
      {hasInnerShadow && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: theme.borderRadius.md,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        }} />
      )}
      <View style={styles.contentRow}>
        {leftIconName ? (
          <Icon
            name={leftIconName}
            size={size === 'lg' ? 20 : size === 'sm' ? 16 : 18}
            style={{ marginRight: theme.spacing.sm }}
          />
        ) : null}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const sizes = {
  sm: { paddingHorizontal: 16, paddingVertical: 10 }, // 增加按鈕大小
  md: { paddingHorizontal: 20, paddingVertical: 14 }, // 增加按鈕大小
  lg: { paddingHorizontal: 28, paddingVertical: 18 }, // 增加按鈕大小
};

const textSizes = {
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Button;
