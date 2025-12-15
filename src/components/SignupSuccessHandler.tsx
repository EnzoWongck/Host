import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface SignupSuccessHandlerProps {
  shouldClear: boolean;
  onCleared: () => void;
}

/**
 * 內部組件：處理註冊成功後的遊戲數據清除
 * 必須在 GameProvider 內部使用
 */
export const SignupSuccessHandler: React.FC<SignupSuccessHandlerProps> = ({ shouldClear, onCleared }) => {
  const { clearAllGames } = useGame();

  useEffect(() => {
    if (shouldClear && clearAllGames) {
      // 清除所有遊戲數據（包括可能存在的 test 牌局）
      clearAllGames();
      onCleared();
    }
  }, [shouldClear, clearAllGames, onCleared]);

  return null;
};

