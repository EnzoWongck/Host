import { Platform } from 'react-native';
import { Language } from '../types/language';

/**
 * 根據語言獲取對應的字體族
 * @param language 當前語言
 * @returns 字體族名稱，使用金萱體 65-75 中黑
 */
export const getFontFamily = (language: Language): string | undefined => {
  if (Platform.OS === 'web') {
    // Web 平台：使用金萱體（Jinxuan）65-75 中黑
    // 使用字由優設標題黑作為備用（免費字體）
    return '"Jinxuan 75", "Jinxuan 65", "字由優設標題黑", "Noto Sans TC", "PingFang TC", sans-serif';
  }
  // 移動平台：使用系統字體，但優先使用金萱體（如果已安裝）
  if (language === 'zh-CN') {
    return 'Microsoft YaHei';
  }
  // 繁體中文優先使用金萱體
  return 'Jinxuan';
};

/**
 * 根據語言獲取字體粗細
 * @param language 當前語言
 * @returns 字體粗細值，使用 700（粗體）以匹配金萱體 75 黑
 */
export const getFontWeight = (language: Language): '400' | '700' => {
  // 使用 700 以匹配金萱體 75 黑的視覺效果
  return '700';
};

