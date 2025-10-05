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
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import { signInWithGoogle as firebaseGoogleSignIn, signInWithAppleFirebase, signUpWithEmailAndPassword } from '../services/firebaseAuth';

interface SignupScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onSignupSuccess: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onBack, onLogin, onSignupSuccess }) => {
  const { theme, colorMode } = useTheme();
  const { signInWithApple, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#F5F5F7',
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
      backgroundColor: colorMode === 'dark' ? '#2A2A2A' : '#FFFFFF',
      borderRadius: 16,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: colorMode === 'dark' ? 0.5 : 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
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
      borderWidth: name ? 2 : 1,
      borderColor: name ? '#007AFF' : (colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA'),
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
      borderColor: colorMode === 'dark' ? '#3A3A3C' : '#E5E5EA',
      backgroundColor: acceptTerms ? '#007AFF' : 'transparent',
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
      backgroundColor: '#007AFF',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: '#007AFF',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
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
    appleButton: {
      backgroundColor: '#000000',
      borderColor: '#000000',
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
    if (!name.trim()) {
      Alert.alert('錯誤', '請輸入姓名');
      return;
    }

    if (!email.trim()) {
      Alert.alert('錯誤', '請輸入電子郵件');
      return;
    }

    if (!password.trim()) {
      Alert.alert('錯誤', '請輸入密碼');
      return;
    }

    if (!acceptTerms) {
      Alert.alert('錯誤', '請接受服務條款和隱私政策');
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmailAndPassword(email, password);
      onSignupSuccess();
    } catch (error) {
      Alert.alert('註冊失敗', '註冊時發生錯誤，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithAppleFirebase();
      onSignupSuccess();
    } catch (error) {
      Alert.alert('註冊失敗', 'Apple 註冊時發生錯誤');
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
      Alert.alert('註冊失敗', 'Google 註冊時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAcceptTerms = () => {
    setAcceptTerms(!acceptTerms);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.hostTitle}>Host</Text>
          </View>
        </View>

        <View style={stylesCard.card}>
          <Text style={stylesCard.title}>SIGN UP</Text>

          <View style={stylesCard.fieldContainer}>
            <Text style={stylesCard.label}>Name</Text>
            <View style={stylesCard.inputContainer}>
              <TextInput
                style={stylesCard.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#6B7280'}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <View style={stylesCard.inputIcon}>
                <Icon 
                  name="user" 
                  size={20} 
                  color="#007AFF"
                />
              </View>
            </View>
          </View>

          <View style={stylesCard.fieldContainer}>
            <Text style={stylesCard.label}>Email</Text>
            <View style={stylesCard.inputContainer}>
              <TextInput
                style={stylesCard.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#6B7280'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={stylesCard.inputIcon}>
                <Icon 
                  name="mail" 
                  size={20} 
                  color="#007AFF"
                />
              </View>
            </View>
          </View>

          <View style={stylesCard.fieldContainer}>
            <Text style={stylesCard.label}>Password</Text>
            <View style={stylesCard.inputContainer}>
              <TextInput
                style={stylesCard.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
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
                  name={showPassword ? "eye" : "eye-off"} 
                  size={20} 
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={stylesCard.termsContainer}>
            <TouchableOpacity style={stylesCard.checkboxContainer} onPress={toggleAcceptTerms}>
              <View style={stylesCard.checkbox}>
                {acceptTerms && (
                  <View style={{
                    width: 10,
                    height: 10,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                  }} />
                )}
              </View>
              <Text style={stylesCard.termsText}>
                I accept the{' '}
                <Text style={stylesCard.termsLink}>terms of service</Text>
                {' '}and{' '}
                <Text style={stylesCard.termsLink}>privacy policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              stylesCard.signupButton,
              (!name.trim() || !email.trim() || !password.trim() || !acceptTerms) && stylesCard.disabledButton
            ]}
            onPress={handleNameSignup}
            disabled={isLoading || !name.trim() || !email.trim() || !password.trim() || !acceptTerms}
            activeOpacity={0.8}
          >
            <Text style={stylesCard.signupButtonText}>Sign up</Text>
          </TouchableOpacity>

          <View style={stylesCard.dividerContainer}>
            <View style={stylesCard.dividerLine} />
            <Text style={stylesCard.dividerText}>or</Text>
            <View style={stylesCard.dividerLine} />
          </View>

          <View style={stylesCard.socialContainer}>
            <TouchableOpacity 
              style={[stylesCard.socialButton, stylesCard.appleButton]} 
              onPress={handleAppleSignup}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Icon 
                name="apple" 
                size={20} 
                color="#FFFFFF" 
                style={stylesCard.socialIcon}
              />
              <Text style={stylesCard.socialText}>Sign up with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[stylesCard.socialButton, stylesCard.googleButton]} 
              onPress={handleGoogleSignup}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Icon 
                name="chrome" 
                size={20} 
                color="#FFFFFF" 
                style={stylesCard.socialIcon}
              />
              <Text style={stylesCard.socialText}>Sign up with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={stylesCard.loginContainer}>
            <Text style={stylesCard.loginText}>Already have an account?</Text>
            <TouchableOpacity 
              style={stylesCard.loginButton}
              onPress={onLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={stylesCard.loginButtonText}>Log in here!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignupScreen;
