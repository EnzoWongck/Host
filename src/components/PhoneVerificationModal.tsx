import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface PhoneVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified?: (phoneNumber: string) => void;
  mode?: 'login' | 'bind'; // login = 用手機登入, bind = 綁定電話
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  visible,
  onClose,
  onVerified,
  mode = 'bind',
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+852'); // 預設香港
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

  // 重置狀態
  useEffect(() => {
    if (visible) {
      setStep('phone');
      setPhoneNumber('');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setCountdown(0);
    }
  }, [visible]);

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
        setCountdown(60); // 60 秒後可重發
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
        onVerified?.(fullPhoneNumber);
        onClose();
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

    // 自動跳到下一個輸入框
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // 自動驗證
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
      padding: theme.spacing.md,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    phoneInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    countryCodeButton: {
      backgroundColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginRight: theme.spacing.sm,
    },
    countryCodeText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    phoneInput: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.colors.text,
    },
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: theme.spacing.lg,
    },
    otpInput: {
      width: 45,
      height: 55,
      backgroundColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
      borderRadius: 12,
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#0891B2',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    resendButton: {
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    resendText: {
      color: countdown > 0 ? theme.colors.textSecondary : '#0891B2',
      fontSize: 14,
    },
    error: {
      color: '#EF4444',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    backButton: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    backText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
  });

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={mode === 'login' ? '手機登入' : '綁定電話'}
      maxWidth={400}
    >
      <View style={styles.container}>
        {step === 'phone' ? (
          <>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? '輸入您的手機號碼，我們將發送驗證碼'
                : '綁定手機號碼以提高帳戶安全性'}
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
            <Text style={styles.subtitle}>
              驗證碼已發送至 {fullPhoneNumber}
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
      </View>
    </Modal>
  );
};

export default PhoneVerificationModal;

