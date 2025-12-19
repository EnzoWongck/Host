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
  signUpWithEmail: (email: string, password: string) => Promise<void>;
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

    // 獲取用戶的 profile（包含 chips）
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    return {
      uid: supabaseUser.id,
      email: supabaseUser.email || null,
      displayName: supabaseUser.user_metadata?.full_name || 
                   supabaseUser.user_metadata?.name || 
                   supabaseUser.email?.split('@')[0] || null,
      photoURL: supabaseUser.user_metadata?.avatar_url || null,
      phoneNumber: profile?.phone_number || supabaseUser.phone || null,
      phoneVerified: profile?.phone_verified || false,
      chips: profile?.chips || 0,
    };
  }, []);

  // 刷新用戶資料
  const refreshUser = useCallback(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    const authUser = await transformUser(supabaseUser);
    setUser(authUser);
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
  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: Platform.OS === 'web' && typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : 'https://lunchips.com/auth/callback',
        },
      });
      if (error) throw error;
      
      // 如果需要確認郵件，data.user 會存在但 session 為 null
      if (data.user && !data.session) {
        console.log('請檢查郵箱確認註冊');
      } else {
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.OS === 'web' && typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : 'https://lunchips.com/auth/callback',
        },
      });
      if (error) throw error;
      // OAuth 登入會重定向，不需要在這裡處理 user
    } finally {
      setLoading(false);
    }
  }, []);

  // Apple 登入
  const signInWithApple = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: Platform.OS === 'web' && typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : 'https://lunchips.com/auth/callback',
        },
      });
      if (error) throw error;
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
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
