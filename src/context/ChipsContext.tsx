import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import { STRIPE_API_ENDPOINTS, CHIPS_CONFIG, CHIPS_PACKAGES, ChipsPackage } from '../config/stripe';

// 檢測是否為本地開發環境
const isLocalDev = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

// 開發者帳戶白名單（這些帳戶不消耗 Chips）
const DEVELOPER_EMAILS = [
  'pokerhostdeveloper@gmail.com',
  'viviankwok2002@gmail.com',
];

// 檢查是否為開發者帳戶
const isDeveloperAccount = (email?: string | null): boolean => {
  if (!email) return false;
  return DEVELOPER_EMAILS.includes(email.toLowerCase());
};

// ============================================
// Types
// ============================================
interface GameChipStatus {
  hasValidChip: boolean;
  needsChip: boolean;
  expiresAt?: string;
  remainingMinutes?: number;
  remainingHours?: number;
  shouldWarn?: boolean;
  reason?: string;
}

interface ChipsContextType {
  // 狀態
  chips: number;
  loading: boolean;
  isNewUser: boolean;
  
  // 遊戲 Chip 狀態
  gameChipStatus: GameChipStatus | null;
  isGameLocked: boolean;
  
  // Modal 控制
  showPurchaseModal: boolean;
  showExpiredModal: boolean;
  
  // 方法
  loadChipsBalance: () => Promise<void>;
  checkGameChipStatus: (gameId: string) => Promise<GameChipStatus>;
  consumeChip: (gameId: string, reason?: string) => Promise<boolean>;
  openPurchaseModal: () => void;
  closePurchaseModal: () => void;
  openExpiredModal: () => void;
  closeExpiredModal: () => void;
  createCheckoutSession: (packageItem: ChipsPackage) => Promise<string | null>;
  
  // 套餐
  packages: ChipsPackage[];
}

const ChipsContext = createContext<ChipsContextType | undefined>(undefined);

export const useChips = (): ChipsContextType => {
  const ctx = useContext(ChipsContext);
  if (!ctx) throw new Error('useChips must be used within ChipsProvider');
  return ctx;
};

// ============================================
// Provider
// ============================================
interface ChipsProviderProps {
  children: React.ReactNode;
}

export const ChipsProvider: React.FC<ChipsProviderProps> = ({ children }) => {
  const { user, isSignedIn } = useAuth();
  
  // 狀態
  const [chips, setChips] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [gameChipStatus, setGameChipStatus] = useState<GameChipStatus | null>(null);
  const [isGameLocked, setIsGameLocked] = useState<boolean>(false);
  
  // Modal 狀態
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [showExpiredModal, setShowExpiredModal] = useState<boolean>(false);
  
  // 計時器
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // 計時器（提前定義，避免 TDZ 問題）
  // ============================================
  const setupExpiryTimers = useCallback((expiresAt: string, gameId: string) => {
    // 清除舊計時器
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    const timeUntilWarning = timeUntilExpiry - CHIPS_CONFIG.REMINDER_BEFORE_EXPIRY;

    // 設置警告計時器（到期前 30 分鐘）
    if (timeUntilWarning > 0) {
      warningTimerRef.current = setTimeout(() => {
        console.log('Chip 即將過期警告');
        // 可以在這裡顯示警告通知
      }, timeUntilWarning);
    }

    // 設置過期計時器
    if (timeUntilExpiry > 0) {
      expiryTimerRef.current = setTimeout(async () => {
        console.log('Chip 已過期，檢查是否需要自動消耗新的 chip');
        setIsGameLocked(true);
        setShowExpiredModal(true);
        setGameChipStatus({
          hasValidChip: false,
          needsChip: true,
          reason: 'chip_expired',
        });
        
        // 如果用戶有 chips，自動消耗一個（12小時後自動續費）
        // 注意：這裡不自動消耗，而是顯示 modal 讓用戶選擇
        // 因為用戶可能想先查看數據再決定是否續費
      }, timeUntilExpiry);
    }
  }, []);

  // ============================================
  // API 調用
  // ============================================
  
  // 獲取 API base URL
  const getApiBaseUrl = useCallback(() => {
    if (Platform.OS !== 'web') return '';
    if (typeof window === 'undefined') return '';
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return ''; // 本地開發使用相對路徑
    }
    return ''; // 生產環境也使用相對路徑（同域名）
  }, []);

  // 載入 Chips 餘額
  const loadChipsBalance = useCallback(async () => {
    if (!isSignedIn || !user?.uid) {
      setChips(0);
      setLoading(false);
      return;
    }

    // 開發者帳戶：無限 Chips
    if (isDeveloperAccount(user.email)) {
      console.log('🛠️ 開發者帳戶已登入，無限 Chips');
      setChips(99999);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 本地開發環境：直接使用 Supabase
      if (isLocalDev()) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('chips')
          .eq('id', user.uid)
          .single();
        
        if (error) {
          // 如果用戶不存在，創建新用戶並給予 1 個免費 Chip
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({ id: user.uid, chips: 1 })
              .select('chips')
              .single();
            
            if (!insertError && newProfile) {
              setChips(newProfile.chips);
              setIsNewUser(true);
              console.log('新用戶已創建，獲得 1 個免費 Chip');
              return;
            }
          }
          throw error;
        }
        
        setChips(profile?.chips || 0);
        return;
      }
      
      // 生產環境：使用 API
      const baseUrl = getApiBaseUrl();
      const response = await fetch(
        `${baseUrl}${STRIPE_API_ENDPOINTS.GET_BALANCE}?userId=${user.uid}`
      );
      
      if (!response.ok) {
        // 如果 API 失敗，嘗試直接從 Supabase 查詢（作為備用方案）
        console.warn('API 載入 chips 失敗，嘗試直接從 Supabase 查詢');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('chips')
          .eq('id', user.uid)
          .maybeSingle();
        
        if (!profileError && profile) {
          setChips(profile.chips || 0);
          return;
        }
        
        throw new Error('Failed to load chips balance');
      }
      
      // 檢查響應是否為 JSON
      const contentType = response.headers.get('content-type');
      let data: any;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('API 返回非 JSON 響應:', text);
        throw new Error(`API 返回錯誤: ${response.status} ${response.statusText}`);
      }
      
      setChips(data.chips || 0);
      setIsNewUser(data.isNewUser || false);
      
      if (data.isNewUser && data.message) {
        console.log(data.message);
      }
    } catch (error) {
      console.error('載入 Chips 餘額失敗:', error);
      // 從本地存儲獲取備份
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`chips_${user.uid}`);
          if (cached) {
            setChips(parseInt(cached, 10) || 0);
          }
        } catch (e) {
          console.error('讀取本地快取失敗:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user, getApiBaseUrl]);

  // 檢查遊戲的 Chip 狀態
  const checkGameChipStatus = useCallback(async (gameId: string): Promise<GameChipStatus> => {
    if (!isSignedIn || !user?.uid) {
      return { hasValidChip: false, needsChip: true, reason: 'not_signed_in' };
    }

    // 開發者帳戶：永遠有效
    if (isDeveloperAccount(user.email)) {
      const status: GameChipStatus = {
        hasValidChip: true,
        needsChip: false,
        remainingHours: 9999,
        reason: 'developer_account',
      };
      setGameChipStatus(status);
      setIsGameLocked(false);
      return status;
    }

    try {
      // 本地開發環境：直接使用 Supabase
      if (isLocalDev()) {
        const { data: chipRecord, error } = await supabase
          .from('game_chips')
          .select('*')
          .eq('user_id', user.uid)
          .eq('game_id', gameId)
          .order('consumed_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error || !chipRecord) {
          // 沒有記錄，需要消耗 Chip
          const status: GameChipStatus = { hasValidChip: false, needsChip: true, reason: 'no_chip_record' };
          setGameChipStatus(status);
          setIsGameLocked(true);
          return status;
        }
        
        const expiresAt = new Date(chipRecord.expires_at);
        const now = new Date();
        const hasValidChip = expiresAt > now;
        const remainingMs = expiresAt.getTime() - now.getTime();
        const remainingMinutes = Math.floor(remainingMs / 60000);
        const remainingHours = Math.floor(remainingMinutes / 60);
        
        const status: GameChipStatus = {
          hasValidChip,
          needsChip: !hasValidChip,
          expiresAt: chipRecord.expires_at,
          remainingMinutes,
          remainingHours,
          shouldWarn: remainingMinutes < 30 && remainingMinutes > 0,
          reason: hasValidChip ? 'valid' : 'expired',
        };
        
        setGameChipStatus(status);
        setIsGameLocked(!hasValidChip);
        
        if (hasValidChip && status.expiresAt) {
          setupExpiryTimers(status.expiresAt, gameId);
        }
        
        return status;
      }
      
      // 生產環境：使用 API
      const baseUrl = getApiBaseUrl();
      const response = await fetch(
        `${baseUrl}/api/chips/game-status?userId=${user.uid}&gameId=${gameId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check game chip status');
      }
      
      const status: GameChipStatus = await response.json();
      setGameChipStatus(status);
      setIsGameLocked(!status.hasValidChip);
      
      // 設置過期提醒計時器
      if (status.hasValidChip && status.expiresAt) {
        setupExpiryTimers(status.expiresAt, gameId);
      }
      
      return status;
    } catch (error) {
      console.error('檢查遊戲 Chip 狀態失敗:', error);
      return { hasValidChip: false, needsChip: true, reason: 'error' };
    }
  }, [isSignedIn, user, getApiBaseUrl]);

  // 消耗 Chip
  const consumeChip = useCallback(async (gameId: string, reason?: string): Promise<boolean> => {
    if (!isSignedIn || !user?.uid) {
      console.error('用戶未登入');
      return false;
    }

    // 開發者帳戶：不消耗 Chips
    if (isDeveloperAccount(user.email)) {
      console.log('🛠️ 開發者帳戶，跳過 Chip 消耗');
      setIsGameLocked(false);
      setShowExpiredModal(false);
      return true;
    }

    if (chips < 1) {
      setShowPurchaseModal(true);
      return false;
    }

    try {
      // 本地開發環境：直接使用 Supabase
      if (isLocalDev()) {
        // 1. 扣除用戶的 chips
        const newChips = chips - 1;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ chips: newChips })
          .eq('id', user.uid);
        
        if (updateError) throw updateError;
        
        // 2. 創建 game_chips 記錄
        const expiresAt = new Date(Date.now() + CHIPS_CONFIG.GAME_SESSION_DURATION);
        const { error: insertError } = await supabase
          .from('game_chips')
          .insert({
            user_id: user.uid,
            game_id: gameId,
            expires_at: expiresAt.toISOString(),
            reason: reason || 'game_session',
          });
        
        if (insertError) throw insertError;
        
        // 更新本地狀態（立即反映）
        setChips(newChips);
        setIsGameLocked(false);
        setShowExpiredModal(false);
        
        // 快取到本地
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          localStorage.setItem(`chips_${user.uid}`, String(newChips));
        }
        
        // 設置過期計時器
        setupExpiryTimers(expiresAt.toISOString(), gameId);
        
        // 重新檢查遊戲 chip 狀態，確保狀態同步
        await checkGameChipStatus(gameId);
        
        console.log(`✅ 成功消耗 1 Chip，剩餘 ${newChips}，有效至 ${expiresAt.toISOString()}`);
        return true;
      }
      
      // 生產環境：使用 API
      const baseUrl = getApiBaseUrl();
      let response: Response;
      let data: any;
      
      try {
        response = await fetch(`${baseUrl}${STRIPE_API_ENDPOINTS.CONSUME_CHIP}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            gameId: gameId,
            reason: reason || 'game_session',
          }),
        });

        // 檢查響應是否為 JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('API 返回非 JSON 響應:', text);
          throw new Error(`API 返回錯誤: ${response.status} ${response.statusText}`);
        }
      } catch (fetchError) {
        console.error('調用 consume chip API 失敗:', fetchError);
        throw fetchError;
      }

      if (!response.ok) {
        if (response.status === 402) {
          // Chips 不足
          setShowPurchaseModal(true);
          return false;
        }
        const errorMessage = data?.error || `API 錯誤: ${response.status} ${response.statusText}`;
        console.error('消耗 Chip API 錯誤:', errorMessage, 'Response data:', data);
        throw new Error(errorMessage);
      }

      // 檢查返回的 success 字段
      if (data.success === false) {
        console.error('消耗 Chip 失敗，API 返回 success: false', data);
        if (data.error === 'Insufficient chips' || response.status === 402) {
          setShowPurchaseModal(true);
        }
        return false;
      }

      // 檢查返回數據是否有效
      if (data.remainingChips === undefined || data.remainingChips === null) {
        console.error('API 返回的 remainingChips 無效:', data);
        throw new Error('API 返回數據無效：缺少 remainingChips');
      }

      // 更新本地狀態（立即反映）
      setChips(data.remainingChips);
      setIsGameLocked(false);
      setShowExpiredModal(false);
      
      // 快取到本地
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(`chips_${user.uid}`, String(data.remainingChips));
      }

      // 設置過期計時器
      if (data.expiresAt) {
        setupExpiryTimers(data.expiresAt, gameId);
      }

      // 重新檢查遊戲 chip 狀態，確保狀態同步
      await checkGameChipStatus(gameId);

      console.log(`✅ 成功消耗 1 Chip，剩餘 ${data.remainingChips}，有效至 ${data.expiresAt}`);
      return true;

    } catch (error) {
      console.error('消耗 Chip 失敗:', error);
      return false;
    }
  }, [isSignedIn, user, chips, getApiBaseUrl, checkGameChipStatus, setupExpiryTimers]);

  // 創建 Stripe Checkout Session
  const createCheckoutSession = useCallback(async (packageItem: ChipsPackage): Promise<string | null> => {
    if (!isSignedIn || !user?.uid) {
      console.error('用戶未登入');
      return null;
    }

    // 本地開發環境：模擬購買（直接增加 Chips）
    if (isLocalDev()) {
      console.log('本地開發模式：模擬購買 Chips');
      const confirm = window.confirm(
        `本地開發模式\n\n模擬購買 ${packageItem.chips} Chips（$${packageItem.priceHKD} HKD）？\n\n注意：實際付款功能需要部署到 Vercel 後才能使用。`
      );
      
      if (confirm) {
        // 直接更新 Supabase 中的 chips
        const { data, error } = await supabase
          .from('profiles')
          .update({ chips: chips + packageItem.chips })
          .eq('id', user.uid)
          .select('chips')
          .single();
        
        if (!error && data) {
          setChips(data.chips);
          alert(`模擬購買成功！已增加 ${packageItem.chips} Chips，目前餘額：${data.chips} Chips`);
        }
      }
      return null; // 不跳轉
    }

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}${STRIPE_API_ENDPOINTS.CREATE_CHECKOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: packageItem.priceId,
          userId: user.uid,
          userEmail: user.email,
          successUrl: `${window.location.origin}/?payment=success`,
          cancelUrl: `${window.location.origin}/?payment=cancelled`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      return data.url;

    } catch (error) {
      console.error('創建 Checkout Session 失敗:', error);
      return null;
    }
  }, [isSignedIn, user, chips, getApiBaseUrl]);

  // ============================================
  // Modal 控制
  // ============================================
  const openPurchaseModal = useCallback(() => setShowPurchaseModal(true), []);
  const closePurchaseModal = useCallback(() => setShowPurchaseModal(false), []);
  const openExpiredModal = useCallback(() => setShowExpiredModal(true), []);
  const closeExpiredModal = useCallback(() => setShowExpiredModal(false), []);

  // ============================================
  // Effects
  // ============================================
  
  // 登入時載入餘額
  useEffect(() => {
    if (isSignedIn && user) {
      loadChipsBalance();
    } else {
      setChips(0);
      setLoading(false);
      setIsNewUser(false);
    }
  }, [isSignedIn, user, loadChipsBalance]);

  // 監聽支付成功
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handlePaymentSuccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success') {
        console.log('支付成功，重新載入餘額');
        loadChipsBalance();
        // 清除 URL 參數
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handlePaymentSuccess();
    window.addEventListener('popstate', handlePaymentSuccess);

    return () => {
      window.removeEventListener('popstate', handlePaymentSuccess);
    };
  }, [loadChipsBalance]);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  // ============================================
  // Context Value
  // ============================================
  const value = React.useMemo<ChipsContextType>(() => ({
    chips,
    loading,
    isNewUser,
    gameChipStatus,
    isGameLocked,
    showPurchaseModal,
    showExpiredModal,
    loadChipsBalance,
    checkGameChipStatus,
    consumeChip,
    openPurchaseModal,
    closePurchaseModal,
    openExpiredModal,
    closeExpiredModal,
    createCheckoutSession,
    packages: CHIPS_PACKAGES,
  }), [
    chips,
    loading,
    isNewUser,
    gameChipStatus,
    isGameLocked,
    showPurchaseModal,
    showExpiredModal,
    loadChipsBalance,
    checkGameChipStatus,
    consumeChip,
    openPurchaseModal,
    closePurchaseModal,
    openExpiredModal,
    closeExpiredModal,
    createCheckoutSession,
  ]);

  return (
    <ChipsContext.Provider value={value}>
      {children}
    </ChipsContext.Provider>
  );
};

export default ChipsContext;

