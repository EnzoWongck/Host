import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { Language } from '../types/language';
import { resolveImageSource } from '../utils/imageUtils';
// 靜態導入圖片
import BackgroundImage from '../../assets/icons/background.jpg';
import WelcomeIconImage from '../../assets/icons/welcomeicon.png';
import SpaceIconImage from '../../assets/icons/space.1.png';
import SpadeIconImage from '../../assets/icons/spade.1.png';
import HeartIconImage from '../../assets/icons/heart.1.png';
import ChangeIconImage from '../../assets/icons/change.png';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const { theme, colorMode, toggleColorMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // 檢測是否為手機設備（通過屏幕寬度判斷）
  const isMobile = useMemo(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.innerWidth < 768; // 小於 768px 視為手機
    }
    return Platform.OS !== 'web';
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    backgroundImage: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑色遮罩，淡化背景
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center', // 讓中間區塊（Logo + LunChips + 文字）垂直置中
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: isMobile ? theme.spacing.xl * 4 : theme.spacing.xl * 3, // 手機版增加 paddingTop，向下移動
      paddingBottom: isMobile ? theme.spacing.xl * 2 : theme.spacing.xl * 3,
      minHeight: isMobile ? undefined : '100%', // 電腦版確保最小高度
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: isMobile ? theme.spacing.md : theme.spacing.xl,
      marginTop: isMobile ? theme.spacing.xl * 2 : 0, // 手機版 logo 向上移動
    },
    logoImage: {
      width: isMobile ? 140 : 280, // 電腦版稍微縮小
      height: isMobile ? 140 : 280,
      marginBottom: theme.spacing.xs, // 減少與文字的距離
      marginTop: isMobile ? 0 : theme.spacing.xl,
    },
    hostTitle: {
      fontSize: isMobile ? 46 : 50, // 手機版：LunChips 放大
      fontWeight: '700',
      fontFamily: Platform.OS === 'web' ? 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif' : 'Satoshi',
      color: '#FFFFFF', // 兩種模式都固定白色
      letterSpacing: -1,
      marginTop: isMobile ? theme.spacing.xl * 3 : theme.spacing.xl * 1.5, // 手機版 LunChips、三行文字、按鈕一起下移
    },
    subtitle: {
      fontSize: theme.fontSize.lg,
      color: '#9CA3AF', // 灰色，兩種模式一致
      textAlign: 'center',
      marginTop: theme.spacing.md, // 回復之前位置
      marginBottom: theme.spacing.xl,
      lineHeight: 26,
      paddingHorizontal: theme.spacing.lg,
      fontWeight: '400',
    },
    featureList: {
      width: '100%',
      maxWidth: 400,
      marginBottom: isMobile ? theme.spacing.lg : theme.spacing.xl, // 手機版：與按鈕之間距離縮小
      paddingHorizontal: theme.spacing.lg,
      marginTop: isMobile ? theme.spacing.xs : theme.spacing.md, // 回復之前位置
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm, // 三行文字之間的間距縮小
      justifyContent: 'center',
    },
    featureIcon: {
      width: 28,
      height: 28,
      marginRight: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureIconImage: {
      width: 28,
      height: 28,
      resizeMode: 'contain',
    },
    featureText: {
      fontSize: theme.fontSize.md,
      color: '#9CA3AF', // 灰色，兩種模式一致
      fontWeight: '500',
      textAlign: 'left',
      lineHeight: theme.fontSize.md * 1.2, // 行距略小，讓三行說明更緊湊
    },
    buttonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingHorizontal: theme.spacing.md,
    },
    getStartedButton: {
      backgroundColor: '#FFFFFF', // 「免費試用」按鈕背景固定白色
      paddingVertical: theme.spacing.md + 4,
      paddingHorizontal: theme.spacing.xl + 8,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    getStartedText: {
      color: '#000000', // 黑色文字
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
    },
    bottomLinks: {
      alignItems: 'center',
    },
    privacyText: {
      fontSize: theme.fontSize.sm,
      color: colorMode === 'dark' ? '#6B7280' : '#6B7280',
    },
    settingsButton: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      padding: theme.spacing.sm,
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
      backgroundColor: '#FFFFFF', // 白色點，在淡化背景上更清晰可見
      marginVertical: 2,
    },
  });

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
  };

  const handleColorModeToggle = () => {
    toggleColorMode();
  };

  // 獲取背景圖片源
  // 在開發模式下直接使用靜態導入，在生產構建中使用構建後的路徑
  const backgroundImage = BackgroundImage;
  const backgroundImageSource = Platform.OS === 'web' 
    ? (() => {
        // 檢查是否為開發模式（通過檢查 URL 是否包含 localhost、127.0.0.1 或 IP 地址）
        const isDev = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' ||
          /^192\.168\./.test(window.location.hostname) || // 本地 IP 地址（手機訪問時）
          window.location.search.includes('dev=true')
        );
        
        if (isDev) {
          // 開發模式：直接使用 require 的結果，Expo 會自動處理
          return backgroundImage;
        } else {
          // 生產模式：使用構建後的靜態路徑
          // 確保路徑正確，使用絕對路徑
          const imagePath = '/assets/assets/icons/background.9fe3e57bd1f14f038a9bb47d1977bc67.jpg';
          console.log('Welcome 背景圖片路徑（生產環境）:', imagePath);
          return { uri: imagePath };
        }
      })()
    : backgroundImage;

  // 在 Web 上添加調試信息
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Welcome 背景圖片源:', backgroundImageSource);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={backgroundImageSource}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={(error) => {
          console.error('背景圖片加載失敗:', error);
        }}
      >
        <View style={styles.overlay}>
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
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEnabled={!isMobile} // 只在電腦版啟用滾動
          >
            <View style={styles.logoContainer}>
              <Image 
                // 使用自訂的歡迎頁圖示（welcomeicon.png）
                source={WelcomeIconImage}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.hostTitle}>LunChips</Text>
            </View>

            {/* 特色說明列表 */}
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Image 
                    source={SpaceIconImage} 
                    style={styles.featureIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.featureText}>{t('welcome.feature1')}</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Image 
                    source={SpadeIconImage} 
                    style={styles.featureIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.featureText}>{t('welcome.feature2')}</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Image 
                    source={HeartIconImage} 
                    style={styles.featureIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.featureText}>{t('welcome.feature3')}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.getStartedButton}
                onPress={onGetStarted}
                activeOpacity={0.8}
              >
                <Text style={styles.getStartedText}>{t('welcome.getStarted')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomLinks}>
              <Text style={styles.privacyText}>{t('welcome.privacy')}</Text>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>

      {/* Settings Modal */}
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
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              minWidth: 200,
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: 'transparent',
                marginBottom: theme.spacing.sm,
              }}
              onPress={() => {
                handleLanguageSelect(language === 'zh-TW' ? 'zh-CN' : 'zh-TW');
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
                {language === 'zh-TW' ? '繁體中文' : '简体中文'}
              </Text>
              <Image
                source={ChangeIconImage}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                handleColorModeToggle();
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md }}>
                {colorMode === 'light' ? '淺色模式' : '深色模式'}
              </Text>
              <Image
                source={ChangeIconImage}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
