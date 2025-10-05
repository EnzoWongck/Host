import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_EXPO_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, APPLE_ENABLED } from '../config/auth';

interface AuthUser {
  id: string;
  name: string;
  email?: string;
  provider: 'apple' | 'google' | 'email';
}

interface AuthContextType {
  user: AuthUser | null;
  isSignedIn: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

WebBrowser.maybeCompleteAuthSession();

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // 暫時移除 Google OAuth 配置以避免網頁版本錯誤

  const signInWithApple = useCallback(async () => {
    if (!APPLE_ENABLED) {
      throw new Error('Apple 登入未啟用');
    }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const displayName = `${credential.fullName?.givenName ?? ''}${credential.fullName?.familyName ?? ''}`.trim() || 'Apple 使用者';
      setUser({
        id: credential.user,
        name: displayName,
        email: credential.email ?? undefined,
        provider: 'apple',
      });
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return;
      throw e;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // 暫時使用模擬登入
    setUser({ id: 'google-user-1', name: 'Google 使用者', provider: 'google' });
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    // 簡單驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email 格式錯誤');
    }
    setUser({ id: 'email-user-1', name: email.split('@')[0], provider: 'email', email });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isSignedIn: !!user,
    signInWithApple,
    signInWithGoogle,
    signInWithEmail,
    signOut,
  }), [user, signInWithApple, signInWithGoogle, signInWithEmail, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
