import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { Language } from '../types/language';
// 靜態導入圖片
import WelcomeIconImage from '../../assets/icons/welcomeicon.png';
import SpaceIconImage from '../../assets/icons/space.1.png';
import SpadeIconImage from '../../assets/icons/spade.1.png';
import HeartIconImage from '../../assets/icons/heart.1.png';
import ChangeIconImage from '../../assets/icons/change.png';

export default function Welcome() {
  const { theme, colorMode, toggleColorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

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
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    hostTitle: {
      fontSize: 48,
      fontWeight: '700',
      fontFamily: Platform.OS === 'web' ? 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif' : 'Satoshi',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      letterSpacing: -1,
      transform: [{ translateY: -25 }],
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
      transform: [{ translateY: -15 }],
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      justifyContent: 'center',
    },
    featureIcon: {
      width: 28,
      height: 28,
      marginRight: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureIconImage: {
      width: 28,
      height: 28,
      resizeMode: 'contain',
    },
    featureText: {
      fontSize: theme.fontSize.md,
      color: colorMode === 'dark' ? '#D1D5DB' : '#4B5563',
      fontWeight: '500',
      textAlign: 'left',
    },
    buttonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingHorizontal: theme.spacing.md,
    },
    getStartedButton: {
      backgroundColor: colorMode === 'dark' ? '#FFFFFF' : '#fef8e8',
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
      color: '#000000',
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
    settingsButton: {
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
    threeDotsContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 40,
      width: 40,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.text,
      marginVertical: 2,
    },
  });

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };

  const handleColorModeToggle = () => {
    toggleColorMode();
  };

  // 如果顯示登入或註冊頁面，直接返回該頁面
  if (showLogin && !showSignup) {
    return (
      <LoginScreen
        onBack={() => setShowLogin(false)}
        onLoginSuccess={() => {
          setShowLogin(false);
          // 登入成功後，App.tsx 會自動導航到 Dashboard
        }}
        onSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
        onForgotPassword={() => {
          // 忘記密碼功能
          Alert.alert('忘記密碼', '忘記密碼功能即將推出');
        }}
      />
    );
  }

  if (showSignup) {
    return (
      <SignupScreen
        onBack={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
        onSignupSuccess={() => {
          setShowSignup(false);
          // 註冊成功後，App.tsx 會自動導航到 Dashboard
        }}
        onLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSettingsModalVisible(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.threeDotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </TouchableOpacity>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={WelcomeIconImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.hostTitle}>LunChips</Text>
        </View>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Image 
                source={SpaceIconImage} 
                style={styles.featureIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.featureText}>{t('welcome.feature1')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Image 
                source={SpadeIconImage} 
                style={styles.featureIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.featureText}>{t('welcome.feature2')}</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Image 
                source={HeartIconImage} 
                style={styles.featureIconImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.featureText}>{t('welcome.feature3')}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={() => setShowLogin(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>{t('welcome.getStarted') || '免費試用'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomLinks}>
          <Text style={styles.privacyText}>{t('welcome.privacy')}</Text>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setSettingsModalVisible(false)}
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
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: 'transparent',
                marginBottom: theme.spacing.sm,
              }}
              onPress={() => {
                handleLanguageSelect(language === 'zh-TW' ? 'zh-CN' : 'zh-TW');
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
                {language === 'zh-TW' ? '繁體中文' : '简体中文'}
              </Text>
              <Image
                source={ChangeIconImage}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                handleColorModeToggle();
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
                {colorMode === 'light' ? '淺色模式' : '深色模式'}
              </Text>
              <Image
                source={ChangeIconImage}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
