import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../config/firebase';

type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  photoURL: string | null;
  provider?: string | null;
} | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  isSignedIn: boolean;
  hasPhoneNumber: boolean; // 檢查用戶是否已綁定電話號碼
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithPhoneNumber: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let redirectHandled = false;

    // 處理重定向登入結果（只在頁面載入時執行一次）
    const handleRedirectResult = async () => {
      // 如果已經處理過重定向，不再處理
      if (redirectHandled) {
        return;
      }

      try {
        // 檢查是否從重定向返回（檢查 URL 中是否有相關參數）
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const hasRedirectParams = urlParams && (
          urlParams.has('__firebase_request_key') || 
          hash.includes('access_token') ||
          hash.includes('id_token')
        );
        
        if (hasRedirectParams) {
          console.log('檢測到重定向返回，處理登入結果...');
          setLoading(true);
          redirectHandled = true;
        }

        const result = await getRedirectResult(auth);
        if (result && isMounted) {
          // 重定向登入成功
          console.log('重定向登入成功', result.user);
          redirectHandled = true;
          // 清除 URL 中的重定向參數，避免重複處理
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          // onAuthStateChanged 會自動觸發並更新狀態
        }
      } catch (error: any) {
        console.error('處理重定向結果失敗', error);
        // 如果是因為沒有重定向結果而報錯，這是正常的，不需要處理
        if (error?.code !== 'auth/no-auth-event') {
          console.error('重定向處理錯誤', error);
        }
      }
    };

    // 先處理重定向結果（只在首次載入時）
    handleRedirectResult();

    // 監聽認證狀態變化
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (!isMounted) return;
      
      console.log('認證狀態變化', firebaseUser ? '已登入' : '未登入', firebaseUser?.email);
      
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          provider: firebaseUser.providerData?.[0]?.providerId ?? null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    // 如果已經登入，不應該再次觸發登入流程
    if (user) {
      console.log('用戶已登入，跳過登入流程');
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      if (Platform.OS !== 'web') {
        throw new Error('Google 登入僅支援 Web，行動端請改用其他登入方式');
      }
      
      // 使用 popup 方式登入（只負責登入，不跳頁）
      await signInWithPopup(auth, provider);
      // onAuthStateChanged 會自動更新狀態，Root 組件會根據狀態自動切換頁面
    } catch (error: any) {
      // 如果 popup 被阻止或關閉，fallback 到重定向方式
      if (error?.code === 'auth/popup-blocked' || 
          error?.code === 'auth/popup-closed-by-user' ||
          error?.message?.includes('Cross-Origin-Opener-Policy')) {
        console.warn('Popup 被阻止，改用重定向方式');
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          console.error('Google 重定向登入失敗', redirectError);
          alert('登入失敗：' + (redirectError?.message || 'Google Sign-In Error'));
        }
      } else {
        console.error('Google 登入失敗', error);
        alert('登入失敗：' + (error?.message || 'Google Sign-In Error'));
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Email 登入失敗', error);
      throw error;
    }
  };

  const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      if (Platform.OS !== 'web') {
        throw new Error('電話號碼登入僅支援 Web，行動端請改用其他登入方式');
      }
      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error: any) {
      console.error('電話號碼登入失敗', error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  // 檢查用戶是否已綁定電話號碼
  const hasPhoneNumber = useMemo(() => {
    if (!user) return false;
    // 從 Firebase User 對象檢查電話號碼
    // 注意：這裡需要從 auth.currentUser 獲取，因為 user 是我們自定義的類型
    return auth.currentUser?.phoneNumber ? true : false;
  }, [user]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    isSignedIn: !!user,
    hasPhoneNumber,
    signInWithGoogle,
    signInWithEmail,
    signInWithPhoneNumber: signInWithPhone,
    signOut,
  }), [user, loading, hasPhoneNumber]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth 必須在 AuthProvider 內使用');
  return context;
};
