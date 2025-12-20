import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// ============================================
// Supabase 配置
// ============================================

// Supabase Project URL
export const SUPABASE_URL = 'https://plnghuqosljnezjfpvmc.supabase.co';

// Supabase Anon Key（公開的，可以放在前端）
// 從 Supabase Dashboard > Settings > API > anon public 獲取
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsbmdodXFvc2xqbmV6amZwdm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTA3NTEsImV4cCI6MjA4MTU2Njc1MX0.XVhRSrkSlAuVE_MWvb7j2JI3vEzexTYUIbGGfmiQED8';

// 延遲初始化 Supabase 客戶端，避免在模塊加載時執行
let _supabase: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // 自動刷新 token
        autoRefreshToken: true,
        // 持久化 session
        persistSession: true,
        // 檢測 session 變化
        detectSessionInUrl: Platform.OS === 'web',
        // Web 平台使用 localStorage
        storage: Platform.OS === 'web' ? {
          getItem: (key: string) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key: string, value: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          },
          removeItem: (key: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          },
        } : undefined,
      },
    });
  }
  return _supabase;
};

// 導出 getter，確保延遲初始化
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createClient>];
  },
});

// ============================================
// OAuth 配置
// ============================================

// Google OAuth 重定向 URL
export const getGoogleRedirectUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'https://lunchips.com/auth/callback';
};

// Apple OAuth 重定向 URL
export const getAppleRedirectUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'https://lunchips.com/auth/callback';
};

// ============================================
// 類型定義
// ============================================

export interface SupabaseUser {
  id: string;
  email: string | null;
  phone: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  chips: number;
  created_at: string;
  updated_at: string;
}

export default supabase;

