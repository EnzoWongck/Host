import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDICvGUSjJBd0PGzU6H0ZfuhUKt1FuGB9I",
  authDomain: "host-7b3ce.firebaseapp.com",
  projectId: "host-7b3ce",
  storageBucket: "host-7b3ce.firebasestorage.app",
  messagingSenderId: "1032628202581",
  appId: "1:1032628202581:web:1880f523d06b0cec28b8dc",
  measurementId: "G-N68W0RV2KV"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Apple Auth Provider
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export default app;
