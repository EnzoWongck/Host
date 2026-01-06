import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { supabase, SupabaseUser, UserProfile } from '../config/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

// ============================================
// Types
// ============================================
export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  chips: number;
} | null;

type AuthContextType = {
  user: AuthUser;
  isSignedIn: boolean;
  loading: boolean;
  // 登入方法
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOTP: (phone: string, token: string) => Promise<void>;
  // 登出
  signOut: () => Promise<void>;
  // 重設密碼
  resetPassword: (email: string) => Promise<void>;
  // 更新 Chips
  updateChips: (newChips: number) => void;
  // 刷新用戶資料
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Hook
// ============================================
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ============================================
// Provider
// ============================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  // 將 Supabase User 轉換為 AuthUser
  const transformUser = useCallback(async (supabaseUser: User | null): Promise<AuthUser> => {
    if (!supabaseUser) return null;

    // 獲取用戶的 profile（包含 chips、phone_verified 和 display_name）
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone_number, phone_verified, phone_verified_at, chips, display_name')
      .eq('id', supabaseUser.id)
      .single();

    console.log('查詢 profile 結果:', {
      userId: supabaseUser.id,
      email: supabaseUser.email,
      hasProfile: !!profile,
      profileError: profileError ? {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
      } : null,
      profileData: profile ? JSON.stringify(profile, null, 2) : null,
    });

    if (profileError) {
      console.error('獲取用戶 profile 失敗:', {
        error: profileError,
        userId: supabaseUser.id,
        errorMessage: profileError.message,
        errorCode: profileError.code,
        errorDetails: profileError.details,
      });
      
      // 如果 profile 不存在，嘗試從 user_metadata 獲取
      // 嚴格檢查：必須為 true、'true' 或 1
      const phoneVerified = supabaseUser.user_metadata?.phone_verified === true || 
                           supabaseUser.user_metadata?.phone_verified === 'true' ||
                           supabaseUser.user_metadata?.phone_verified === 1;
      
      console.log('使用 user_metadata 作為備用:', {
        phoneVerified: phoneVerified,
        userMetadata: supabaseUser.user_metadata,
      });
      
      return {
        uid: supabaseUser.id,
        email: supabaseUser.email || null,
        displayName: supabaseUser.user_metadata?.full_name || 
                     supabaseUser.user_metadata?.name || 
                     supabaseUser.email?.split('@')[0] || null,
        photoURL: supabaseUser.user_metadata?.avatar_url || null,
        phoneNumber: supabaseUser.phone || null,
        phoneVerified: phoneVerified,
        chips: 0,
      };
    }

    if (!profile) {
      console.warn('Profile 為 null，使用默認值');
      return {
        uid: supabaseUser.id,
        email: supabaseUser.email || null,
        displayName: supabaseUser.user_metadata?.full_name || 
                     supabaseUser.user_metadata?.name || 
                     supabaseUser.email?.split('@')[0] || null,
        photoURL: supabaseUser.user_metadata?.avatar_url || null,
        phoneNumber: supabaseUser.phone || null,
        phoneVerified: false,
        chips: 0,
      };
    }

    // 確保 phone_verified 是布林值
    // 優先檢查 phone_verified 字段，如果不存在或為 false，則檢查 phone_verified_at
    let phoneVerified = false;
    
    if (profile.phone_verified !== undefined && profile.phone_verified !== null) {
      // 如果 phone_verified 字段存在，使用它
      phoneVerified = profile.phone_verified === true || 
                      profile.phone_verified === 'true' ||
                      profile.phone_verified === 1 ||
                      String(profile.phone_verified).toLowerCase() === 'true';
    } else if (profile.phone_verified_at) {
      // 如果 phone_verified 不存在但 phone_verified_at 存在，視為已驗證
      phoneVerified = true;
      console.warn('phone_verified 字段不存在，但 phone_verified_at 存在，視為已驗證');
    } else if (profile.phone_number) {
      // 如果只有 phone_number 但沒有驗證標記，視為未驗證
      phoneVerified = false;
    }

    console.log('用戶電話驗證狀態:', {
      userId: supabaseUser.id,
      email: supabaseUser.email,
      phoneVerified: phoneVerified,
      profilePhoneVerified: profile.phone_verified,
      profilePhoneVerifiedType: typeof profile.phone_verified,
      phoneVerifiedRaw: profile.phone_verified,
      phoneVerifiedAt: profile.phone_verified_at,
      phoneNumber: profile.phone_number,
      hasPhoneVerifiedField: 'phone_verified' in profile,
      hasPhoneVerifiedAtField: 'phone_verified_at' in profile,
      profileKeys: Object.keys(profile),
      finalPhoneVerified: phoneVerified,
    });

    return {
      uid: supabaseUser.id,
      email: supabaseUser.email || null,
      displayName: profile.display_name ||
                   supabaseUser.user_metadata?.full_name || 
                   supabaseUser.user_metadata?.name || 
                   supabaseUser.email?.split('@')[0] || null,
      photoURL: supabaseUser.user_metadata?.avatar_url || null,
      phoneNumber: profile.phone_number || supabaseUser.phone || null,
      phoneVerified: phoneVerified,
      chips: profile.chips || 0,
    };
  }, []);

  // 刷新用戶資料
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: supabaseUser }, error: getUserError } = await supabase.auth.getUser();
      
      if (getUserError) {
        console.error('獲取用戶失敗:', getUserError);
        setUser(null);
        return;
      }

      if (!supabaseUser) {
        console.log('沒有登入用戶');
        setUser(null);
        return;
      }

      const authUser = await transformUser(supabaseUser);
      console.log('刷新用戶資料完成:', {
        userId: authUser?.uid,
        email: authUser?.email,
        phoneVerified: authUser?.phoneVerified,
        phoneNumber: authUser?.phoneNumber,
      });
      setUser(authUser);
    } catch (error) {
      console.error('刷新用戶資料失敗:', error);
    }
  }, [transformUser]);

  // 更新 Chips（本地狀態）
  const updateChips = useCallback((newChips: number) => {
    setUser(prev => prev ? { ...prev, chips: newChips } : null);
  }, []);

  // ============================================
  // Auth 方法
  // ============================================

  // Email 登入
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const authUser = await transformUser(data.user);
      setUser(authUser);
    } finally {
      setLoading(false);
    }
  }, [transformUser]);

  // Email 註冊
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: Platform.OS === 'web' && typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : 'https://lunchips.com/auth/callback',
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });
      if (error) throw error;
      
      // 更新 profiles 表的 display_name
      if (data.user) {
        const nameToSave = displayName || email.split('@')[0];
        
        // 先嘗試更新
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ display_name: nameToSave })
          .eq('id', data.user.id);
        
        if (updateError) {
          console.log('更新 display_name 失敗，嘗試 upsert:', updateError);
          // 如果更新失敗（可能是記錄不存在），嘗試 upsert
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id, 
              display_name: nameToSave,
              email: email.toLowerCase(),
            });
          
          if (upsertError) {
            console.error('upsert display_name 失敗:', upsertError);
          } else {
            console.log('display_name 已保存:', nameToSave);
          }
        } else {
          console.log('display_name 已更新:', nameToSave);
        }
      }
      
      // 如果需要確認郵件，data.user 會存在但 session 為 null
      if (data.user && !data.session) {
        console.log('請檢查郵箱確認註冊');
        // 即使需要確認郵件，也設置用戶狀態（用於顯示歡迎訊息等）
        const authUser = await transformUser(data.user);
        setUser(authUser);
      } else if (data.user && data.session) {
        // 直接註冊成功（不需要確認郵件）
        const authUser = await transformUser(data.user);
        setUser(authUser);
      }
    } finally {
      setLoading(false);
    }
  }, [transformUser]);

  // Google 登入
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      // 確保使用當前域名作為 redirectTo（不依賴 Supabase Site URL）
      let redirectUrl: string;
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // 使用當前頁面的完整 URL
        redirectUrl = window.location.href.split('#')[0]; // 移除 hash
        console.log('當前頁面 URL:', window.location.href);
        console.log('當前 origin:', window.location.origin);
        console.log('當前 pathname:', window.location.pathname);
      } else {
        redirectUrl = 'https://lunchips.com';
      }
      
      console.log('Google OAuth redirectTo:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // 強制使用指定的 redirectTo，不依賴 Supabase Site URL
            redirect_to: redirectUrl,
          },
        },
      });
      if (error) {
        console.error('Google OAuth 錯誤:', error);
        throw error;
      }
      // OAuth 登入會重定向，不需要在這裡處理 user
    } finally {
      setLoading(false);
    }
  }, []);

  // Apple 登入
  const signInWithApple = useCallback(async () => {
    setLoading(true);
    try {
      // 確保使用當前域名作為 redirectTo（不依賴 Supabase Site URL）
      let redirectUrl: string;
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // 使用當前頁面的完整 URL
        redirectUrl = window.location.href.split('#')[0]; // 移除 hash
        console.log('當前頁面 URL:', window.location.href);
        console.log('當前 origin:', window.location.origin);
        console.log('當前 pathname:', window.location.pathname);
      } else {
        redirectUrl = 'https://lunchips.com';
      }
      
      console.log('Apple OAuth redirectTo:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // 強制使用指定的 redirectTo，不依賴 Supabase Site URL
            redirect_to: redirectUrl,
          },
        },
      });
      if (error) {
        console.error('Apple OAuth 錯誤:', error);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 手機號碼登入（發送 OTP）
  const signInWithPhone = useCallback(async (phone: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
      console.log('OTP 已發送');
    } finally {
      setLoading(false);
    }
  }, []);

  // 驗證手機 OTP
  const verifyPhoneOTP = useCallback(async (phone: string, token: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      const authUser = await transformUser(data.user);
      setUser(authUser);
    } finally {
      setLoading(false);
    }
  }, [transformUser]);

  // 登出
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      // 清除本地狀態
      setUser(null);
      // 清除 Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase 登出錯誤:', error);
        throw error;
      }
      // 清除 Web 平台的認證相關存儲
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          // 清除 Supabase 認證相關的 localStorage 項目
          // Supabase 通常使用 'sb-<project-id>-auth-token' 格式
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            // 清除所有 Supabase 相關的認證數據（以 sb- 開頭）
            // 這只會清除認證令牌，不會影響其他數據
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
          // 清除 sessionStorage 中的認證相關項目
          sessionStorage.removeItem('currentScreen');
          // 清除 Supabase 的 sessionStorage（如果有的話）
          const sessionKeys = Object.keys(sessionStorage);
          sessionKeys.forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase-auth')) {
              sessionStorage.removeItem(key);
            }
          });
          console.log('已清除認證相關的存儲數據（牌局數據不受影響，存儲在數據庫中）');
        } catch (e) {
          console.warn('清除認證數據失敗:', e);
        }
      }
      console.log('登出完成');
    } catch (error) {
      console.error('登出過程出錯:', error);
      // 即使出錯，也清除本地狀態
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 重設密碼
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/auth/reset-password`
        : 'https://lunchips.com/auth/reset-password',
    });
    if (error) throw error;
  }, []);

  // ============================================
  // Effects
  // ============================================

  // 監聽認證狀態變化
  useEffect(() => {
    let isMounted = true;

    // 獲取當前 session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          const authUser = await transformUser(session.user);
          setUser(authUser);
        }
      } catch (error) {
        console.error('獲取 session 失敗:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth 狀態變化:', event, session?.user?.email);
        
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const authUser = await transformUser(session.user);
          setUser(authUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const authUser = await transformUser(session.user);
          setUser(authUser);
        }
        
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [transformUser]);

  // 監聽頁面可見性變化（處理手機從後台返回的情況）
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    let isRefreshing = false;
    let refreshTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isRefreshing) {
        console.log('頁面重新變為可見，檢查會話狀態...');
        isRefreshing = true;
        
        // 設置超時，防止無限等待
        refreshTimeout = setTimeout(() => {
          console.log('會話恢復超時，重置狀態');
          isRefreshing = false;
          setLoading(false);
        }, 5000);

        try {
          // 刷新 Supabase 會話
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('獲取會話失敗:', sessionError);
            // 嘗試刷新會話
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('刷新會話失敗:', refreshError);
              // 會話完全失效，清除用戶狀態
              setUser(null);
            } else if (refreshData.session?.user) {
              console.log('會話已刷新');
              const authUser = await transformUser(refreshData.session.user);
              setUser(authUser);
            }
          } else if (session?.user) {
            // 會話有效，更新用戶狀態
            console.log('會話有效，更新用戶狀態');
            const authUser = await transformUser(session.user);
            setUser(authUser);
          } else {
            console.log('無有效會話');
            setUser(null);
          }
        } catch (error) {
          console.error('頁面可見性變化處理錯誤:', error);
          // 發生錯誤時確保不會卡住
          setLoading(false);
        } finally {
          // 清除超時
          if (refreshTimeout) {
            clearTimeout(refreshTimeout);
            refreshTimeout = null;
          }
          // 確保 loading 狀態被重置
          setLoading(false);
          // 延遲重置刷新狀態，避免短時間內重複刷新
          setTimeout(() => {
            isRefreshing = false;
          }, 1000);
        }
      }
    };

    // 監聯頁面可見性變化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 監聽頁面焦點（某些瀏覽器可能不觸發 visibilitychange）
    window.addEventListener('focus', handleVisibilityChange);

    // 監聯 pageshow 事件（用於處理 bfcache 返回的情況）
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('頁面從 bfcache 恢復');
        handleVisibilityChange();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [transformUser]);

  // ============================================
  // Context Value
  // ============================================
  const value: AuthContextType = {
    user,
    isSignedIn: !!user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signInWithPhone,
    verifyPhoneOTP,
    signOut,
    resetPassword,
    updateChips,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
