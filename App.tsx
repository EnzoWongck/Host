import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Asset } from 'expo-asset';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Context
import { GameProvider } from './src/context/GameContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { CollaborationProvider } from './src/context/CollaborationContext';

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
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'signup' | 'main'>('welcome');
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setCurrentScreen('main');
    }
  }, [isSignedIn]);

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
            title: '主頁',
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon name="home" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Game"
          component={GameScreen}
          options={{
            title: '目前牌局',
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon name="target" color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '設定',
            tabBarIcon: ({ color, size, focused }) => (
              <TabBarIcon name="settings" color={color} size={size} focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <GameProvider>
            {/* 啟用協作 Provider，暫時禁用 WebSocket 以測試 Web 版本 */}
            <CollaborationProvider 
              gameId="default-game" 
              websocketUrl="ws://localhost:3001"
              enableWebSocket={false}
            >
              <ToastProvider>
                <AuthProvider>
                  <AppNavigator />
                  <StatusBar style="dark" />
                </AuthProvider>
              </ToastProvider>
            </CollaborationProvider>
          </GameProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
