import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  Linking,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useChips } from '../context/ChipsContext';
import { useNavigation } from '@react-navigation/native';
import { useNavigationContext } from '../context/NavigationContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Icon from '../components/Icon';
import TopTabBar from '../components/TopTabBar';
import PhoneVerificationModal from '../components/PhoneVerificationModal';
import { Language } from '../types/language';

const SettingsScreen: React.FC = () => {
  const { theme, colorMode, setColorMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, isSignedIn, signInWithGoogle, signInWithEmail, signOut } = useAuth();
  const { chips, openPurchaseModal } = useChips();
  const navigation = useNavigation<any>();
  const { navigateToWelcome } = useNavigationContext();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [phoneVerificationModalVisible, setPhoneVerificationModalVisible] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(false);

  useEffect(() => {
    const loadPrivacy = async () => {
      try {
        const stored = await AsyncStorage.getItem('privacyPreferences');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.rememberLogin === 'boolean') {
            setRememberLogin(parsed.rememberLogin);
          }
          if (typeof parsed.allowAnalytics === 'boolean') {
            setAllowAnalytics(parsed.allowAnalytics);
          }
        }
      } catch (error) {
        console.warn('Failed to load privacy preferences', error);
      }
    };
    loadPrivacy();
  }, []);

  const updatePrivacy = async (next: { rememberLogin?: boolean; allowAnalytics?: boolean }) => {
    const updated = {
      rememberLogin,
      allowAnalytics,
      ...next,
    };
    setRememberLogin(updated.rememberLogin);
    setAllowAnalytics(updated.allowAnalytics);
    try {
      await AsyncStorage.setItem('privacyPreferences', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save privacy preferences', error);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setLanguageModalVisible(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      // 整體左右留白加大，讓「一般設定 / 協作 / 訂閱」區塊不要貼到螢幕邊緣
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingBottom: 80, // Space for tab bar (reduced)
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.text,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    settingLabel: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    picker: {
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : 'transparent',
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      minWidth: 120,
      borderWidth: colorMode === 'dark' ? 1 : 0,
      borderColor: theme.colors.border,
    },
    pickerText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      textAlign: 'center',
    },
    colorModeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    colorModeButton: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      alignItems: 'center',
    },
    lightModeButton: {
      backgroundColor: theme.colors.surface,
      borderColor: colorMode === 'light' ? '#4B5563' : 'transparent',
    },
    darkModeButton: {
      backgroundColor: theme.colors.surface,
      borderColor: colorMode === 'dark' ? '#FFFFFF' : 'transparent',
    },
    lightModeText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
    },
    darkModeText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
    },
    statusText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    dataManagementItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : 'transparent',
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    dataItemContent: {
      flex: 1,
    },
    dataItemTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    dataItemSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    arrow: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    aboutInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    aboutLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    aboutValue: {
      fontSize: theme.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
    },
    linksContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    link: {
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: theme.fontSize.sm,
    },
    linkSeparator: {
      color: theme.colors.border,
      marginHorizontal: theme.spacing.sm,
    },
    authCard: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    authTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    authRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    authEmailInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    authEmailInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginRight: theme.spacing.sm,
    },
    authUserLine: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    logoButton: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      padding: theme.spacing.xs,
      zIndex: 1000,
      minWidth: 80,
      minHeight: 80,
      justifyContent: 'center',
      alignItems: 'center',
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
  });

  return (
    <SafeAreaView style={styles.container}>
      <TopTabBar />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 120 }}
      >
        <View style={styles.content}>
          {/* 登入區塊 */}
          <Card padding="md">
            <Text style={styles.authTitle}>{isSignedIn ? t('settings.loggedIn') : t('settings.login')}</Text>
            {isSignedIn ? (
              <>
                <Text style={styles.authUserLine}>
                  {user?.displayName || user?.email?.split('@')[0] || '用戶'}
                  {user?.email ? ` ・ ${user.email}` : ''}
                </Text>
                <View style={styles.authRow}>
                  <Button
                    title={t('settings.logout')}
                    size="sm"
                    onPress={async () => {
                      try {
                        console.log('開始登出...');
                        // 先導航到歡迎頁，避免在登出過程中停留在設定頁
                        navigateToWelcome();
                        // 等待一下確保導航完成
                        await new Promise(resolve => setTimeout(resolve, 100));
                        // 執行登出
                        await signOut();
                        console.log('登出成功');
                        // 清除 sessionStorage
                        if (Platform.OS === 'web' && typeof window !== 'undefined') {
                          sessionStorage.removeItem('currentScreen');
                          localStorage.removeItem('supabase.auth.token');
                        }
                      } catch (error) {
                        console.error('登出失敗:', error);
                        // 即使登出失敗，也確保導航到歡迎頁
                        navigateToWelcome();
                        if (Platform.OS === 'web' && typeof window !== 'undefined') {
                          sessionStorage.removeItem('currentScreen');
                        }
                      }
                    }}
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.authRow}>
                  <Button title={t('settings.loginWithGoogle')} size="sm" onPress={signInWithGoogle} />
                </View>
                <View style={styles.authEmailInputRow}>
                  <TextInput style={styles.authEmailInput} placeholder="name@example.com" placeholderTextColor={theme.colors.textSecondary} autoCapitalize="none" keyboardType="email-address" />
                  <Button title={t('settings.loginWithEmail')} size="sm" onPress={() => signInWithEmail('name@example.com', '')} />
                </View>
              </>
            )}
          </Card>
          
          {/* Chips 區塊 */}
          {isSignedIn && (
            <>
              <Text style={styles.sectionTitle}>Chips 餘額</Text>
              <Card padding="md">
                <View style={styles.dataManagementItem}>
                  <View style={styles.dataItemContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {Platform.OS === 'web' && (
                        <Image 
                          source={{ uri: '/icons/chips3.PNG' }} 
                          style={{ width: 24, height: 24, resizeMode: 'contain' }}
                        />
                      )}
                      <Text style={[styles.dataItemTitle, { fontSize: 24, color: chips > 0 ? '#10B981' : theme.colors.error }]}>
                        {chips} Chips
                      </Text>
                    </View>
                    <Text style={styles.dataItemSubtitle}>
                      每 1 Chip 提供 12 小時牌局編輯時間
                    </Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}>
                  <Button
                    title="購買 Chips"
                    size="md"
                    variant="primary"
                    onPress={openPurchaseModal}
                  />
                </View>
              </Card>
            </>
          )}
          {/* General Settings */}
          <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
          <Card>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>{t('settings.language')}</Text>
              <TouchableOpacity 
                style={styles.picker}
                onPress={() => setLanguageModalVisible(true)}
              >
                <Text style={styles.pickerText}>
                  {language === 'zh-TW' ? t('settings.traditionalChinese') : t('settings.simplifiedChinese')}
                </Text>
              </TouchableOpacity>
            </View>
          
            <View>
              <Text style={styles.settingLabel}>{t('settings.colorMode')}</Text>
              <View style={styles.colorModeContainer}>
                <TouchableOpacity
                  style={[styles.colorModeButton, styles.lightModeButton]}
                  onPress={() => setColorMode('light')}
                >
                  <Text style={styles.lightModeText}>{t('settings.lightMode')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.colorModeButton, styles.darkModeButton]}
                  onPress={() => setColorMode('dark')}
                >
                  <Text style={styles.darkModeText}>{t('settings.darkMode')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.statusText}>
                {t('settings.currentlyUsing')}{colorMode === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
              </Text>
            </View>
          </Card>

          {/* Data Management */}
          <Text style={styles.sectionTitle}>{t('settings.dataManagement')}</Text>
          <Card padding="sm">
            <TouchableOpacity style={styles.dataManagementItem}>
              <View style={styles.dataItemContent}>
                <Text style={styles.dataItemTitle}>{t('settings.exportData')}</Text>
                <Text style={styles.dataItemSubtitle}>{t('settings.exportDataSubtitle')}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dataManagementItem}>
              <View style={styles.dataItemContent}>
                <Text style={styles.dataItemTitle}>{t('settings.backupData')}</Text>
                <Text style={styles.dataItemSubtitle}>{t('settings.backupDataSubtitle')}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Card>

          {/* Privacy & Security */}
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
          <Card padding="sm">
            <View style={styles.dataManagementItem}>
              <View style={styles.dataItemContent}>
                <Text style={styles.dataItemTitle}>{t('settings.rememberLogin')}</Text>
                <Text style={styles.dataItemSubtitle}>
                  {t('settings.rememberLoginSubtitle')}
                </Text>
              </View>
              <Switch
                value={rememberLogin}
                onValueChange={(value) => updatePrivacy({ rememberLogin: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={rememberLogin ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.dataManagementItem}>
              <View style={styles.dataItemContent}>
                <Text style={styles.dataItemTitle}>{t('settings.allowAnalytics')}</Text>
                <Text style={styles.dataItemSubtitle}>
                  {t('settings.allowAnalyticsSubtitle')}
                </Text>
              </View>
              <Switch
                value={allowAnalytics}
                onValueChange={(value) => updatePrivacy({ allowAnalytics: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={allowAnalytics ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <TouchableOpacity
              style={styles.dataManagementItem}
              onPress={async () => {
                try {
                  await AsyncStorage.clear();
                  console.log('Local data cleared by user');
                } catch (error) {
                  console.warn('Failed to clear local data', error);
                }
              }}
            >
              <View style={styles.dataItemContent}>
                <Text style={[styles.dataItemTitle, { color: theme.colors.error }]}>
                  {t('settings.clearLocalData')}
                </Text>
                <Text style={styles.dataItemSubtitle}>
                  {t('settings.clearLocalDataSubtitle')}
                </Text>
              </View>
              <Text style={[styles.arrow, { color: theme.colors.error }]}>↺</Text>
            </TouchableOpacity>
          </Card>

          {/* 通知設定已移除 */}

          {/* About */}
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <Card>
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutLabel}>{t('settings.version')}</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutLabel}>{t('settings.developer')}</Text>
              <Text style={styles.aboutValue}>Poker Host Team</Text>
            </View>
            
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutLabel}>{t('settings.lastUpdate')}</Text>
              <Text style={styles.aboutValue}>2025/01/09</Text>
            </View>

            <View style={styles.linksContainer}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://lunchips.com/privacy').catch(() => {})}
              >
                <Text style={styles.link}>{t('settings.privacyPolicy')}</Text>
              </TouchableOpacity>
              <Text style={styles.linkSeparator}>|</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://lunchips.com/terms').catch(() => {})}
              >
                <Text style={styles.link}>{t('settings.termsOfService')}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>

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
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              minWidth: 200,
            }}
          >
            <Text style={{ fontSize: theme.fontSize.lg, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.md }}>
              {t('settings.language')}
            </Text>
            <TouchableOpacity
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: language === 'zh-TW' ? theme.colors.primary + '20' : 'transparent',
                marginBottom: theme.spacing.sm,
              }}
              onPress={() => handleLanguageSelect('zh-TW')}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>{t('settings.traditionalChinese')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: language === 'zh-CN' ? theme.colors.primary + '20' : 'transparent',
              }}
              onPress={() => handleLanguageSelect('zh-CN')}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: language === 'zh-CN' ? '700' : '400' }}>{t('settings.simplifiedChinese')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 電話驗證 Modal */}
      <PhoneVerificationModal
        visible={phoneVerificationModalVisible}
        onClose={() => setPhoneVerificationModalVisible(false)}
        onVerified={(phoneNumber) => {
          console.log('電話驗證成功:', phoneNumber);
          // 這裡可以添加成功提示
        }}
        mode="bind"
      />

    </SafeAreaView>
  );
};

export default SettingsScreen;
