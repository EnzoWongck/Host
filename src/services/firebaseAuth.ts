console.log('firebaseAuth.ts 已成功載入！！！');

import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  User, 
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../config/firebase';

// Firebase Auth 服務類型
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
}

// 檢測是否為移動設備
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768);
};

// Google 登入
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    // 在 Web 平台上，優先使用重定向方式（避免彈出視窗被阻止）
    // 在移動設備上也使用重定向
    const isWeb = typeof window !== 'undefined';
    if (isWeb && (isMobileDevice() || true)) { // 在 Web 上總是使用重定向
      // Web 和移動設備：使用重定向（更可靠，不會被瀏覽器阻止）
      console.log('使用重定向方式進行 Google 登入...');
      await signInWithRedirect(auth, googleProvider);
      // 重定向後會返回，這裡不會執行
      throw new Error('Redirecting to Google sign in...');
    } else {
      // 其他平台（如 React Native）：嘗試使用彈窗
      try {
        const result: UserCredential = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log('Google 登入成功', user);
        
        // 保存 token 到 localStorage
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        localStorage.setItem('userProfile', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerId: 'google.com'
        }));
        
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerId: 'google.com'
        };
      } catch (popupError: any) {
        // 如果彈窗被阻止，回退到重定向
        if (popupError?.code === 'auth/popup-blocked' || popupError?.code === 'auth/popup-closed-by-user') {
          console.log('彈窗被阻止，切換到重定向方式...');
          await signInWithRedirect(auth, googleProvider);
          throw new Error('Redirecting to Google sign in...');
        }
        throw popupError;
      }
    }
  } catch (error: any) {
    // 如果是重定向，不拋出錯誤
    if (error?.message?.includes('Redirecting')) {
      return {} as AuthUser; // 臨時返回，重定向後會處理
    }
    console.error('Google 登入失敗', error);
    throw error;
  }
};

// 處理重定向回調（需要在應用啟動時調用）
export const handleGoogleRedirect = async (): Promise<AuthUser | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      
      console.log('Google 重定向登入成功', user);
      
      // 保存 token 到 localStorage
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userProfile', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: 'google.com'
      }));
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: 'google.com'
      };
    }
    return null;
  } catch (error) {
    console.error('處理 Google 重定向失敗', error);
    return null;
  }
};

// Apple 登入
export const signInWithAppleFirebase = async (): Promise<AuthUser> => {
  try {
    const result: UserCredential = await signInWithPopup(auth, appleProvider);
    const user = result.user;
    
    console.log('Apple 登入成功', user);
    
    // 保存 token 到 localStorage
    const token = await user.getIdToken();
    localStorage.setItem('authToken', token);
    localStorage.setItem('userProfile', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: 'apple.com'
    }));
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: 'apple.com'
    };
  } catch (error) {
    console.error('Apple 登入失敗', error);
    throw error;
  }
};

// Email/Password 登入
export const signInWithEmailAndPasswordFirebase = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    console.log('Email 登入成功', user);
    
    // 保存 token 到 localStorage
    const token = await user.getIdToken();
    localStorage.setItem('authToken', token);
    localStorage.setItem('userProfile', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: 'password'
    }));
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: 'password'
    };
  } catch (error) {
    console.error('Email 登入失敗', error);
    throw error;
  }
};

// Email/Password 註冊
export const signUpWithEmailAndPassword = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    console.log('Email 註冊成功', user);
    
    // 保存 token 到 localStorage
    const token = await user.getIdToken();
    localStorage.setItem('authToken', token);
    localStorage.setItem('userProfile', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: 'password'
    }));
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: 'password'
    };
  } catch (error) {
    console.error('Email 註冊失敗', error);
    throw error;
  }
};

// 登出
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    console.log('用戶已登出');
  } catch (error) {
    console.error('登出失敗', error);
    throw error;
  }
};

// 檢查用戶是否已登入
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// 從 localStorage 獲取用戶資料
export const getUserProfile = (): AuthUser | null => {
  const profile = localStorage.getItem('userProfile');
  return profile ? JSON.parse(profile) : null;
};

// 檢查是否有有效的 auth token
export const hasValidToken = (): boolean => {
  return !!localStorage.getItem('authToken');
};

// 發送密碼重置郵件
export const sendPasswordReset = async (email: string): Promise<void> => {
  console.log('sendPasswordReset 函數被呼叫', email);
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('密碼重置郵件已發送');
  } catch (error) {
    console.error('發送密碼重置郵件失敗', error);
    throw error;
  }
};
