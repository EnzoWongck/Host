import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { sendPasswordReset } from '../services/firebaseAuth';
import Icon from '../components/Icon';
import TopTabBar from '../components/TopTabBar';
import { Language } from '../types/language';

interface ForgetPasswordScreenProps {
  onBack: () => void;
}

const ForgetPasswordScreen: React.FC<ForgetPasswordScreenProps> = ({ onBack }) => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#0A0A0A' : '#F8FAFC',
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
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    card: {
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
      borderRadius: 20,
      padding: theme.spacing.xl + 8,
      width: '100%',
      maxWidth: 420,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: colorMode === 'dark' ? 0.4 : 0.15,
      shadowRadius: 16,
      elevation: 12,
      borderWidth: colorMode === 'dark' ? 1 : 0,
      borderColor: colorMode === 'dark' ? '#2A2A2A' : 'transparent',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#1E293B',
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#9CA3AF' : '#64748B',
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    fieldContainer: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: colorMode === 'dark' ? '#2A2A2A' : '#F8F9FA',
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA',
      borderRadius: 12,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.fontSize.md,
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md + 4,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: colorMode === 'dark' ? '#3A3A3C' : '#C7C7CC',
    },
    backButton: {
      marginTop: theme.spacing.lg,
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });

  const handleReset = async () => {
    console.log('handleReset called, email:', email);
    
    if (!email.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('auth.errorEmailRequired') || '請輸入電子郵件');
      return;
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('common.error') || '錯誤', t('auth.errorInvalidEmail') || '請輸入有效的電子郵件地址');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordReset(email);
      console.log('Password reset email sent successfully');
      Alert.alert(
        t('auth.passwordResetSent') || '密碼重置郵件已發送',
        t('auth.passwordResetSentMessage') || '請檢查您的電子郵件以重置密碼',
        [
          {
            text: t('common.ok') || '確定',
            onPress: onBack,
          },
        ]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert(
        t('common.error') || '錯誤',
        error?.message || t('auth.passwordResetFailed') || '發送密碼重置郵件失敗'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopTabBar transparent />
      <View style={{ marginTop: 180 }}>
        <View style={styles.content}>
          <View style={styles.card}>
          <Text style={styles.title}>{t('auth.forgotPassword') || '忘記密碼'}</Text>
          <Text style={styles.subtitle}>
            {t('auth.passwordResetSentMessage') || '請輸入您的電子郵件地址，我們將發送密碼重置連結給您'}
          </Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.enterEmail')}
              placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#6B7280'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || !email.trim()) && styles.disabledButton,
            ]}
            onPress={() => {
              console.log('Button pressed');
              handleReset();
            }}
            disabled={isLoading || !email.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {isLoading ? (t('common.loading') || '發送中...') : (t('auth.sendResetEmail') || '發送重置郵件')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backButtonText}>{t('common.back') || '返回'}</Text>
          </TouchableOpacity>
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
          <View
            style={{
              backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
              borderRadius: 20,
              padding: theme.spacing.xl,
              width: '80%',
              maxWidth: 300,
            }}
          >
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: '700',
                color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
                marginBottom: theme.spacing.lg,
                textAlign: 'center',
              }}
            >
              {t('common.selectLanguage') || '選擇語言'}
            </Text>
            <TouchableOpacity
              style={{
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: 12,
                backgroundColor: language === 'zh-TW' ? theme.colors.primary : 'transparent',
                marginBottom: theme.spacing.sm,
              }}
              onPress={() => handleLanguageSelect('zh-TW')}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  color: language === 'zh-TW' ? '#FFFFFF' : (colorMode === 'dark' ? '#FFFFFF' : '#000000'),
                  textAlign: 'center',
                }}
              >
                繁體中文
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: 12,
                backgroundColor: language === 'zh-CN' ? theme.colors.primary : 'transparent',
              }}
              onPress={() => handleLanguageSelect('zh-CN')}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  color: language === 'zh-CN' ? '#FFFFFF' : (colorMode === 'dark' ? '#FFFFFF' : '#000000'),
                  textAlign: 'center',
                }}
              >
                简体中文
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default ForgetPasswordScreen;

