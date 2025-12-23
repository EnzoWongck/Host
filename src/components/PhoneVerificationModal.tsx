import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal as RNModal,
  ScrollView,
} from 'react-native';
import Modal from './Modal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

// 獲取 API base URL
const getApiBaseUrl = (): string => {
  if (Platform.OS !== 'web') return '';
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname;
  // 在 localhost 時，使用生產環境的 API（因為 Expo 開發服務器不支持 API 路由）
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return 'https://lunchips.com';
  }
  return ''; // 生產環境使用相對路徑（同域名）
};

// 常用國家/地區代碼
const COUNTRY_CODES = [
  { code: '+852', country: '香港', flag: '🇭🇰' },
  { code: '+86', country: '中國', flag: '🇨🇳' },
  { code: '+886', country: '台灣', flag: '🇹🇼' },
  { code: '+853', country: '澳門', flag: '🇲🇴' },
  { code: '+65', country: '新加坡', flag: '🇸🇬' },
  { code: '+60', country: '馬來西亞', flag: '🇲🇾' },
  { code: '+81', country: '日本', flag: '🇯🇵' },
  { code: '+82', country: '韓國', flag: '🇰🇷' },
  { code: '+1', country: '美國/加拿大', flag: '🇺🇸' },
  { code: '+44', country: '英國', flag: '🇬🇧' },
  { code: '+61', country: '澳洲', flag: '🇦🇺' },
  { code: '+66', country: '泰國', flag: '🇹🇭' },
  { code: '+84', country: '越南', flag: '🇻🇳' },
  { code: '+91', country: '印度', flag: '🇮🇳' },
];

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
  const [countryCode, setCountryCode] = useState('+852');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

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

  // 清理並格式化電話號碼為 E.164 格式
  const formatPhoneNumber = (code: string, number: string): string => {
    // 移除所有非數字字符（保留開頭的 +）
    const cleanedNumber = number.replace(/\D/g, '');
    // 組合國家代碼和號碼，確保格式為 +國家代碼號碼
    return `${code}${cleanedNumber}`;
  };

  // 發送 OTP
  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setError('請輸入電話號碼');
      return;
    }

    // 清理並格式化電話號碼
    const cleanedPhoneNumber = formatPhoneNumber(countryCode, phoneNumber);
    
    // 驗證電話號碼格式（E.164 格式：+國家代碼+號碼，總長度至少 10 位）
    if (cleanedPhoneNumber.length < 10 || !cleanedPhoneNumber.startsWith('+')) {
      setError('電話號碼格式不正確，請檢查後重試');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('發送 OTP 到:', cleanedPhoneNumber);
      const apiBaseUrl = getApiBaseUrl();
      const apiUrl = `${apiBaseUrl}/api/phone/send-otp`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanedPhoneNumber }),
      });

      // 檢查響應內容類型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 如果不是 JSON，可能是 HTML 錯誤頁面
        const text = await response.text();
        console.error('API 返回非 JSON 響應:', text.substring(0, 200));
        setError('API 服務不可用。請確保在生產環境（lunchips.com）測試，或檢查 API 路由配置。');
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('otp');
        setCountdown(60); // 60 秒後可重發
      } else {
        // 顯示詳細錯誤訊息
        const errorMsg = data.message || data.error || '發送驗證碼失敗';
        setError(errorMsg);
        
        // 如果是 Free Trial 限制，顯示額外提示
        if (errorMsg.includes('Free Trial') || errorMsg.includes('未在 Twilio 驗證')) {
          console.warn('Twilio Free Trial 限制：只能發送到已驗證的號碼');
        }
      }
    } catch (err: any) {
      console.error('發送 OTP 失敗:', err);
      
      // 處理 JSON 解析錯誤
      if (err.message?.includes('JSON') || err.message?.includes('Unexpected token')) {
        setError('API 服務不可用。請確保在生產環境（lunchips.com）測試，或檢查 API 路由配置。');
      } else {
        setError(err.message || '發送驗證碼失敗，請稍後再試');
      }
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

    // 清理並格式化電話號碼
    const cleanedPhoneNumber = formatPhoneNumber(countryCode, phoneNumber);

    setLoading(true);
    setError('');

    try {
      const apiBaseUrl = getApiBaseUrl();
      const apiUrl = `${apiBaseUrl}/api/phone/verify-otp`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanedPhoneNumber,
          code,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onVerified?.(cleanedPhoneNumber);
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
      paddingHorizontal: theme.spacing.md,
      lineHeight: 20,
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
              <TouchableOpacity 
                style={styles.countryCodeButton}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.countryCodeText}>
                  {selectedCountry.flag} {countryCode}
                </Text>
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
              驗證碼已發送至 {formatPhoneNumber(countryCode, phoneNumber)}
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

      {/* 國家/地區選擇器 */}
      <RNModal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View
            style={{
              backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '60%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colorMode === 'dark' ? '#333' : '#E5E5E5',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.text }}>
                選擇國家/地區
              </Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Text style={{ fontSize: 16, color: '#0891B2' }}>完成</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 8 }}>
              {COUNTRY_CODES.map(country => (
                <TouchableOpacity
                  key={country.code}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    borderRadius: 10,
                    backgroundColor:
                      countryCode === country.code
                        ? colorMode === 'dark'
                          ? 'rgba(8, 145, 178, 0.3)'
                          : 'rgba(8, 145, 178, 0.1)'
                        : 'transparent',
                  }}
                  onPress={() => {
                    setCountryCode(country.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 10 }}>{country.flag}</Text>
                  <Text style={{ flex: 1, fontSize: 15, color: theme.colors.text }}>
                    {country.country}
                  </Text>
                  <Text style={{ fontSize: 15, color: theme.colors.textSecondary }}>
                    {country.code}
                  </Text>
                  {countryCode === country.code && (
                    <Text style={{ marginLeft: 8, color: '#0891B2' }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </RNModal>
    </Modal>
  );
};

export default PhoneVerificationModal;

