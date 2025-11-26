import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Icon from '../components/Icon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signInWithGoogle as firebaseGoogleSignIn, signInWithEmailAndPasswordFirebase } from '../services/firebaseAuth';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  onSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onLoginSuccess, onSignup }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { signInWithGoogle, signInWithEmail, isSignedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#9CA3AF' : '#64748B',
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    socialContainer: {
      marginBottom: theme.spacing.xl,
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
      marginVertical: theme.spacing.lg,
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
      marginTop: theme.spacing.lg,
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
      fontSize: theme.fontSize.sm,
      color: '#007AFF',
      fontWeight: '500',
      textAlign: 'right',
      marginTop: theme.spacing.sm,
    },
    loginButton: {
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
      marginTop: theme.spacing.xl,
    },
    signupText: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
    },
    signupLink: {
      color: '#007AFF',
      fontWeight: '500',
    },
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 先透過 Firebase 完成實際登入（取得 token 等）
      await firebaseGoogleSignIn();
      // 再更新全域 AuthContext，讓設定畫面等地方知道「已登入」
      await signInWithGoogle();
      onLoginSuccess();
    } catch (error) {
      Alert.alert(t('auth.loginFailed'), t('auth.loginFailed') + ' - Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error') || '錯誤', t('auth.errorEmailRequired'));
      return;
    }

    setIsLoading(true);
    try {
      // 先透過 Firebase 完成實際登入驗證
      await signInWithEmailAndPasswordFirebase(email, password);
      // 再更新全域 AuthContext 狀態（簡化為用 email 當顯示名稱）
      await signInWithEmail(email);
      onLoginSuccess();
    } catch (error) {
      Alert.alert(t('auth.loginFailed'), t('auth.loginFailed') + ' - ' + t('auth.email'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Text style={styles.hostTitle}>Host</Text>
            <Text style={styles.subtitle}>{t('auth.login')}</Text>
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, styles.googleButton]} 
              onPress={handleGoogleLogin}
              disabled={isLoading || isSignedIn}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="google" 
                size={20} 
                color="#FFFFFF" 
                style={styles.socialIcon}
              />
              <Text style={styles.socialText}>{t('auth.loginWithGoogle')}</Text>
            </TouchableOpacity>
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
              <Text style={styles.label}>{t('auth.password')}</Text>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={{ color: theme.colors.primary }}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>
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
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.loginButton,
                (isLoading || !email.trim() || !password.trim()) && styles.disabledButton
              ]}
              onPress={handleEmailLogin}
              disabled={isLoading || !email.trim() || !password.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              {t('auth.noAccount')}
              <TouchableOpacity onPress={onSignup}>
                <Text style={styles.signupLink}> {t('auth.signupForFree')}</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
