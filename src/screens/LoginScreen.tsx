import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';
import TopTabBar from '../components/TopTabBar';
import GoogleButton from '../components/GoogleButton';
import { Language } from '../types/language';
// 靜態導入圖片
import Phone2LowerImage from '../../assets/icons/phone2-lower.png';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  onSignup: () => void;
  onForgotPassword: () => void;
  onPhoneLogin?: () => void; // 電話號碼登入回調
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onLoginSuccess, onSignup, onForgotPassword, onPhoneLogin }) => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { signInWithGoogle, signInWithEmail, isSignedIn } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // 監聽認證狀態變化，當登入成功時觸發回調
  useEffect(() => {
    if (isSignedIn) {
      onLoginSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

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
    header: {
      width: '100%',
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
    },
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
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    hostTitle: {
      fontSize: 40,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#1E293B',
      letterSpacing: -1.5,
      marginBottom: theme.spacing.sm,
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
    socialContainer: {
      marginBottom: theme.spacing.md,
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
    formContainer: {
      marginTop: theme.spacing.sm,
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
      backgroundColor: colorMode === 'dark' ? '#2A2A2A' : '#F8F9FA',
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
    forgotPassword: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm + 2,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: theme.spacing.md,
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
    loginButtonActive: {
      borderWidth: 2,
      borderColor: '#FFFFFF',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md - 2,
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: colorMode === 'dark' ? '#3A3A3C' : '#C7C7CC',
    },
    signupContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    signupText: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
    },
    signupLink: {
      color: '#007AFF',
      fontWeight: '500',
    },
    phoneButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DADCE0',
      borderRadius: 4,
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 40,
      width: '100%',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    phoneButtonDisabled: {
      opacity: 0.6,
    },
    phoneIconContainer: {
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    phoneIcon: {
      width: 18,
      height: 18,
    },
    phoneButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#3C4043',
      letterSpacing: 0.25,
    },
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 直接使用 AuthContext 的 signInWithGoogle
      // 它會處理重定向，登入成功後 onAuthStateChanged 會自動更新狀態
      await signInWithGoogle();
      // 不需要手動調用 onLoginSuccess，因為 useEffect 會監聽 isSignedIn 變化
    } catch (error: any) {
      Alert.alert(t('auth.loginFailed') || '登入失敗', error?.message || t('auth.loginFailed') + ' - Google');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    // 清理 email 和 password（移除前後空格）
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert(t('common.error') || '錯誤', t('auth.errorEmailRequired'));
      return;
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const errorTitle = t('auth.loginFailed') || '登入失敗';
      const errorMessage = 'Email 格式不正確，請檢查後重試。';
      showToast(errorMessage, 'error', 5000);
      if (Platform.OS === 'web') {
        window.alert(`${errorTitle}\n\n${errorMessage}`);
      } else {
        Alert.alert(errorTitle, errorMessage);
      }
      return;
    }

    setIsLoading(true);
    try {
      // 使用 AuthContext 的 signInWithEmail，傳遞清理後的 email 和 password
      await signInWithEmail(trimmedEmail, trimmedPassword);
      onLoginSuccess();
    } catch (error: any) {
      console.error('登入錯誤詳情:', error);
      console.error('錯誤代碼:', error?.code);
      console.error('錯誤訊息:', error?.message);
      console.error('完整錯誤對象:', JSON.stringify(error, null, 2));
      
      // 根據 Firebase 錯誤代碼提供友好的錯誤訊息
      const errorCode = error?.code || (error?.message?.match(/\(([^)]+)\)/)?.[1]);
      let errorMessage = '登入失敗，請檢查 Email 和密碼後重試。';
      
      // 根據錯誤代碼設置友好的錯誤訊息
      if (errorCode === 'auth/invalid-credential' || 
          errorCode === 'auth/wrong-password' || 
          errorCode === 'auth/user-not-found') {
        errorMessage = 'Email 或密碼錯誤，請檢查後重試。\n\n如果忘記密碼，請點擊「忘記密碼」重設。';
      } else if (errorCode === 'auth/user-disabled') {
        errorMessage = '此帳號已被停用，請聯繫客服。';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = '登入嘗試次數過多，請稍後再試。';
      } else if (errorCode === 'auth/network-request-failed') {
        errorMessage = '網路連線失敗，請檢查網路連線後重試。';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Email 格式不正確，請檢查後重試。';
      } else if (error?.message) {
        // 檢查錯誤訊息中是否包含已知的錯誤關鍵字
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('invalid-credential') || 
            errorMsg.includes('wrong-password') ||
            errorMsg.includes('user-not-found')) {
          errorMessage = 'Email 或密碼錯誤，請檢查後重試。\n\n如果忘記密碼，請點擊「忘記密碼」重設。';
        } else {
          errorMessage = error.message;
        }
      }
      
      const errorTitle = t('auth.loginFailed') || '登入失敗';
      
      console.log('準備顯示錯誤訊息:', { errorTitle, errorMessage, errorCode });
      
      // 在 Web 平台上，立即使用 window.alert 顯示錯誤（最可靠的方式）
      if (Platform.OS === 'web') {
        // 使用 setTimeout 確保在當前執行棧完成後執行，避免被阻塞
        setTimeout(() => {
          window.alert(`${errorTitle}\n\n${errorMessage}`);
        }, 0);
      }
      
      // 同時使用 Toast 顯示錯誤（視覺效果更好）
      try {
        showToast(errorMessage, 'error', 5000);
      } catch (toastError) {
        console.error('Toast 調用失敗:', toastError);
      }
      
      // 在原生平台上使用 Alert.alert
      if (Platform.OS !== 'web') {
        try {
          Alert.alert(errorTitle, errorMessage);
        } catch (alertError) {
          console.error('Alert.alert 調用失敗:', alertError);
        }
      }
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

          <View style={styles.card}>
            <ScrollView
              contentContainerStyle={styles.cardContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <View style={styles.logoContainer}>
              <Text style={styles.title}>{t('auth.login')}</Text>
            </View>

            <View style={styles.socialContainer}>
              <GoogleButton
                onPress={handleGoogleLogin}
                // 允許已登入後仍可點擊（方便測試與重新授權），只在載入中時禁用按鈕
                disabled={isLoading}
                title={t('auth.loginWithGoogle')}
              />
              
              {/* 電話號碼登入選項 */}
              {onPhoneLogin && (
                <TouchableOpacity
                  style={[
                    styles.phoneButton,
                    isLoading && styles.phoneButtonDisabled,
                  ]}
                  onPress={onPhoneLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.phoneIconContainer}>
                    {Platform.OS === 'web' ? (
                      <Image
                        source={{ uri: '/icons/phone2.PNG' }}
                        style={styles.phoneIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <Image
                        source={Phone2LowerImage}
                        style={styles.phoneIcon}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text style={styles.phoneButtonText}>
                    {t('auth.loginWithPhone') || '使用電話號碼登入'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('auth.email')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
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

            <View style={styles.fieldContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <Text style={styles.label}>{t('auth.password')}</Text>
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    onForgotPassword();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: theme.colors.primary }}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
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
                  style={styles.inputIcon}
                >
                  <Icon 
                    name={colorMode === 'dark' ? 'eye-off' : 'eye'}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.loginButton,
                (email.trim() && password.trim() && !isLoading) && styles.loginButtonActive,
                (isLoading || !email.trim() || !password.trim()) && styles.disabledButton,
                (email.trim() && password.trim() && !isLoading && colorMode === 'light') && {
                  backgroundColor: '#0066FF',
                },
              ]}
              onPress={handleEmailLogin}
              disabled={isLoading || !email.trim() || !password.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.signupContainer, { marginTop: theme.spacing.md }]}>
            <Text style={styles.signupText}>
              {t('auth.noAccount')}
              <TouchableOpacity onPress={onSignup}>
                <Text style={styles.signupLink}> {t('auth.signupForFree')}</Text>
              </TouchableOpacity>
            </Text>
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

export default LoginScreen;
