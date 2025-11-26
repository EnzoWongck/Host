import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      ...sizes[size],
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.textSecondary : theme.colors.primary,
          shadowColor: theme.colorMode === 'light' ? '#000' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.colorMode === 'light' ? 0.1 : 0.2,
          shadowRadius: 4,
          elevation: 3,
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
          backgroundColor: disabled ? theme.colors.textSecondary : theme.colors.error,
          shadowColor: theme.colorMode === 'light' ? '#000' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.colorMode === 'light' ? 0.1 : 0.2,
          shadowRadius: 4,
          elevation: 3,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: '600' as const,
      letterSpacing: 0.3,
      ...textSizes[size],
    };

    switch (variant) {
      case 'primary':
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

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
    >
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
  sm: { paddingHorizontal: 12, paddingVertical: 8 },
  md: { paddingHorizontal: 16, paddingVertical: 12 },
  lg: { paddingHorizontal: 24, paddingVertical: 16 },
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
