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
import Icon from '../components/Icon';
import { signInWithGoogle as firebaseGoogleSignIn, signInWithAppleFirebase, signInWithEmailAndPasswordFirebase } from '../services/firebaseAuth';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  onSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onLoginSuccess, onSignup }) => {
  const { theme, colorMode } = useTheme();
  const { signInWithApple, signInWithGoogle, signInWithEmail, isSignedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    card: {
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
      borderRadius: 16,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: colorMode === 'dark' ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    hostTitle: {
      fontSize: 36,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#000000',
      letterSpacing: -1,
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
      backgroundColor: '#007AFF',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      shadowColor: '#007AFF',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
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

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithAppleFirebase();
      onLoginSuccess();
    } catch (error) {
      Alert.alert('登入失敗', 'Apple 登入時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await firebaseGoogleSignIn();
      onLoginSuccess();
    } catch (error) {
      Alert.alert('登入失敗', 'Google 登入時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('錯誤', '請輸入完整的電子郵件和密碼');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPasswordFirebase(email, password);
      onLoginSuccess();
    } catch (error) {
      Alert.alert('登入失敗', '電子郵件登入時發生錯誤');
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
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, styles.appleButton]} 
              onPress={handleAppleLogin}
              disabled={isLoading || isSignedIn}
              activeOpacity={0.7}
            >
              <Icon 
                name="apple" 
                size={20} 
                color="#FFFFFF" 
                style={styles.socialIcon}
              />
              <Text style={styles.socialText}>Log in with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.googleButton]} 
              onPress={handleGoogleLogin}
              disabled={isLoading || isSignedIn}
              activeOpacity={0.7}
            >
              <Icon 
                name="chrome" 
                size={20} 
                color="#FFFFFF" 
                style={styles.socialIcon}
              />
              <Text style={styles.socialText}>Log in with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#6B7280'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Icon 
                  name="mail" 
                  size={20} 
                  color="#007AFF" 
                  style={styles.inputIcon}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text>Forgot password?</Text>
              </TouchableOpacity>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
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
                  style={styles.inputIcon}
                >
                  <Icon 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#007AFF"
                  />
                </TouchableOpacity>
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
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account? 
              <TouchableOpacity onPress={onSignup}>
                <Text style={styles.signupLink}> Sign up for free!</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
