import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { Language } from '../types/language';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#0A0A0A' : '#F5F5F7',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logoImage: {
      width: 300,
      height: 300,
      marginBottom: theme.spacing.md, // 縮短與文字的距離
      marginTop: theme.spacing.lg, // 向下移動
    },
    hostTitle: {
      fontSize: 48,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      letterSpacing: -1,
      transform: [{ translateY: -25 }], // 向上移動更多
    },
    subtitle: {
      fontSize: theme.fontSize.lg,
      color: colorMode === 'dark' ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      lineHeight: 26,
      paddingHorizontal: theme.spacing.lg,
      fontWeight: '400',
    },
    featureList: {
      width: '100%',
      maxWidth: 400,
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      transform: [{ translateY: -15 }], // 向上移動 15px
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    featureIcon: {
      width: 24,
      height: 24,
      marginRight: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      fontSize: theme.fontSize.md,
      color: colorMode === 'dark' ? '#D1D5DB' : '#4B5563',
      flex: 1,
      fontWeight: '500',
    },
    buttonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingHorizontal: theme.spacing.md,
    },
    getStartedButton: {
      backgroundColor: '#fef8e8',
      paddingVertical: theme.spacing.md + 4,
      paddingHorizontal: theme.spacing.xl + 8,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    getStartedText: {
      color: '#000000', // 黑色文字
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
    },
    bottomLinks: {
      alignItems: 'center',
    },
    privacyText: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
    },
    languageButton: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      padding: theme.spacing.sm,
      zIndex: 1000,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setLanguageModalVisible(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon 
          name="earth2"
          size={40}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/icons/host27o.icon.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.hostTitle}>Host27o</Text>
        </View>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
            </View>
            <Text style={styles.featureText}>{t('welcome.feature1')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={{ fontSize: 20 }}>💰</Text>
            </View>
            <Text style={styles.featureText}>{t('welcome.feature2')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={{ fontSize: 20 }}>📊</Text>
            </View>
            <Text style={styles.featureText}>{t('welcome.feature3')}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={onGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>{t('welcome.getStarted')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomLinks}>
          <Text style={styles.privacyText}>{t('welcome.privacy')}</Text>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              minWidth: 200,
            }}
          >
            <Text style={{ fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md }}>
              {t('settings.language')}
            </Text>
            <TouchableOpacity
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: language === 'zh-TW' ? theme.colors.primary + '20' : 'transparent',
                marginBottom: theme.spacing.sm,
              }}
              onPress={() => handleLanguageSelect('zh-TW')}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>{t('settings.traditionalChinese')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: language === 'zh-CN' ? theme.colors.primary + '20' : 'transparent',
              }}
              onPress={() => handleLanguageSelect('zh-CN')}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: language === 'zh-CN' ? '700' : '400' }}>{t('settings.simplifiedChinese')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
