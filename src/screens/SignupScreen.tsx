import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/Icon';
import TopTabBar from '../components/TopTabBar';
import GoogleButton from '../components/GoogleButton';
import { Language } from '../types/language';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SignupScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onSignupSuccess: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onBack, onLogin, onSignupSuccess }) => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#0A0A0A' : '#F8FAFC',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    logoButton: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      padding: theme.spacing.xs,
      zIndex: 1000,
    },
    logoIcon: {
      width: 100,
      height: 100,
      borderRadius: 14,
    },
    languageButton: {
      position: 'absolute',
      top: theme.spacing.md + (100 - 40) / 2,
      right: theme.spacing.md,
      padding: theme.spacing.sm,
      zIndex: 1000,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      width: '100%',
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    hostTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      letterSpacing: -1,
    },
  });

  const stylesCard = StyleSheet.create({
    card: {
      backgroundColor: colorMode === 'dark' ? '#121212' : '#FFFFFF',
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
      maxHeight: Platform.OS === 'web' ? 650 : '90%',
      minHeight: 500,
    },
    cardContent: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    title: {
      fontSize: theme.fontSize.xxl,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#1E293B',
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
      letterSpacing: -0.5,
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
    inputContainer: {
      position: 'relative',
    },
    input: {
      backgroundColor: colorMode === 'dark' ? '#121212' : '#F8F9FA',
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA',
      borderRadius: 12,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingRight: 50,
      fontSize: theme.fontSize.md,
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
    },
    emailInput: {
      backgroundColor: colorMode === 'dark' ? '#121212' : '#F8F9FA',
      borderWidth: email ? 2 : 1,
      borderColor: email ? '#007AFF' : (colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA'),
      borderRadius: 12,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingRight: 50,
      fontSize: theme.fontSize.md,
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
    },
    passwordInput: {
      backgroundColor: colorMode === 'dark' ? '#121212' : '#F8F9FA',
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA',
      borderRadius: 12,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingRight: 50,
      fontSize: theme.fontSize.md,
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
    },
    inputIcon: {
      position: 'absolute',
      right: theme.spacing.lg,
      top: theme.spacing.md + 2,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: acceptTerms 
        ? (colorMode === 'dark' ? '#FFFFFF' : '#007AFF')
        : (colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA'),
      backgroundColor: acceptTerms 
        ? (colorMode === 'dark' ? '#FFFFFF' : '#007AFF')
        : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
      minWidth: 22,
      minHeight: 22,
    },
    termsText: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      flex: 1,
      lineHeight: 20,
    },
    termsLink: {
      color: '#007AFF',
      textDecorationLine: 'underline',
    },
    signupButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md + 4,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    signupButtonActive: {
      borderWidth: 2,
      borderColor: '#FFFFFF',
      paddingVertical: theme.spacing.md + 2,
      paddingHorizontal: theme.spacing.lg - 2,
    },
    signupButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: colorMode === 'dark' ? '#3A3A3C' : '#C7C7CC',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.sm,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA',
    },
    dividerText: {
      marginHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
    },
    socialContainer: {
      marginBottom: theme.spacing.sm,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 12,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
    },
    googleButton: {
      backgroundColor: '#4285F4',
      borderColor: '#4285F4',
    },
    socialIcon: {
      marginRight: theme.spacing.sm,
    },
    socialText: {
      fontSize: theme.fontSize.md,
      fontWeight: '500',
      color: '#FFFFFF',
    },
    loginContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    loginText: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
      marginBottom: theme.spacing.sm,
    },
    loginButton: {
      borderWidth: 2,
      borderColor: '#007AFF',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    loginButtonText: {
      color: '#007AFF',
      fontSize: theme.fontSize.md,
      fontWeight: '500',
    },
  });

  const handleNameSignup = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('auth.errorEmailRequired'));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('auth.errorPasswordRequired'));
      return;
    }

    if (!acceptTerms) {
      Alert.alert(t('common.error') || '錯誤', t('auth.errorTermsRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email.trim(), password.trim());
      onSignupSuccess();
    } catch (error: any) {
      Alert.alert(t('auth.signupFailed'), error?.message || t('auth.signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onSignupSuccess();
    } catch (error: any) {
      Alert.alert(t('auth.signupFailed'), error?.message || t('auth.signupFailed') + ' - Google');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAcceptTerms = () => {
    setAcceptTerms(!acceptTerms);
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopTabBar transparent />
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'web' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: Platform.OS === 'web' ? 0 : theme.spacing.xl,
            minHeight: Platform.OS === 'web' ? '100%' : undefined,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
            </View>
          </View>

          <View style={stylesCard.card}>
            <ScrollView
              contentContainerStyle={stylesCard.cardContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <Text style={stylesCard.title}>{t('auth.signup')}</Text>

          <View style={stylesCard.fieldContainer}>
            <Text style={stylesCard.label}>{t('auth.email')}</Text>
            <View style={stylesCard.inputContainer}>
              <TextInput
                style={stylesCard.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.enterEmail')}
                placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#6B7280'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={stylesCard.fieldContainer}>
            <Text style={stylesCard.label}>{t('auth.password')}</Text>
            <View style={stylesCard.inputContainer}>
              <TextInput
                style={stylesCard.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth.enterPassword')}
                placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#6B7280'}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={stylesCard.inputIcon}
              >
                <Icon 
                  name={colorMode === 'dark' ? 'eye-off' : 'eye'}
                  size={20}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={stylesCard.termsContainer}>
            <View style={stylesCard.checkboxContainer}>
              <TouchableOpacity 
                onPress={toggleAcceptTerms} 
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.sm }}
                activeOpacity={0.7}
              >
                <View style={stylesCard.checkbox}>
                  {acceptTerms && (
                    <Text style={{
                      color: colorMode === 'dark' ? '#000000' : '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 'bold',
                      lineHeight: 16,
                    }}>
                      ✓
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={toggleAcceptTerms}
                style={{ flex: 1 }}
                activeOpacity={0.7}
              >
                <Text style={stylesCard.termsText}>
                  {t('auth.acceptTerms')}{' '}
                  <Text 
                    style={stylesCard.termsLink}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      // 打開服務條款（可以在新窗口打開或顯示模態框）
                      if (Platform.OS === 'web') {
                        window.open('https://lunchips.com/terms', '_blank');
                      } else {
                        Alert.alert(t('auth.termsOfService') || '服務條款', '請訪問 https://lunchips.com/terms 查看服務條款');
                      }
                    }}
                  >
                    {t('auth.termsOfService')}
                  </Text>
                  {' '}{t('auth.or')}{' '}
                  <Text 
                    style={stylesCard.termsLink}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      // 打開隱私政策
                      if (Platform.OS === 'web') {
                        window.open('https://lunchips.com/privacy', '_blank');
                      } else {
                        Alert.alert(t('auth.privacyPolicy') || '隱私政策', '請訪問 https://lunchips.com/privacy 查看隱私政策');
                      }
                    }}
                  >
                    {t('auth.privacyPolicy')}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              stylesCard.signupButton,
              (email.trim() && password.trim() && acceptTerms && !isLoading) && stylesCard.signupButtonActive,
              (isLoading || !email.trim() || !password.trim() || !acceptTerms) && stylesCard.disabledButton
            ]}
            onPress={handleNameSignup}
            disabled={isLoading || !email.trim() || !password.trim() || !acceptTerms}
            activeOpacity={0.8}
          >
            <Text style={stylesCard.signupButtonText}>{t('auth.signup')}</Text>
          </TouchableOpacity>

          <View style={stylesCard.dividerContainer}>
            <View style={stylesCard.dividerLine} />
            <Text style={stylesCard.dividerText}>{t('auth.or')}</Text>
            <View style={stylesCard.dividerLine} />
          </View>

          <View style={stylesCard.socialContainer}>
            <GoogleButton
              onPress={handleGoogleSignup}
              disabled={isLoading}
              title={t('auth.signupWithGoogle')}
            />
          </View>

          <View style={stylesCard.loginContainer}>
            <Text style={stylesCard.loginText}>{t('auth.haveAccount')}</Text>
            <TouchableOpacity 
              style={stylesCard.loginButton}
              onPress={onLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={stylesCard.loginButtonText}>{t('auth.loginHere')}</Text>
            </TouchableOpacity>
          </View>
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              backgroundColor: colorMode === 'dark' ? '#121212' : '#FFFFFF',
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
    </SafeAreaView>
  );
};

export default SignupScreen;
