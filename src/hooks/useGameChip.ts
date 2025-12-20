import { useEffect, useRef, useCallback } from 'react';
import { useChips } from '../context/ChipsContext';
import { CHIPS_CONFIG } from '../config/stripe';

interface UseGameChipOptions {
  gameId: string;
  gameStartTime: Date | string;
  enabled?: boolean;
}

interface UseGameChipResult {
  isLocked: boolean;
  remainingMinutes: number | null;
  shouldWarn: boolean;
  consumeChipForGame: () => Promise<boolean>;
  checkStatus: () => Promise<void>;
}

/**
 * Hook 用於管理遊戲的 Chip 狀態
 * 
 * 功能：
 * 1. 創建遊戲時自動檢查是否需要消耗 Chip
 * 2. 每 12 小時檢查一次是否需要續費
 * 3. 到期前 30 分鐘發出警告
 * 4. 到期後鎖定編輯功能
 */
export function useGameChip({
  gameId,
  gameStartTime,
  enabled = true,
}: UseGameChipOptions): UseGameChipResult {
  const {
    isGameLocked,
    gameChipStatus,
    checkGameChipStatus,
    consumeChip,
    openExpiredModal,
  } = useChips();

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedRef = useRef(false);

  // 計算遊戲已進行的時間
  const getGameDurationMs = useCallback(() => {
    const start = new Date(gameStartTime).getTime();
    return Date.now() - start;
  }, [gameStartTime]);

  // 計算需要消耗多少個 Chip（每 12 小時一個）
  const getRequiredChipPeriods = useCallback(() => {
    const durationMs = getGameDurationMs();
    return Math.floor(durationMs / CHIPS_CONFIG.CHIP_VALIDITY_DURATION);
  }, [getGameDurationMs]);

  // 檢查遊戲的 Chip 狀態
  const checkStatus = useCallback(async () => {
    if (!enabled || !gameId) return;

    try {
      const status = await checkGameChipStatus(gameId);
      
      // 如果需要 Chip，顯示過期彈窗
      if (status.needsChip) {
        openExpiredModal();
      }
    } catch (error) {
      console.error('檢查遊戲 Chip 狀態失敗:', error);
    }
  }, [enabled, gameId, checkGameChipStatus, openExpiredModal]);

  // 為遊戲消耗 Chip
  const consumeChipForGame = useCallback(async (): Promise<boolean> => {
    if (!gameId) return false;
    
    const success = await consumeChip(gameId, 'game_session');
    return success;
  }, [gameId, consumeChip]);

  // 首次進入遊戲時檢查狀態
  useEffect(() => {
    if (!enabled || !gameId || hasCheckedRef.current) return;

    hasCheckedRef.current = true;
    checkStatus();

    // 設置定期檢查（每 5 分鐘檢查一次）
    checkIntervalRef.current = setInterval(() => {
      checkStatus();
    }, 5 * 60 * 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [enabled, gameId, checkStatus]);

  // 當 gameId 改變時重置檢查狀態
  useEffect(() => {
    hasCheckedRef.current = false;
  }, [gameId]);

  return {
    isLocked: isGameLocked,
    remainingMinutes: gameChipStatus?.remainingMinutes ?? null,
    shouldWarn: gameChipStatus?.shouldWarn ?? false,
    consumeChipForGame,
    checkStatus,
  };
}

export default useGameChip;


