import { 
  signInWithPopup, 
  signOut, 
  User, 
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
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

// Google 登入
export const signInWithGoogle = async (): Promise<AuthUser> => {
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
  } catch (error) {
    console.error('Google 登入失敗', error);
    throw error;
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
