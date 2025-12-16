import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { ENABLE_SUBSCRIPTION_MODE, FORCE_SUBSCRIBED } from '../config/dev';

interface SubscriptionContextType {
  isSubscribed: boolean;
  trialEnded: boolean;
  checkTrialStatus: () => Promise<void>;
  setSubscriptionStatus: (active: boolean) => void;
  forceTrialEnded: (ended: boolean) => void; // 強制設置試用到期狀態（用於測試）
  // 檢查是否可以新增牌局（基於牌局列表）
  canCreateNewGame: (games: any[]) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = (): SubscriptionContextType => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, isSignedIn } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [trialEnded, setTrialEnded] = useState<boolean>(false);

  // 檢查是否可以新增牌局（基於牌局數量和狀態）- 純函數，不更新狀態
  const canCreateNewGame = useCallback(
    (games: any[]) => {
      if (isSubscribed) {
        // 已訂閱，可以無限制新增
        return true;
      }

      // 一旦試用已標記為結束，無論目前有沒有牌局，都不能再新增
      if (trialEnded) {
        return false;
      }

      const gamesList = games || [];

      // 如果沒有牌局，且 trialEnded 還是 false，允許新增第一個
      if (gamesList.length === 0) {
        return true;
      }

      // 如果只有 1 個牌局
      if (gamesList.length === 1) {
        const game = gamesList[0];

        // 如果牌局還在進行中（active）
        if (game.status === 'active') {
          // 檢查是否超過 24 小時
          const startTime = new Date(game.startTime).getTime();
          const now = Date.now();
          const elapsed = now - startTime;
          const hours24 = 24 * 60 * 60 * 1000;

          if (elapsed > hours24) {
            // 超過 24 小時，不能新增第二個，並視為試用已結束
            return false;
          } else {
            // 未超過 24 小時，可以新增
            return true;
          }
        } else if (game.status === 'completed') {
          // 牌局已結束，不能新增第二個
          return false;
        }
      }

      // 如果有多個牌局，且未訂閱，檢查是否有超過 24 小時的 active 牌局或已結束的牌局
      if (gamesList.length >= 1) {
        const hasExpiredOrCompleted = gamesList.some((g) => {
          if (g.status === 'completed') return true;
          if (g.status === 'active') {
            const startTime = new Date(g.startTime).getTime();
            const now = Date.now();
            const elapsed = now - startTime;
            return elapsed > 24 * 60 * 60 * 1000;
          }
          return false;
        });

        if (hasExpiredOrCompleted) {
          return false;
        }
      }

      return true;
    },
    [isSubscribed, trialEnded],
  );

  // 檢查試用狀態（可接後端 API）
  const checkTrialStatus = useCallback(async () => {
    if (!isSignedIn || !user) {
      setTrialEnded(false);
      setIsSubscribed(false);
      return;
    }

    // 特殊處理：test@test.com 帳號強制設置為「未訂閱 + 已超過免費時間」
    if (user.email === 'test@test.com') {
      setIsSubscribed(false);
      setTrialEnded(true);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // 將該用戶標記為：未訂閱且試用已到期，並清除關閉 paywall 的紀錄
        localStorage.setItem(
          'subscription_status',
          JSON.stringify({ isSubscribed: false, trialEnded: true }),
        );
        localStorage.removeItem('paywall_closed_at');
      }
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        // 開發模式：如果強制已訂閱，直接設置為已訂閱狀態
        if (FORCE_SUBSCRIBED && window.location.hostname === 'localhost') {
          setIsSubscribed(true);
          setTrialEnded(false);
          localStorage.setItem('subscription_status', JSON.stringify({ isSubscribed: true, trialEnded: false }));
          return;
        }

        // 開發模式：如果啟用訂閱模式測試，強制設置試用到期
        if (ENABLE_SUBSCRIPTION_MODE && window.location.hostname === 'localhost') {
          // 檢查是否已訂閱（從快取）
          const cachedStatus = localStorage.getItem('subscription_status');
          const cachedIsSubscribed = cachedStatus ? JSON.parse(cachedStatus).isSubscribed : false;
          
          if (!cachedIsSubscribed) {
            // 未訂閱，設置試用到期
            setTrialEnded(true);
            setIsSubscribed(false);
            return;
          } else {
            // 已訂閱，正常流程
            setIsSubscribed(true);
            setTrialEnded(false);
            return;
          }
        }

        // 先檢查本地快取
        const cachedStatus = localStorage.getItem('subscription_status');
        if (cachedStatus) {
          const parsed = JSON.parse(cachedStatus);
          setIsSubscribed(parsed.isSubscribed || false);
        }

        // 呼叫後端 API 檢查試用狀態（未來實作）
        // const response = await fetch('/api/check-trial-status', {
        //   method: 'GET',
        //   headers: { 'Content-Type': 'application/json' },
        // });
        // const data = await response.json();
        // setIsSubscribed(data.isPro || false);
      } catch (error) {
        console.error('檢查試用狀態失敗', error);
      }
    } else {
      // 非 Web 平台暫時不檢查
      setTrialEnded(false);
    }
  }, [isSignedIn, user]);

  // 設定訂閱狀態
  const setSubscriptionStatus = useCallback((active: boolean) => {
    // 特殊處理：test@test.com 帳號無法設置為已訂閱
    if (user?.email === 'test@test.com') {
      setIsSubscribed(false);
      setTrialEnded(false);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem('subscription_status', JSON.stringify({ isSubscribed: false, trialEnded: false }));
      }
      console.log('test@test.com 帳號無法設置為已訂閱狀態');
      return;
    }

    setIsSubscribed(active);
    if (active) {
      setTrialEnded(false); // 已訂閱，試用不會到期
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem('subscription_status', JSON.stringify({ isSubscribed: true, trialEnded: false }));
      }
    }
  }, [user]);

  // 強制設置試用到期狀態（用於測試）
  const forceTrialEnded = useCallback((ended: boolean) => {
    setTrialEnded(ended);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // 清除關閉記錄，確保 paywall 可以顯示
      if (ended) {
        localStorage.removeItem('paywall_closed_at');
      }
    }
  }, []);

  // 登入時檢查試用狀態
  useEffect(() => {
    if (isSignedIn && user) {
      checkTrialStatus();
    } else if (!isSignedIn) {
      // 登出時重置狀態
      setTrialEnded(false);
      setIsSubscribed(false);
    }
    // 移除 checkTrialStatus 依賴，避免無限迴圈
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);


  // 定期檢查（每 5 分鐘）
  useEffect(() => {
    if (!isSignedIn || !user) return;
    const interval = setInterval(() => {
      checkTrialStatus();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // 移除 checkTrialStatus 依賴，避免無限迴圈
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  // 監聽 PayPal 訂閱成功事件
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePayPalSuccess = (event: any) => {
        const subscriptionID = event.detail?.subscriptionID;
        if (subscriptionID) {
          console.log('收到 PayPal 訂閱成功事件:', subscriptionID);
          setSubscriptionStatus(true);
        }
      };

      window.addEventListener('paypal-subscription-success', handlePayPalSuccess as EventListener);

      return () => {
        window.removeEventListener('paypal-subscription-success', handlePayPalSuccess as EventListener);
      };
    }
  }, [setSubscriptionStatus]);

  // 在 Web 平台上，將方法暴露到 window 對象，方便在控制台調用
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (window as any).__openPaywall = () => {
        forceTrialEnded(true);
        setIsSubscribed(false);
      };
      (window as any).__closePaywall = () => {
        forceTrialEnded(false);
      };
    }
  }, [forceTrialEnded]);

  const value = React.useMemo<SubscriptionContextType>(
    () => ({
      isSubscribed,
      trialEnded,
      canCreateNewGame,
      checkTrialStatus,
      setSubscriptionStatus,
      forceTrialEnded,
    }),
    [isSubscribed, trialEnded, canCreateNewGame, checkTrialStatus, setSubscriptionStatus, forceTrialEnded]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

