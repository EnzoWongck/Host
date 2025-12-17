import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { STRIPE_API_ENDPOINTS, CHIPS_CONFIG, CHIPS_PACKAGES, ChipsPackage } from '../config/stripe';

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

    try {
      setLoading(true);
      const baseUrl = getApiBaseUrl();
      const response = await fetch(
        `${baseUrl}${STRIPE_API_ENDPOINTS.GET_BALANCE}?userId=${user.uid}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load chips balance');
      }
      
      const data = await response.json();
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

    try {
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

    if (chips < 1) {
      setShowPurchaseModal(true);
      return false;
    }

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}${STRIPE_API_ENDPOINTS.CONSUME_CHIP}`, {
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

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          // Chips 不足
          setShowPurchaseModal(true);
          return false;
        }
        throw new Error(data.error || 'Failed to consume chip');
      }

      // 更新本地狀態
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

      console.log(`成功消耗 1 Chip，剩餘 ${data.remainingChips}，有效至 ${data.expiresAt}`);
      return true;

    } catch (error) {
      console.error('消耗 Chip 失敗:', error);
      return false;
    }
  }, [isSignedIn, user, chips, getApiBaseUrl]);

  // 創建 Stripe Checkout Session
  const createCheckoutSession = useCallback(async (packageItem: ChipsPackage): Promise<string | null> => {
    if (!isSignedIn || !user?.uid) {
      console.error('用戶未登入');
      return null;
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
  }, [isSignedIn, user, getApiBaseUrl]);

  // ============================================
  // 計時器
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
      expiryTimerRef.current = setTimeout(() => {
        console.log('Chip 已過期');
        setIsGameLocked(true);
        setShowExpiredModal(true);
        setGameChipStatus({
          hasValidChip: false,
          needsChip: true,
          reason: 'chip_expired',
        });
      }, timeUntilExpiry);
    }
  }, []);

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

