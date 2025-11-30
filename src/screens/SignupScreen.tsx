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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithGoogle as firebaseGoogleSignIn, signUpWithEmailAndPassword } from '../services/firebaseAuth';
import { Language } from '../types/language';

interface SignupScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onSignupSuccess: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onBack, onLogin, onSignupSuccess }) => {
  const { theme, colorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { signInWithGoogle } = useAuth();
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
      height: 650,
      overflow: 'hidden',
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
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#F8F9FA',
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
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#F8F9FA',
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
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#F8F9FA',
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
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.sm,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: acceptTerms 
        ? (colorMode === 'dark' ? '#FFFFFF' : '#007AFF')
        : (colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA'),
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    termsText: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      flex: 1,
      lineHeight: 20,
    },
    termsLink: {
      color: '#007AFF',
    },
    signupButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md + 4,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
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
      await signUpWithEmailAndPassword(email, password);
      onSignupSuccess();
    } catch (error) {
      Alert.alert(t('auth.signupFailed'), t('auth.signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await firebaseGoogleSignIn();
      onSignupSuccess();
    } catch (error) {
      Alert.alert(t('auth.signupFailed'), t('auth.signupFailed') + ' - Google');
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
      <View style={{ marginTop: 180 }}>
        <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
          </View>
        </View>

        <View style={stylesCard.card}>
          <View style={stylesCard.cardContent}>
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
            <TouchableOpacity style={stylesCard.checkboxContainer} onPress={toggleAcceptTerms}>
              <View style={stylesCard.checkbox}>
                {acceptTerms && (
                  <MaterialCommunityIcons 
                    name="check" 
                    size={16} 
                    color={colorMode === 'dark' ? '#FFFFFF' : '#007AFF'} 
                  />
                )}
              </View>
              <Text style={stylesCard.termsText}>
                {t('auth.acceptTerms')}{' '}
                <Text style={stylesCard.termsLink}>{t('auth.termsOfService')}</Text>
                {' '}{t('auth.or')}{' '}
                <Text style={stylesCard.termsLink}>{t('auth.privacyPolicy')}</Text>
              </Text>
            </TouchableOpacity>
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
            <TouchableOpacity 
              style={[stylesCard.socialButton, stylesCard.googleButton]} 
              onPress={handleGoogleSignup}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="google" 
                size={20} 
                color="#FFFFFF" 
                style={stylesCard.socialIcon}
              />
              <Text style={stylesCard.socialText}>{t('auth.signupWithGoogle')}</Text>
            </TouchableOpacity>
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
          </View>
        </View>
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

export default SignupScreen;
