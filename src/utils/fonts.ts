import { Platform } from 'react-native';
import { Language } from '../types/language';

/**
 * 根據語言獲取對應的字體族
 * @param language 當前語言
 * @returns 字體族名稱，如果不需要特殊字體則返回 undefined
 */
export const getFontFamily = (language: Language): string | undefined => {
  if (language === 'zh-CN') {
    // 簡體中文使用微軟正黑體（Microsoft YaHei / 微軟雅黑），並設置為粗體
    if (Platform.OS === 'web') {
      // Web 平台：使用完整的字體堆疊，包含備用字體，並設置 font-weight: bold
      return '"Microsoft YaHei", "Microsoft YaHei UI", "微软雅黑", "SimHei", sans-serif';
    }
    // 移動平台：返回字體名稱，讓 React Native 處理
    // 注意：移動平台可能需要額外的字體文件配置
    return 'Microsoft YaHei';
  }
  // 繁體中文使用默認字體
  return undefined;
};

/**
 * 根據語言獲取字體粗細
 * @param language 當前語言
 * @returns 字體粗細值，繁體中文和簡體中文都返回 '400'（正常字體）
 */
export const getFontWeight = (language: Language): '400' | '700' => {
  // 繁體中文和簡體中文都使用正常字體
  return '400';
};

