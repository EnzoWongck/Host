import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof styles;
}

const Card: React.FC<CardProps> = ({ children, style, padding = 'md' }) => {
  const { theme, colorMode } = useTheme();

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 0,
      shadowColor: theme.colorMode === 'light' ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: theme.colorMode === 'light' ? 0.08 : 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
  });

  return (
    <View style={[cardStyles.card, styles[padding], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  xs: { padding: 4 },
  sm: { padding: 8 },
  md: { padding: 16 },
  lg: { padding: 24 },
  xl: { padding: 32 },
});

export default Card;

