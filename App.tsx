import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Context
import { GameProvider } from './src/context/GameContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ToastProvider } from './src/context/ToastContext';
import { CollaborationProvider } from './src/context/CollaborationContext';

// Utils
import { getFontFamily, getFontWeight } from './src/utils/fonts';

// Config
import { SKIP_AUTH_ON_WEB } from './src/config/dev';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Components
import TabBarIcon from './src/components/TabBarIcon';
import DoubleTabBar from './src/components/DoubleTabBar';

// Types
import { RootTabParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

// 主要應用導航邏輯
const AppNavigator: React.FC = () => {
  const isWeb = Platform.OS === 'web';
  // 根據配置決定是否跳過登入
  const shouldSkipAuth = isWeb && SKIP_AUTH_ON_WEB;
  
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'signup' | 'main'>(
    shouldSkipAuth ? 'main' : 'welcome'
  );
  const { isSignedIn, signInWithEmail } = useAuth();

  // 在 Web 平台上，如果配置允許，自動設置一個模擬用戶以跳過登入
  useEffect(() => {
    if (shouldSkipAuth && !isSignedIn) {
      // 自動登入一個模擬用戶（用於開發，跳過登入流程）
      signInWithEmail('web@example.com').catch(() => {
        // 如果登入失敗，仍然允許訪問（用於開發）
        // 在 Web 平台上，即使沒有登入也能訪問主應用
      });
    }
  }, [shouldSkipAuth, isSignedIn, signInWithEmail]);

  useEffect(() => {
    // 在非 Web 平台上，或當需要測試登入時，只有登入成功才能進入主應用
    if (isSignedIn && !shouldSkipAuth) {
      setCurrentScreen('main');
    }
    // 在 Web 平台上且配置為跳過登入時，始終保持在主應用（已通過初始狀態設置）
  }, [isSignedIn, shouldSkipAuth]);

  const handleWelcomeGetStarted = () => {
    setCurrentScreen('login');
  };

  const handleLoginBack = () => {
    setCurrentScreen('welcome');
  };

  const handleLoginSuccess = () => {
    setCurrentScreen('main');
  };

  const handleSignup = () => {
    setCurrentScreen('signup');
  };

  const handleSignupBack = () => {
    setCurrentScreen('login');
  };

  const handleSignupSuccess = () => {
    setCurrentScreen('main');
  };

  if (currentScreen === 'welcome') {
    return <WelcomeScreen onGetStarted={handleWelcomeGetStarted} />;
  }

  if (currentScreen === 'login') {
    return <LoginScreen onBack={handleLoginBack} onLoginSuccess={handleLoginSuccess} onSignup={handleSignup} />;
  }

  if (currentScreen === 'signup') {
    return <SignupScreen onBack={handleSignupBack} onLogin={handleLoginBack} onSignupSuccess={handleSignupSuccess} />;
  }

  return <MainTabNavigator />;
};

// 主應用 Tab 導航
const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  useEffect(() => {
    // 預先載入常用 icon，避免 Expo Go 上延遲顯示
    Asset.loadAsync([
      require('./assets/icons/home.png'),
      require('./assets/icons/pokercard.png'),
      require('./assets/icons/settings.png'),
      require('./assets/icons/player2.png'),
      require('./assets/icons/connect2.png'),
      require('./assets/icons/copy.png'),
      require('./assets/icons/inout2.png'),
      require('./assets/icons/rake.png'),
      require('./assets/icons/cost.png'),
      require('./assets/icons/dealer.png'),
    ]).catch(() => {});
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <DoubleTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: t('navigation.home'),
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon name="home" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Game"
          component={GameScreen}
          options={{
            title: t('navigation.game'),
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon name="target" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t('navigation.settings'),
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon name="settings" color={color} size={size} focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// 內部組件：應用字體設置
const AppWithFont: React.FC = () => {
  const { language } = useLanguage();
  const fontFamily = getFontFamily(language);
  const fontWeight = getFontWeight(language);

  useEffect(() => {
    // 設置全局字體（僅在 Web 平台有效）
    if (Platform.OS === 'web') {
      // 使用 TypeScript 類型斷言來訪問 Web 平台的 DOM API
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        const style = document.createElement('style');
        style.id = 'app-font-style';
        if (fontFamily) {
          style.textContent = `
            body, body * {
              font-family: ${fontFamily} !important;
              font-weight: ${fontWeight} !important;
            }
            [class*="MaterialCommunityIcons"],
            [class*="expo-vector-icons"],
            [class*="MaterialIcons"],
            svg,
            [data-icon],
            [role="img"] {
              font-family: "MaterialCommunityIcons" !important;
              font-weight: 400 !important;
            }
          `;
        } else {
          style.textContent = `
            body, body * {
              font-weight: ${fontWeight} !important;
            }
            [class*="MaterialCommunityIcons"],
            [class*="expo-vector-icons"],
            [class*="MaterialIcons"],
            svg,
            [data-icon],
            [role="img"] {
              font-weight: 400 !important;
            }
          `;
        }
        // 移除舊的樣式（如果存在）
        const oldStyle = document.getElementById('app-font-style');
        if (oldStyle) {
          oldStyle.remove();
        }
        document.head.appendChild(style);
        return () => {
          const styleToRemove = document.getElementById('app-font-style');
          if (styleToRemove) {
            styleToRemove.remove();
          }
        };
      }
    }
  }, [fontFamily, fontWeight, language]);

  return <AppNavigator />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <GameProvider>
              {/* 啟用協作 Provider，暫時禁用 WebSocket 以測試 Web 版本 */}
              <CollaborationProvider 
                gameId="default-game" 
                websocketUrl="ws://localhost:3001"
                enableWebSocket={false}
              >
                <ToastProvider>
                  <AuthProvider>
                    <AppWithFont />
                    <StatusBar style="dark" />
                  </AuthProvider>
                </ToastProvider>
              </CollaborationProvider>
            </GameProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
