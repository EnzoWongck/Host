import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface PhoneVerifyScreenProps {
  onVerified: () => void;
  onSkip?: () => void; // 可選：跳過驗證（僅用於開發）
}

const PhoneVerifyScreen: React.FC<PhoneVerifyScreenProps> = ({
  onVerified,
  onSkip,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+852');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(TextInput | null)[]>([]);

  // 倒數計時
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  // 發送 OTP
  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('請輸入電話號碼');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('otp');
        setCountdown(60);
      } else {
        setError(data.message || '發送驗證碼失敗');
      }
    } catch (err) {
      console.error('發送 OTP 失敗:', err);
      setError('發送驗證碼失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 驗證 OTP
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('請輸入 6 位驗證碼');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          code,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 刷新用戶資料
        await refreshUser();
        onVerified();
      } else {
        setError(data.message || '驗證碼錯誤');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      console.error('驗證 OTP 失敗:', err);
      setError('驗證失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // OTP 輸入處理
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      setTimeout(() => handleVerifyOtp(), 100);
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#121212' : '#FFFFFF',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
      lineHeight: 24,
    },
    phoneInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      width: '100%',
      maxWidth: 340,
    },
    countryCodeButton: {
      backgroundColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginRight: 12,
    },
    countryCodeText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    phoneInput: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: 18,
      color: theme.colors.text,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 24,
    },
    otpInput: {
      width: 48,
      height: 60,
      backgroundColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
      borderRadius: 12,
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#0891B2',
      paddingVertical: 18,
      paddingHorizontal: 48,
      borderRadius: 12,
      alignItems: 'center',
      width: '100%',
      maxWidth: 340,
      marginBottom: 16,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    resendButton: {
      alignItems: 'center',
      marginTop: 12,
    },
    resendText: {
      color: countdown > 0 ? theme.colors.textSecondary : '#0891B2',
      fontSize: 16,
    },
    error: {
      color: '#EF4444',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
    },
    backButton: {
      alignItems: 'center',
      marginTop: 16,
    },
    backText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
    },
    skipButton: {
      position: 'absolute',
      top: 60,
      right: 24,
    },
    skipText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {onSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>跳過 →</Text>
        </TouchableOpacity>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {step === 'phone' ? (
          <>
            <Text style={styles.title}>驗證您的電話號碼</Text>
            <Text style={styles.subtitle}>
              為了帳戶安全，請綁定您的手機號碼{'\n'}我們將發送驗證碼到您的手機
            </Text>

            <View style={styles.phoneInputRow}>
              <TouchableOpacity style={styles.countryCodeButton}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="電話號碼"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
                autoFocus
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>發送驗證碼</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>輸入驗證碼</Text>
            <Text style={styles.subtitle}>
              驗證碼已發送至{'\n'}{fullPhoneNumber}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => (otpRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={value => handleOtpChange(value, index)}
                  onKeyPress={e => handleOtpKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>驗證</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendOtp}
              disabled={countdown > 0 || loading}
            >
              <Text style={styles.resendText}>
                {countdown > 0 ? `${countdown} 秒後可重新發送` : '重新發送驗證碼'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep('phone')}
            >
              <Text style={styles.backText}>← 返回修改號碼</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneVerifyScreen;

