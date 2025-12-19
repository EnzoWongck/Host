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
  Modal,
  ScrollView,
} from 'react-native';

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
  { code: '+64', country: '紐西蘭', flag: '🇳🇿' },
  { code: '+49', country: '德國', flag: '🇩🇪' },
  { code: '+33', country: '法國', flag: '🇫🇷' },
  { code: '+39', country: '意大利', flag: '🇮🇹' },
  { code: '+34', country: '西班牙', flag: '🇪🇸' },
  { code: '+31', country: '荷蘭', flag: '🇳🇱' },
  { code: '+66', country: '泰國', flag: '🇹🇭' },
  { code: '+84', country: '越南', flag: '🇻🇳' },
  { code: '+63', country: '菲律賓', flag: '🇵🇭' },
  { code: '+62', country: '印尼', flag: '🇮🇩' },
  { code: '+91', country: '印度', flag: '🇮🇳' },
];
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface PhoneVerifyScreenProps {
  onVerified: () => void;
  onSkip?: () => void; // 可選：跳過驗證（僅用於開發）
  onLogout?: () => void; // 登出後回調
}

const PhoneVerifyScreen: React.FC<PhoneVerifyScreenProps> = ({
  onVerified,
  onSkip,
  onLogout,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { user, refreshUser, signOut } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+852');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // 獲取當前選中的國家信息
  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  const otpRefs = useRef<(TextInput | null)[]>([]);

  // 倒數計時
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
      const response = await fetch('/api/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanedPhoneNumber }),
      });

      // 檢查響應狀態
      if (!response.ok) {
        // 嘗試解析錯誤響應
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          setError(errorData.message || errorData.error || `請求失敗 (${response.status})`);
        } else {
          const text = await response.text();
          console.error('API 返回非 JSON 錯誤響應:', text.substring(0, 200));
          setError(`請求失敗 (${response.status})。請檢查 API 配置。`);
        }
        return;
      }

      // 檢查響應內容類型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 如果不是 JSON，可能是 HTML 錯誤頁面
        const text = await response.text();
        console.error('API 返回非 JSON 響應:', text.substring(0, 200));
        setError('API 服務不可用。請確保在生產環境（lunchips.com）測試，或檢查 API 路由配置。');
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON 解析失敗:', parseError);
        setError('服務器響應格式錯誤，請稍後再試');
        return;
      }

      if (response.ok && data.success) {
        setStep('otp');
        setCountdown(60);
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
      const response = await fetch('/api/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanedPhoneNumber,
          code,
          userId: user?.uid,
        }),
      });

      // 檢查響應狀態
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          setError(errorData.message || errorData.error || `請求失敗 (${response.status})`);
        } else {
          const text = await response.text();
          console.error('API 返回非 JSON 錯誤響應:', text.substring(0, 200));
          setError(`請求失敗 (${response.status})。請檢查 API 配置。`);
        }
        setOtp(['', '', '', '', '', '']);
        return;
      }

      // 檢查響應內容類型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API 返回非 JSON 響應:', text.substring(0, 200));
        setError('API 服務不可用。請確保在生產環境（lunchips.com）測試，或檢查 API 路由配置。');
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON 解析失敗:', parseError);
        setError('服務器響應格式錯誤，請稍後再試');
        return;
      }

      if (data.success) {
        // 刷新用戶資料，等待狀態更新
        console.log('OTP 驗證成功，開始刷新用戶狀態...');
        await refreshUser();
        
        // 給一點時間確保 Supabase 狀態已更新
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 再次刷新確保狀態是最新的
        await refreshUser();
        
        console.log('電話驗證成功，用戶狀態已更新，調用 onVerified');
        onVerified();
      } else {
        setError(data.message || '驗證碼錯誤');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err: any) {
      console.error('驗證 OTP 失敗:', err);
      
      // 處理 JSON 解析錯誤
      if (err.message?.includes('JSON') || err.message?.includes('Unexpected token')) {
        setError('API 服務不可用。請確保在生產環境（lunchips.com）測試，或檢查 API 路由配置。');
      } else {
        setError(err.message || '驗證失敗，請稍後再試');
      }
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

  // 處理登出
  const handleLogout = async () => {
    try {
      await signOut();
      setSettingsModalVisible(false);
      onLogout?.(); // 調用回調，返回 welcome 頁面
    } catch (error) {
      console.error('登出失敗:', error);
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
      paddingHorizontal: 16,
      lineHeight: 20,
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
    settingsButton: {
      position: 'absolute',
      top: 60,
      right: 24,
      padding: 12,
      zIndex: 1000,
      minWidth: 44,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    threeDotsContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 40,
      width: 40,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.text,
      marginVertical: 2,
    },
    settingsModalContent: {
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      minWidth: 200,
    },
    settingsModalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    settingsModalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: 'transparent',
      marginBottom: 8,
    },
    settingsModalItemText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
    },
    logoutItem: {
      borderTopWidth: 1,
      borderTopColor: colorMode === 'dark' ? '#333' : '#E5E5E5',
      marginTop: 8,
      paddingTop: 16,
    },
    logoutText: {
      color: '#EF4444',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* 3點設置按鈕 */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSettingsModalVisible(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.threeDotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </TouchableOpacity>

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
            <Text style={styles.title}>輸入驗證碼</Text>
            <Text style={styles.subtitle}>
              驗證碼已發送至{'\n'}{formatPhoneNumber(countryCode, phoneNumber)}
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

      {/* 國家/地區選擇器 Modal */}
      <Modal
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
              maxHeight: '70%',
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
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}
              >
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
                    padding: 16,
                    borderRadius: 12,
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
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    {country.flag}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: theme.colors.text,
                        fontWeight: countryCode === country.code ? '600' : '400',
                      }}
                    >
                      {country.country}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: theme.colors.textSecondary,
                    }}
                  >
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
      </Modal>

      {/* 設置 Modal */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setSettingsModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.settingsModalContent}
          >
            <Text style={styles.settingsModalTitle}>設置</Text>
            
            <TouchableOpacity
              style={[styles.settingsModalItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Text style={[styles.settingsModalItemText, styles.logoutText]}>登出</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default PhoneVerifyScreen;

