import AsyncStorage from '@react-native-async-storage/async-storage';

const FREE_GAME_KEY_PREFIX = 'userFreeGameUsed:';

// 檢查指定用戶是否已經使用過免費牌局
export const hasUsedFreeGame = async (uid: string): Promise<boolean> => {
  try {
    const key = `${FREE_GAME_KEY_PREFIX}${uid}`;
    const value = await AsyncStorage.getItem(key);
    return value === '1';
  } catch (error) {
    console.error('檢查免費牌局狀態失敗', error);
    // 讀取失敗時為了安全起見，當作已經用過，避免被濫用
    return true;
  }
};

// 標記用戶已經使用過免費牌局
export const markFreeGameUsed = async (uid: string): Promise<void> => {
  try {
    const key = `${FREE_GAME_KEY_PREFIX}${uid}`;
    await AsyncStorage.setItem(key, '1');
  } catch (error) {
    console.error('標記免費牌局狀態失敗', error);
  }
};




