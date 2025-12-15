import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// Firebase 配置
export const firebaseConfig = {
  apiKey: "AIzaSyBuAQUU2xrp8pk418EkKkiQVlIHvkd5-TE",
  authDomain: "lunchips-8c124.firebaseapp.com",
  projectId: "lunchips-8c124",
  storageBucket: "lunchips-8c124.firebasestorage.app",
  messagingSenderId: "710342782210",
  appId: "1:710342782210:web:e465f740cdaf700c67e61b",
  measurementId: "G-D2B547G98W"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Auth
export const auth = getAuth(app);

// 設定語言代碼（根據瀏覽器偏好或手動設定）
// 可以在組件中根據用戶選擇的語言動態更新
// 例如：auth.languageCode = 'zh-TW' 或 auth.useDeviceLanguage()
if (typeof navigator !== 'undefined' && navigator.language) {
  // 使用瀏覽器語言偏好
  auth.useDeviceLanguage();
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export default app;
