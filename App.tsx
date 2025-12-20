// === 終極 polyfill：強制在所有東西之前補上 resolveAssetSource ===
// 必須放在 App.tsx 最上面，甚至在 import 之前！（是的，違反常規，但這是唯一 100% 有效的）

if (typeof window !== 'undefined') {
  // 強制在全局最優先執行（比任何 library 都早）
  (window as any).resolveAssetSourcePolyfill = () => {
    try {
      const RNImage = require('react-native/Libraries/Image/Image');
      if (RNImage) {
        // 核心：補上 resolveAssetSource
        RNImage.resolveAssetSource = (source: any) => source;
        // 關鍵：處理 u.default（很多 library 會用 u.default.resolveAssetSource）
        if (!RNImage.default) {
          RNImage.default = RNImage;
        } else {
          // 如果已經有 default，也要補上
          RNImage.default.resolveAssetSource = (source: any) => source;
        }
      }
    } catch (e) {
      console.warn('RNImage polyfill failed:', e);
    }

    try {
      if (typeof Image !== 'undefined') {
        // @ts-ignore
        Image.resolveAssetSource = (source: any) => source;
        // @ts-ignore
        if (!Image.default) {
          // @ts-ignore
          Image.default = Image;
        } else {
          // @ts-ignore
          Image.default.resolveAssetSource = (source: any) => source;
        }
      }
    } catch (e) {
      console.warn('Image polyfill failed:', e);
    }

    // 額外保護：直接補全局對象（處理編譯後的 u.default）
    try {
      const ReactNative = require('react-native');
      if (ReactNative && ReactNative.Image) {
        ReactNative.Image.resolveAssetSource = (source: any) => source;
        if (ReactNative.Image.default) {
          ReactNative.Image.default.resolveAssetSource = (source: any) => source;
        }
      }
    } catch (e) {}

    console.log('resolveAssetSource polyfill 已強制載入（全局優先）');
  };

  // 強制立即執行（同步執行，不等待）
  (window as any).resolveAssetSourcePolyfill();
  
  // 額外保護：在 DOMContentLoaded 時再次執行（確保所有模塊都已載入）
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        (window as any).resolveAssetSourcePolyfill();
      });
    } else {
      // 如果已經載入完成，立即執行
      setTimeout(() => {
        (window as any).resolveAssetSourcePolyfill();
      }, 0);
    }
  }
}

// 現在才開始 import（所有 import 都要在這下面！）
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// 靜態導入圖標
import HomeIconAsset from './assets/icons/home.png';
import PokercardIconAsset from './assets/icons/pokercard.png';
import SettingsIconAsset from './assets/icons/settings.png';
import Player2IconAsset from './assets/icons/player2.png';
import Connect2IconAsset from './assets/icons/connect2.png';
import CopyIconAsset from './assets/icons/copy.png';
import Inout2IconAsset from './assets/icons/inout2.png';
import RakeIconAsset from './assets/icons/rake.png';
import CostIconAsset from './assets/icons/cost.png';
import DealerIconAsset from './assets/icons/dealer.png';
import EarthIconAsset from './assets/icons/earth.png';
import EarthWhiteIconAsset from './assets/icons/earth.white.png';
// IconFrontAsset 將使用 require() 動態導入以避免大小寫問題
// Context
import { GameProvider, useGame } from './src/context/GameContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { supabase } from './src/config/supabase';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ToastProvider } from './src/context/ToastContext';
import { CollaborationProvider } from './src/context/CollaborationContext';
import { NavigationProvider, useNavigationContext } from './src/context/NavigationContext';
import { ChipsProvider, useChips } from './src/context/ChipsContext';
import ChipsPurchaseModal from './src/components/ChipsPurchaseModal';
import ChipsExpiredModal from './src/components/ChipsExpiredModal';
// Utils
import { getFontFamily, getFontWeight } from './src/utils/fonts';
// Config
import { SKIP_AUTH_ON_WEB, SHOW_GROK_PREVIEW } from './src/config/dev';
// Preview
import GrokStylePreview from './src/preview/GrokStylePreview';
// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgetPasswordScreen from './src/screens/ForgetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PhoneVerifyScreen from './src/screens/PhoneVerifyScreen';
// Components
import TabBarIcon from './src/components/TabBarIcon';
import DoubleTabBar from './src/components/DoubleTabBar';
import TrialEndedPaywall from './src/components/TrialEndedPaywall';
import NewUserWelcomeModal from './src/components/NewUserWelcomeModal';
import { SignupSuccessHandler } from './src/components/SignupSuccessHandler';
// Types
import { RootTabParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

// 主要應用導航邏輯
const AppNavigator: React.FC = () => {
  const isWeb = Platform.OS === 'web';
  // 根據配置決定是否跳過登入
  const shouldSkipAuth = isWeb && SKIP_AUTH_ON_WEB;
  
  // 檢查 URL 參數是否要顯示預覽（僅 Web）
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    if (isWeb && typeof window !== 'undefined') {
      const checkPreview = () => {
        const params = new URLSearchParams(window.location.search);
        const shouldShow = params.get('preview') === 'true';
        setShowPreview(shouldShow);
        if (shouldShow) {
          console.log('顯示 Grok 風格預覽');
        }
      };
      
      // 初始檢查
      checkPreview();
      
      // 監聽 URL 變化（用於瀏覽器前進/後退）
      window.addEventListener('popstate', checkPreview);
      
      return () => {
        window.removeEventListener('popstate', checkPreview);
      };
    }
  }, [isWeb]);
  
  // 如果顯示預覽，直接返回預覽組件
  // 方式1: URL 參數 ?preview=true
  // 方式2: 開發配置 SHOW_GROK_PREVIEW = true
  // 方式3: 路徑 /preview
  if (showPreview || (isWeb && SHOW_GROK_PREVIEW) || (isWeb && typeof window !== 'undefined' && window.location.pathname === '/preview')) {
    return <GrokStylePreview />;
  }
  
  // 強制跳過登入：如果配置為 true，直接返回主頁面（在渲染前檢查）
  
  const { user, isSignedIn, signInWithEmail, loading, signOut, refreshUser } = useAuth();
  
  // 開發者帳戶白名單（這些帳戶不需要電話驗證）
  const DEVELOPER_EMAILS = [
    'pokerhostdeveloper@gmail.com',
    'viviankwok2002@gmail.com',
  ];
  
  const isDeveloperAccount = (email?: string | null): boolean => {
    if (!email) return false;
    return DEVELOPER_EMAILS.includes(email.toLowerCase());
  };
  
  // 從 sessionStorage 恢復頁面狀態（僅 Web 平台）
  const getInitialScreenFromStorage = (): 'welcome' | 'login' | 'signup' | 'forgotPassword' | 'phoneVerify' | 'main' => {
    if (shouldSkipAuth) return 'main';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('currentScreen');
      // 只有在用戶已登入時才恢復 phoneVerify 或 main
      // 如果用戶未登入但 sessionStorage 中有這些狀態，清除它們
      if (saved && ['welcome', 'login', 'signup', 'forgotPassword'].includes(saved)) {
        return saved as any;
      }
      // 如果保存的是 phoneVerify 或 main，需要檢查用戶是否真的登入
      // 這個檢查會在 useEffect 中進行，這裡先返回 saved
      if (saved && ['phoneVerify', 'main'].includes(saved)) {
        return saved as any;
      }
    }
    return 'welcome';
  };

  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'signup' | 'forgotPassword' | 'phoneVerify' | 'main'>(
    getInitialScreenFromStorage()
  );
  
  // 保存頁面狀態到 sessionStorage（僅 Web 平台）
  const saveScreenToStorage = (screen: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      sessionStorage.setItem('currentScreen', screen);
    }
  };
  
  // 包裝 setCurrentScreen，同時保存到 sessionStorage
  const setCurrentScreenWithStorage = (screen: 'welcome' | 'login' | 'signup' | 'forgotPassword' | 'phoneVerify' | 'main') => {
    setCurrentScreen(screen);
    saveScreenToStorage(screen);
  };
  const [showNewUserWelcome, setShowNewUserWelcome] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); // 標記是否正在註冊流程中
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false); // 標記是否正在驗證電話
  const { setNavigateToWelcomeCallback } = useNavigationContext();

  // 在 Web 平台上，如果配置允許，自動設置一個模擬用戶以跳過登入
  useEffect(() => {
    if (shouldSkipAuth && !isSignedIn) {
      // 自動登入一個模擬用戶（用於開發，跳過登入流程）
      signInWithEmail('web@example.com', 'password').catch(() => {
        // 如果登入失敗，仍然允許訪問（用於開發）
        // 在 Web 平台上，即使沒有登入也能訪問主應用
      });
    }
  }, [shouldSkipAuth, isSignedIn, signInWithEmail]);

  // 處理 OAuth 回調並清理 URL（僅 Web 平台）
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    const hasOAuthParams = hash.includes('access_token') || 
                          hash.includes('refresh_token') || 
                          hash.includes('provider_token');
    
    if (hasOAuthParams) {
      console.log('檢測到 OAuth 回調參數，等待 Supabase 處理 session...');
      
      // 等待 Supabase 處理 session 後再清理 URL 和檢查電話驗證
      const timer = setTimeout(() => {
        // 清理 URL hash
        const url = new URL(window.location.href);
        url.hash = '';
        window.history.replaceState({}, '', url.toString());
        console.log('已清理 OAuth 回調參數');
        
        // 強制刷新用戶狀態以確保電話驗證狀態是最新的
        if (isSignedIn && user) {
          refreshUser();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, user, refreshUser]); // 當登入狀態變化時檢查

  // 檢查初始狀態：如果已登入，直接進入主畫面
  useEffect(() => {
    // 等待認證狀態載入完成
    if (loading) return;
    
    // 如果跳過登入，不執行此邏輯
    if (shouldSkipAuth) return;
    
    if (isSignedIn && user?.uid) {
      // 開發者帳戶：跳過電話驗證
      if (isDeveloperAccount(user?.email)) {
        if (currentScreen === 'welcome' || currentScreen === 'phoneVerify') {
          console.log('🛠️ 開發者帳戶，跳過電話驗證，進入主畫面');
          setCurrentScreenWithStorage('main');
        }
        return;
      }
      
      // 已登入，檢查是否需要電話驗證
      // 如果 user?.phoneVerified 為 false 或 undefined，直接從數據庫查詢最新狀態
      const checkPhoneVerification = async () => {
        let phoneVerified = user?.phoneVerified;
        
        // 如果 React 狀態中的 phoneVerified 為 false 或 undefined，先刷新用戶狀態
        if (!phoneVerified) {
          try {
            // 先刷新用戶狀態，這會從數據庫獲取最新的 phone_verified 狀態
            await refreshUser();
            await new Promise(resolve => setTimeout(resolve, 300)); // 等待狀態更新
            
            // 再次檢查刷新後的狀態
            phoneVerified = user?.phoneVerified;
            
            // 如果刷新後仍然沒有，直接從數據庫查詢（作為備用方案）
            if (!phoneVerified) {
              try {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('phone_verified, phone_verified_at, phone_number')
                  .eq('id', user.uid)
                  .maybeSingle(); // 使用 maybeSingle 而不是 single，避免在沒有記錄時拋錯
                
                if (profileError) {
                  console.error('查詢 profile 錯誤:', profileError);
                } else if (profile) {
                  phoneVerified = profile.phone_verified === true || 
                                profile.phone_verified === 'true' ||
                                profile.phone_verified === 1 ||
                                !!profile.phone_verified_at;
                  
                  console.log('從數據庫查詢的電話驗證狀態:', {
                    userId: user.uid,
                    email: user.email,
                    phoneVerified: phoneVerified,
                    profilePhoneVerified: profile.phone_verified,
                    phoneVerifiedAt: profile.phone_verified_at,
                  });
                }
              } catch (error) {
                console.error('查詢電話驗證狀態失敗:', error);
              }
            }
          } catch (error) {
            console.error('刷新用戶狀態失敗:', error);
          }
        }
        
        console.log('檢查用戶電話驗證狀態:', {
          userId: user?.uid,
          email: user?.email,
          phoneVerified: phoneVerified,
          phoneNumber: user?.phoneNumber,
          currentScreen,
        });
        
        if (phoneVerified) {
          // 已驗證電話，進入主畫面（除非當前在登入/註冊流程中）
          if (currentScreen === 'welcome' || currentScreen === 'phoneVerify' || currentScreen === 'login') {
            console.log('✅ 已登入且已驗證電話，進入主畫面');
            setCurrentScreenWithStorage('main');
          }
        } else {
          // 未驗證電話，必須進入電話驗證頁面
          // 但如果正在驗證電話流程中，或者已經在主畫面，不要強制跳轉
          if (isVerifyingPhone || currentScreen === 'main') {
            console.log('正在驗證電話流程中或已在主畫面，保持當前頁面');
            return;
          }
          
          // 特別處理 OAuth 回調情況：如果從 welcome/login 登入，強制進入電話驗證
          if (currentScreen === 'welcome' || currentScreen === 'login' || 
              (currentScreen !== 'phoneVerify' && currentScreen !== 'signup' && currentScreen !== 'forgotPassword')) {
            console.log('⚠️ 已登入但未驗證電話，進入電話驗證');
            setCurrentScreenWithStorage('phoneVerify');
          }
        }
      };
      
      checkPhoneVerification();
    } else {
      // 未登入，如果在 phoneVerify 頁面，返回 welcome
      // 但如果在註冊流程中，不要跳轉
      if (currentScreen === 'phoneVerify' && !isSigningUp) {
        console.log('未登入，從電話驗證頁面返回歡迎頁面');
        setCurrentScreenWithStorage('welcome');
      }
    }
  }, [loading, isSignedIn, user?.uid, user?.email, user?.phoneVerified, shouldSkipAuth, currentScreen, isVerifyingPhone, refreshUser]);

  const handleWelcomeGetStarted = () => {
    if (!shouldSkipAuth) {
      // 檢查用戶是否已登入
      if (isSignedIn) {
        // 已登入，直接進入主畫面
        setCurrentScreenWithStorage('main');
      } else {
        // 未登入，導向登入頁面
        setCurrentScreenWithStorage('login');
      }
    }
  };

  const handleLoginBack = () => {
    if (!shouldSkipAuth) {
      setCurrentScreenWithStorage('welcome');
    }
  };

  const handleLoginSuccess = async () => {
    // 先刷新用戶資料，確保狀態是最新的
    console.log('登入成功，開始刷新用戶狀態...');
    
    // 多次刷新並等待，確保狀態完全同步
    await refreshUser();
    await new Promise(resolve => setTimeout(resolve, 500)); // 等待狀態更新
    await refreshUser();
    await new Promise(resolve => setTimeout(resolve, 300)); // 再次等待
    await refreshUser();
    
    // 等待一下讓 React 狀態更新完成
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 再次獲取最新的用戶狀態（直接從 Supabase 查詢，不依賴 React 狀態）
    let currentUser = user;
    if (!currentUser || !currentUser.phoneVerified) {
      // 如果 React 狀態還沒有更新，先嘗試刷新用戶狀態
      try {
        await refreshUser();
        await new Promise(resolve => setTimeout(resolve, 300));
        currentUser = user; // 更新 currentUser 為刷新後的狀態
        
        // 如果刷新後仍然沒有，直接從 Supabase 查詢（作為備用方案）
        if (!currentUser || !currentUser.phoneVerified) {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          if (supabaseUser) {
            // 直接查詢 profile 獲取最新的 phone_verified 狀態
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('phone_verified, phone_verified_at, phone_number')
              .eq('id', supabaseUser.id)
              .maybeSingle(); // 使用 maybeSingle 而不是 single
            
            if (profileError) {
              console.error('查詢 profile 錯誤:', profileError);
            } else if (profile) {
              // 嚴格檢查：必須為 true、'true'、1 或存在 phone_verified_at
              const phoneVerified = profile.phone_verified === true || 
                                  profile.phone_verified === 'true' ||
                                  profile.phone_verified === 1 ||
                                  !!profile.phone_verified_at;
              
              console.log('直接查詢 profile 獲取的電話驗證狀態:', {
                userId: supabaseUser.id,
                email: supabaseUser.email,
                phoneVerified: phoneVerified,
                profilePhoneVerified: profile.phone_verified,
                phoneVerifiedAt: profile.phone_verified_at,
              });
              
              // 如果已驗證，直接進入主畫面
              if (phoneVerified) {
                console.log('✅ 用戶已驗證電話（從數據庫確認），進入主畫面');
                setCurrentScreenWithStorage('main');
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('查詢用戶狀態失敗:', error);
      }
    }
    
    // 開發者帳戶：跳過電話驗證
    if (isDeveloperAccount(currentUser?.email)) {
      console.log('🛠️ 開發者帳戶登入，跳過電話驗證');
      setCurrentScreenWithStorage('main');
      return;
    }
    
    // 登入成功後，檢查是否需要電話驗證
    // 如果用戶已驗證電話，直接進入主畫面；否則進入電話驗證
    console.log('檢查電話驗證狀態:', {
      email: currentUser?.email,
      phoneVerified: currentUser?.phoneVerified,
      phoneNumber: currentUser?.phoneNumber,
    });
    
    // 嚴格檢查：phoneVerified 必須為 true
    const isPhoneVerified = currentUser?.phoneVerified === true || 
                           currentUser?.phoneVerified === 'true' ||
                           currentUser?.phoneVerified === 1;
    
    if (isPhoneVerified) {
      console.log('✅ 用戶已驗證電話，進入主畫面');
      setCurrentScreenWithStorage('main');
    } else {
      console.log('⚠️ 用戶未驗證電話，進入電話驗證頁面');
      setCurrentScreenWithStorage('phoneVerify');
    }
  };

  const handleSignup = () => {
    if (!shouldSkipAuth) {
      setCurrentScreenWithStorage('signup');
    }
  };

  const handleSignupBack = () => {
    if (!shouldSkipAuth) {
      setCurrentScreenWithStorage('login');
    }
  };

  const [shouldClearGames, setShouldClearGames] = useState(false);
  
  const handleSignupSuccess = async () => {
    // 標記正在註冊流程中
    setIsSigningUp(true);
    
    // 標記需要清除遊戲數據（通過 AsyncStorage 傳遞給 GameProvider 內部的組件）
    try {
      await AsyncStorage.setItem('shouldClearGamesOnSignup', 'true');
    } catch (e) {
      console.error('Failed to set clear games flag:', e);
    }
    
    // 顯示新用戶歡迎模態框
    setShowNewUserWelcome(true);
    
    // 等待一下讓用戶狀態更新
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 開發者帳戶：跳過電話驗證
    if (isDeveloperAccount(user?.email)) {
      console.log('🛠️ 開發者帳戶註冊，跳過電話驗證');
      setIsSigningUp(false);
      setCurrentScreenWithStorage('main');
      return;
    }
    
    // 新用戶註冊後強制進行電話驗證
    // 即使需要郵件確認，也先進入電話驗證頁面
    setCurrentScreenWithStorage('phoneVerify');
    
    // 3 秒後清除註冊標記（給用戶足夠時間完成電話驗證）
    setTimeout(() => {
      setIsSigningUp(false);
    }, 3000);
  };

  const handleForgotPassword = () => {
    if (!shouldSkipAuth) {
      setCurrentScreenWithStorage('forgotPassword');
    }
  };

  const handleForgotPasswordBack = () => {
    if (!shouldSkipAuth) {
      setCurrentScreenWithStorage('login');
    }
  };

  useEffect(() => {
    // 如果跳過登入，不設置導航回調，避免被導向登入頁
    if (!shouldSkipAuth) {
      // 無論當前是否登入，只要呼叫 navigateToWelcome，就一律回到 Welcome 畫面
      //（用於設定頁登出後返回歡迎頁）
      setNavigateToWelcomeCallback(() => {
        setCurrentScreenWithStorage('welcome');
      });
    }
  }, [setNavigateToWelcomeCallback, shouldSkipAuth]);

  // 如果跳過登入，直接顯示主頁面，忽略所有其他狀態
  if (shouldSkipAuth) {
    return <MainTabNavigator />;
  }

  if (currentScreen === 'welcome') {
    return <WelcomeScreen onGetStarted={handleWelcomeGetStarted} />;
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onBack={handleLoginBack}
        onLoginSuccess={handleLoginSuccess}
        onSignup={handleSignup}
        onForgotPassword={handleForgotPassword}
        // 電話登入暫時禁用
        // onPhoneLogin={() => setCurrentScreen('phoneVerify')}
      />
    );
  }

  if (currentScreen === 'signup') {
    return <SignupScreen onBack={handleSignupBack} onLogin={() => setCurrentScreenWithStorage('login')} onSignupSuccess={handleSignupSuccess} />;
  }

  if (currentScreen === 'forgotPassword') {
    return <ForgetPasswordScreen onBack={handleForgotPasswordBack} />;
  }

  // 電話驗證畫面
  if (currentScreen === 'phoneVerify') {
    return (
      <PhoneVerifyScreen
        onVerified={async () => {
          setIsSigningUp(false); // 清除註冊標記
          setIsVerifyingPhone(true); // 標記正在驗證電話，防止 useEffect 干擾
          
          // 先直接進入主畫面，避免 useEffect 檢查
          console.log('電話驗證完成，直接進入主畫面');
          setCurrentScreenWithStorage('main');
          
          // 然後在背景更新用戶狀態
          try {
            await refreshUser();
            await new Promise(resolve => setTimeout(resolve, 500));
            await refreshUser();
            console.log('用戶狀態已更新');
          } catch (error) {
            console.error('更新用戶狀態失敗:', error);
          } finally {
            // 清除驗證標記（延遲清除，確保狀態已更新）
            setTimeout(() => {
              setIsVerifyingPhone(false);
            }, 1000);
          }
        }}
        onLogout={() => {
          setIsSigningUp(false); // 清除註冊標記
          setIsVerifyingPhone(false); // 清除驗證標記
          setCurrentScreenWithStorage('welcome');
        }}
      />
    );
  }

  return (
    <>
      <MainTabNavigator />
      <NewUserWelcomeModal
        visible={showNewUserWelcome}
        onClose={() => setShowNewUserWelcome(false)}
      />
    </>
  );
};

// 主應用 Tab 導航
const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  useEffect(() => {
    // 預先載入常用 icon，避免 Expo Go 上延遲顯示
    // 在 Web 平台上跳過 Asset.loadAsync，因為它可能會使用 resolveAssetSource
    if (Platform.OS !== 'web') {
      Asset.loadAsync([
        HomeIconAsset,
        PokercardIconAsset,
        SettingsIconAsset,
        Player2IconAsset,
        Connect2IconAsset,
        CopyIconAsset,
        Inout2IconAsset,
        RakeIconAsset,
        CostIconAsset,
        DealerIconAsset,
        EarthIconAsset,
        EarthWhiteIconAsset,
      ]).catch(() => {});
    }
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

// 內部組件：應用字體設置和狀態欄
const AppWithFont: React.FC = () => {
  const { language } = useLanguage();
  const { colorMode } = useTheme();
  const fontFamily = getFontFamily(language);
  const fontWeight = getFontWeight(language);

  useEffect(() => {
    // 設置全局字體（僅在 Web 平台有效）
    if (Platform.OS === 'web') {
      // 使用 TypeScript 類型斷言來訪問 Web 平台的 DOM API
      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        // 設置瀏覽器標籤頁 favicon 為 icon-front-512.PNG（適用 localhost 與正式站）
        try {
          // Web 平台直接使用 public 路徑
          const iconHref = '/icons/icon-front-512.PNG';
          let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
          if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
          }
          favicon.href = iconHref;
        } catch {
          // ignore favicon errors in dev
        }

        // 加載 Gilroy Black 字體
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Gilroy:wght@900&display=swap';
        link.rel = 'stylesheet';
        link.id = 'gilroy-font-link';
        if (!document.getElementById('gilroy-font-link')) {
          document.head.appendChild(link);
        }

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
            /* 全域移除瀏覽器對 input/textarea 的預設邊框與 focus 外框（特別是 iOS Safari 黑框） */
            input, textarea {
              outline: none !important;
              border-width: 0 !important;
              border-style: none !important;
              box-shadow: none !important;
              -webkit-appearance: none !important;
            }
            input:focus, textarea:focus {
              outline: none !important;
              border-width: 0 !important;
              border-style: none !important;
              box-shadow: none !important;
              -webkit-appearance: none !important;
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
            /* 全域移除瀏覽器對 input/textarea 的預設邊框與 focus 外框（特別是 iOS Safari 黑框） */
            input, textarea {
              outline: none !important;
              border-width: 0 !important;
              border-style: none !important;
              box-shadow: none !important;
              -webkit-appearance: none !important;
            }
            input:focus, textarea:focus {
              outline: none !important;
              border-width: 0 !important;
              border-style: none !important;
              box-shadow: none !important;
              -webkit-appearance: none !important;
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

// Chips 不足 Paywall 檢查組件
const PaywallGuard: React.FC = () => {
  const { chips, loading } = useChips();
  const [paywallVisible, setPaywallVisible] = React.useState(false);

  useEffect(() => {
    // 只有在沒有 chips（chips === 0）時才顯示 paywall
    // 等待 loading 完成後再檢查
    if (loading) return;
    
    if (chips === 0) {
      // 檢查是否在 1 小時內關閉過
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const closedAt = localStorage.getItem('paywall_closed_at');
        if (closedAt) {
          const timeDiff = Date.now() - parseInt(closedAt, 10);
          if (timeDiff < 60 * 60 * 1000) {
            return; // 1 小時內不顯示
          }
        }
      }
      setPaywallVisible(true);
    } else {
      setPaywallVisible(false);
    }
  }, [chips, loading]);

  const handleClose = () => {
    setPaywallVisible(false);
    // 記錄關閉時間
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem('paywall_closed_at', Date.now().toString());
    }
  };

  const handleSubscribeSuccess = () => {
    setPaywallVisible(false);
    // 清除關閉時間記錄
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem('paywall_closed_at');
    }
  };

  return (
    <TrialEndedPaywall
      visible={paywallVisible}
      onClose={handleClose}
      onSubscribeSuccess={handleSubscribeSuccess}
    />
  );
};

// Chips 購買和過期提醒組件
const ChipsGuard: React.FC = () => {
  const { showPurchaseModal, showExpiredModal, closePurchaseModal, closeExpiredModal, gameChipStatus } = useChips();
  const { state } = useGame();
  
  // 獲取當前遊戲 ID
  const currentGameId = state.currentGame?.id || '';

  return (
    <>
      <ChipsPurchaseModal
        visible={showPurchaseModal}
        onClose={closePurchaseModal}
      />
      <ChipsExpiredModal
        visible={showExpiredModal}
        onClose={closeExpiredModal}
        gameId={currentGameId}
      />
    </>
  );
};

// StatusBar 組件：根據主題動態設置
const AppStatusBar: React.FC = () => {
  const { colorMode } = useTheme();
  return <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />;
};

// SignupSuccessHandler 包裝組件：在 GameProvider 內部使用
const SignupSuccessHandlerWrapper: React.FC = () => {
  const [shouldClear, setShouldClear] = React.useState(false);
  
  // 監聽 AsyncStorage 中的標記
  React.useEffect(() => {
    const checkShouldClear = async () => {
      try {
        const value = await AsyncStorage.getItem('shouldClearGamesOnSignup');
        if (value === 'true') {
          setShouldClear(true);
          await AsyncStorage.removeItem('shouldClearGamesOnSignup');
        }
      } catch (e) {
        // 忽略錯誤
      }
    };
    
    checkShouldClear();
    const interval = setInterval(checkShouldClear, 500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <SignupSuccessHandler
      shouldClear={shouldClear}
      onCleared={() => setShouldClear(false)}
    />
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <GameProvider>
                  {/* 啟用協作 Provider，暫時禁用 WebSocket 以測試 Web 版本 */}
                  <CollaborationProvider 
                    gameId="default-game" 
                    websocketUrl="ws://localhost:3001"
                    enableWebSocket={false}
                  >
                    <ChipsProvider>
                      <NavigationProvider>
                        <AppWithFont />
                        <SignupSuccessHandlerWrapper />
                        <PaywallGuard />
                        <ChipsGuard />
                        <AppStatusBar />
                      </NavigationProvider>
                    </ChipsProvider>
                  </CollaborationProvider>
                </GameProvider>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
