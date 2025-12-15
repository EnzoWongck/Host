import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { auth, firebaseConfig } from '../config/firebase';
import {
  PhoneAuthProvider,
  signInWithCredential,
  linkWithCredential,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import Modal from '../components/Modal';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

interface PhoneVerifyScreenProps {
  onVerified: () => void;
  isLoginMode?: boolean; // 是否為電話號碼登入模式（而非綁定模式）
}

// 電話驗證畫面：支援兩種模式
// 1. 綁定模式：已有 Google/Email 帳戶，需要綁定電話號碼
// 2. 登入模式：使用電話號碼登入（新帳戶或已有電話的帳戶）
const PhoneVerifyScreen: React.FC<PhoneVerifyScreenProps> = ({ onVerified, isLoginMode = false }) => {
  const { theme, colorMode } = useTheme();
  const { t, language } = useLanguage();

  // 根據用戶語言設定 Firebase Auth 語言代碼
  useEffect(() => {
    if (Platform.OS === 'web') {
      const firebaseLangCode = language === 'zh-CN' ? 'zh-CN' : 'zh-TW';
      auth.languageCode = firebaseLangCode;
    }
  }, [language]);

  const [countryCode, setCountryCode] = useState('852'); // 預設香港
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'enterPhone' | 'enterCode'>('enterPhone');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('錯誤');

  // Web 平台使用原生 RecaptchaVerifier，非 Web 平台使用 FirebaseRecaptchaVerifierModal
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal | RecaptchaVerifier | null>(null);

  // 這行超重要！讓 Web 版每次 render 都重新建立
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // 確保容器存在
      let container = document.getElementById('recaptcha-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.visibility = 'hidden';
        if (document.body) {
          document.body.appendChild(container);
        }
      }

      // 強制清掉舊的，防止重複
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          // 忽略清理錯誤
        }
      }

      // 清空容器內容
      if (container) {
        container.innerHTML = '';
      }

      // 創建新的 RecaptchaVerifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
            } catch (e) {
              // 忽略清理錯誤
            }
            window.recaptchaVerifier = undefined;
          }
        },
      });

      recaptchaVerifier.current = window.recaptchaVerifier;

      return () => {
        // 清理 reCAPTCHA 驗證器
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
          } catch (e) {
            // 忽略清理錯誤
          }
          window.recaptchaVerifier = undefined;
        }
        recaptchaVerifier.current = null;
      };
    }
  }, []);

  // 倒數計時：控制「重新發送驗證碼」
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendVerificationCode = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('暫不支援', '目前電話簡訊驗證僅在 Web 版啟用，行動裝置版本稍後會加入。');
      return;
    }

    const trimmedCountryCode = countryCode.trim().replace(/[^\d]/g, '');
    const trimmedPhone = phoneNumber.trim().replace(/[^\d]/g, '');
    
    if (!trimmedCountryCode) {
      Alert.alert('提示', '請先輸入國碼');
      return;
    }

    if (!trimmedPhone) {
      Alert.alert('提示', '請先輸入電話號碼');
      return;
    }

    // 組合完整電話號碼：+國碼+電話號碼
    const fullPhoneNumber = `+${trimmedCountryCode}${trimmedPhone}`;

    // 驗證完整電話號碼格式
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(fullPhoneNumber)) {
      Alert.alert(
        '電話號碼格式錯誤',
        '請檢查國碼和電話號碼是否正確。\n\n' +
        '範例：\n' +
        '國碼：852，電話：91234567（香港）\n' +
        '國碼：886，電話：912345678（台灣）\n' +
        '國碼：86，電話：13800138000（中國）'
      );
      return;
    }

    // 檢查電話號碼長度（至少 10 位數字，包括國碼）
    const digitsOnly = fullPhoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      Alert.alert('電話號碼太短', '電話號碼（含國碼）至少需要 10 位數字。');
      return;
    }

    try {
      setIsSending(true);
      console.log('開始發送驗證碼，完整電話號碼：', fullPhoneNumber);

      let verifier: RecaptchaVerifier | FirebaseRecaptchaVerifierModal;

      if (Platform.OS === 'web') {
        // Web 版一定要用 window 裡的那顆
        if (!window.recaptchaVerifier) {
          throw new Error('reCAPTCHA 驗證器未初始化，請重新整理頁面');
        }
        verifier = window.recaptchaVerifier;
      } else {
        // 非 Web 平台：使用 FirebaseRecaptchaVerifierModal
        if (!recaptchaVerifier.current) {
          throw new Error('reCAPTCHA 驗證器未初始化');
        }
        verifier = recaptchaVerifier.current as FirebaseRecaptchaVerifierModal;
      }

      // 關鍵：這行一定要寫在按鈕事件裡面，不能寫在 useEffect！
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        fullPhoneNumber, // 使用組合後的完整電話號碼（+國碼+電話）
        verifier // ← 這行會自動觸發 invisible reCAPTCHA
      );

      setVerificationId(verificationId);
      setStep('enterCode');
      setResendCooldown(60); // 60 秒冷卻
      Alert.alert('已發送驗證碼', '簡訊驗證碼已發送到你的電話，請在 1–2 分鐘內查收。');
    } catch (err: any) {
      console.error('發送電話驗證碼失敗', err);

      if (err?.code === 'auth/invalid-app-credential') {
        // 應用程式憑證無效
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
        setErrorTitle('應用程式憑證錯誤');
        setErrorMessage(
          `無法驗證應用程式憑證。\n\n` +
          `當前網域：${currentDomain}\n\n` +
          `可能的原因：\n\n` +
          `1. API Key 限制問題\n` +
          `   - 檢查 Google Cloud Console 中的 API Key 設定\n` +
          `   - 確保 HTTP 引用者限制包含 "http://localhost:*"\n\n` +
          `2. Identity Toolkit API 未啟用\n` +
          `   - 在 Google Cloud Console 中啟用 Identity Toolkit API\n\n` +
          `3. 授權網域設定\n` +
          `   - 在 Firebase Console 中添加當前網域到授權網域列表\n\n` +
          `4. 等待設定生效（2-5 分鐘）\n\n` +
          `請檢查 Firebase 專案設定後，重新整理頁面再試。`
        );
        setErrorModalVisible(true);
        
        // 清理 reCAPTCHA 驗證器
        if (recaptchaVerifier.current && 'clear' in recaptchaVerifier.current) {
          try {
            (recaptchaVerifier.current as RecaptchaVerifier).clear();
            recaptchaVerifier.current = null;
          } catch (e) {
            // 忽略清理錯誤
          }
        }
        // 清空容器
        if (recaptchaContainerRef.current) {
          recaptchaContainerRef.current.innerHTML = '';
        }
      } else if (err?.code === 'auth/billing-not-enabled') {
        Alert.alert(
          '電話驗證功能未啟用',
          'Firebase 專案尚未啟用計費功能，無法使用電話驗證。\n\n' +
          '選項：\n' +
          '1. 在 Firebase Console 中啟用計費功能以使用電話驗證\n' +
          '2. 點擊「跳過驗證」直接進入應用（開發階段）',
          [
            {
              text: '跳過驗證',
              onPress: () => {
                Alert.alert(
                  '跳過電話驗證',
                  '您將跳過電話驗證直接進入應用。',
                  [
                    { text: '取消', style: 'cancel' },
                    {
                      text: '確定',
                      onPress: () => onVerified(),
                    },
                  ]
                );
              },
            },
            { text: '取消', style: 'cancel' },
          ]
        );
      } else if (err?.code === 'auth/invalid-phone-number') {
        Alert.alert(
          '電話號碼格式錯誤',
          '請檢查國碼和電話號碼是否正確。\n\n' +
          '範例：\n' +
          '國碼：852，電話：91234567（香港）\n' +
          '國碼：886，電話：912345678（台灣）\n' +
          '國碼：86，電話：13800138000（中國）'
        );
      } else if (err?.code === 'auth/phone-number-already-exists') {
        Alert.alert('電話號碼已被使用', '此電話號碼已被其他帳戶使用，請使用其他電話號碼或使用該電話號碼登入。');
      } else if (err?.code === 'auth/too-many-requests') {
        setResendCooldown(300); // 5 分鐘冷卻
        Alert.alert(
          '請求過於頻繁',
          '為了防止濫用，Firebase 限制了驗證碼請求頻率。\n\n' +
          '請等待 5 分鐘後再試，或使用其他電話號碼。'
        );
      } else {
        Alert.alert('發送失敗', err?.message || '無法發送驗證碼，請稍後再試。');
      }
    } finally {
      setIsSending(false);
    }
  };

  const confirmCode = async () => {
    if (!code.trim()) {
      Alert.alert('提示', '請輸入簡訊中的 6 位數驗證碼');
      return;
    }

    if (!verificationId) {
      Alert.alert('錯誤', '驗證流程尚未啟動，請先取得驗證碼');
      return;
    }

    try {
      setIsVerifying(true);

      // 使用 PhoneAuthProvider.credential 創建憑證
      const credential = PhoneAuthProvider.credential(verificationId, code.trim());

      if (isLoginMode) {
        // 電話號碼登入模式
        await signInWithCredential(auth, credential);
        Alert.alert('成功', '電話驗證完成！');
        onVerified();
      } else {
        // 綁定電話號碼模式（已有 Google/Email 帳戶）
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert('錯誤', '尚未登入，請先使用 Google 或電郵登入。');
          setIsVerifying(false);
          return;
        }
        await linkWithCredential(currentUser, credential);
        Alert.alert('成功', '電話驗證完成！');
        onVerified();
      }
    } catch (err: any) {
      console.error('電話驗證失敗', err);
      console.error('錯誤代碼：', err?.code);
      console.error('錯誤訊息：', err?.message);
      
      if (err?.code === 'auth/provider-already-linked') {
        Alert.alert('已完成電話驗證', '此帳號已綁定電話號碼，將直接進入主畫面。');
        onVerified();
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        // 該電話號碼已被其他帳戶使用
        console.log('檢測到電話號碼已被其他帳戶使用');
        setErrorTitle('電話號碼已被使用');
        setErrorMessage('該電話號碼已經被另一個帳戶使用。\n\n請使用其他電話號碼，或使用該電話號碼登入對應的帳戶。');
        setErrorModalVisible(true);
      } else if (err?.code === 'auth/invalid-verification-code') {
        Alert.alert('驗證碼錯誤', '驗證碼不正確，請重新輸入。');
      } else {
        Alert.alert('驗證失敗', err?.message || '驗證碼不正確或已失效，請再試一次。');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorMode === 'dark' ? '#050509' : '#F8FAFC',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colorMode === 'dark' ? '#111827' : '#FFFFFF',
      borderRadius: 24,
      padding: theme.spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: colorMode === 'dark' ? 0.5 : 0.15,
      shadowRadius: 25,
      elevation: 12,
      borderWidth: colorMode === 'dark' ? 1 : 0,
      borderColor: colorMode === 'dark' ? '#1F2933' : 'transparent',
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#0F172A',
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#9CA3AF' : '#64748B',
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    fieldLabel: {
      fontSize: theme.fontSize.sm,
      fontWeight: '500',
      color: colorMode === 'dark' ? '#E5E7EB' : '#0F172A',
      marginBottom: theme.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#374151' : '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: colorMode === 'dark' ? '#FFFFFF' : '#0F172A',
      backgroundColor: colorMode === 'dark' ? '#111827' : '#F9FAFB',
      marginBottom: theme.spacing.lg,
    },
    button: {
      backgroundColor: '#0F766E',
      borderRadius: 999,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
      shadowColor: '#0F766E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    tipText: {
      fontSize: theme.fontSize.xs,
      color: colorMode === 'dark' ? '#9CA3AF' : '#6B7280',
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
    resendButtonText: {
      fontSize: theme.fontSize.xs,
      color: '#0F766E',
      fontWeight: '600',
      marginTop: theme.spacing.sm,
      textAlign: 'center',
      opacity: 0.9,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Web 一定要有這個 div，而且要放在最上面！ */}
      {Platform.OS === 'web' && typeof document !== 'undefined' && (
        <div id="recaptcha-container" style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} />
      )}

      {/* 非 Web 平台使用 FirebaseRecaptchaVerifierModal */}
      {Platform.OS !== 'web' && (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier as React.RefObject<FirebaseRecaptchaVerifierModal>}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification={true}
        />
      )}

      <KeyboardAvoidingView
        style={{ width: '100%', alignItems: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            {isLoginMode ? '電話號碼登入' : '電話號碼驗證'}
          </Text>
          <Text style={styles.subtitle}>
            {isLoginMode
              ? '使用電話號碼登入您的帳戶，或創建新帳戶。'
              : '為了保障帳號安全，完成 Google / 電郵登入後，需先通過電話驗證才能使用所有功能。'}
          </Text>

          {step === 'enterPhone' && (
            <>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
                <View style={{ flex: 0.3 }}>
                  <Text style={styles.fieldLabel}>國碼</Text>
                  <TextInput
                    style={[styles.input, { marginBottom: 0 }]}
                    value={countryCode}
                    onChangeText={(text) => {
                      // 只允許數字
                      const cleaned = text.replace(/[^\d]/g, '');
                      setCountryCode(cleaned);
                    }}
                    placeholder="852"
                    placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#9CA3AF'}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={{ flex: 0.7 }}>
                  <Text style={styles.fieldLabel}>電話號碼</Text>
                  <TextInput
                    style={[styles.input, { marginBottom: 0 }]}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      // 只允許數字
                      const cleaned = text.replace(/[^\d]/g, '');
                      setPhoneNumber(cleaned);
                    }}
                    placeholder="91234567"
                    placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#9CA3AF'}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                </View>
              </View>
              <Text style={[styles.tipText, { marginBottom: theme.spacing.md, textAlign: 'left' }]}>
                範例：國碼 852，電話 91234567（香港）
              </Text>
              <TouchableOpacity
                style={[styles.button, isSending && styles.buttonDisabled]}
                onPress={sendVerificationCode}
                disabled={isSending}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>{isSending ? '發送中…' : '發送驗證碼'}</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'enterCode' && (
            <>
              <Text style={styles.fieldLabel}>輸入簡訊中的 6 位數驗證碼</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="／／／／／／"
                placeholderTextColor={colorMode === 'dark' ? '#6B7280' : '#9CA3AF'}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={[styles.button, isVerifying && styles.buttonDisabled]}
                onPress={confirmCode}
                disabled={isVerifying}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>{isVerifying ? '驗證中…' : '確認並繼續'}</Text>
              </TouchableOpacity>
              <Text style={styles.tipText}>
                沒收到驗證碼？請檢查電話號碼是否正確，或稍候再試。
              </Text>
              {/* 冷卻後才可重新發送驗證碼 */}
              <TouchableOpacity
                activeOpacity={resendCooldown === 0 ? 0.8 : 1}
                onPress={() => {
                  if (resendCooldown === 0 && !isSending) {
                    // 回到輸入電話步驟，讓使用者可確認 / 修改電話再重新發送
                    setStep('enterPhone');
                    setVerificationId('');
                    setCode('');
                  }
                }}
              >
                <Text style={[styles.resendButtonText, resendCooldown > 0 && { opacity: 0.5 }]}>
                  {resendCooldown > 0
                    ? `重新發送驗證碼（${resendCooldown} 秒後可再次發送）`
                    : '重新發送驗證碼'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* 錯誤訊息 Modal */}
      <Modal
        visible={errorModalVisible}
        onClose={() => {
          setErrorModalVisible(false);
          setErrorMessage('');
          setErrorTitle('錯誤');
        }}
        title={errorTitle}
      >
        <View style={{ paddingVertical: theme.spacing.md }}>
          <Text
            style={{
              fontSize: theme.fontSize.md,
              color: colorMode === 'dark' ? '#FFFFFF' : '#0F172A',
              lineHeight: 24,
              marginBottom: theme.spacing.lg,
            }}
          >
            {errorMessage}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: colorMode === 'dark' ? '#374151' : '#E5E7EB',
              }}
              onPress={() => {
                setErrorModalVisible(false);
                setErrorMessage('');
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  color: colorMode === 'dark' ? '#FFFFFF' : '#0F172A',
                  fontWeight: '500',
                }}
              >
                確定
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.primary,
              }}
              onPress={() => {
                // 回到輸入電話步驟
                setStep('enterPhone');
                setVerificationId('');
                setCode('');
                setPhoneNumber('');
                setErrorModalVisible(false);
                setErrorMessage('');
              }}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.md,
                  color: '#FFFFFF',
                  fontWeight: '500',
                }}
              >
                重新輸入
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PhoneVerifyScreen;
