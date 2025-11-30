import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigationContext } from '../context/NavigationContext';
import Icon from './Icon';
import { Language } from '../types/language';

interface TopTabBarProps {
  title?: string | React.ReactNode;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

const TopTabBar: React.FC<TopTabBarProps> = ({ title, rightComponent, transparent = false }) => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { navigateToWelcome } = useNavigationContext();
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: transparent ? 'transparent' : theme.colors.background,
      borderBottomWidth: 0,
      zIndex: 1000,
      paddingTop: theme.spacing.sm + 20, // Safe area padding, moved up
      height: 120, // Reduced height, moved up
    },
    logoButton: {
      padding: theme.spacing.xs,
      minWidth: 100,
      minHeight: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoIcon: {
      width: 100,
      height: 100,
      borderRadius: 14,
    },
    titleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    titleText: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    languageButton: {
      padding: theme.spacing.sm,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      minWidth: 200,
    },
    languageOption: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    languageOptionSelected: {
      backgroundColor: theme.colors.primary + '20',
    },
    languageOptionText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.logoButton}
          onPress={navigateToWelcome}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/icons/host27o.icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        )}
        <View style={styles.rightContainer}>
          {rightComponent}
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setLanguageModalVisible(true)}
            activeOpacity={0.7}
          >
            <Icon 
              name="earth2"
              size={40}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'zh-TW' && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageSelect('zh-TW')}
            >
              <Text style={styles.languageOptionText}>繁體中文</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageOption,
                language === 'zh-CN' && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageSelect('zh-CN')}
            >
              <Text style={styles.languageOptionText}>简体中文</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default TopTabBar;

