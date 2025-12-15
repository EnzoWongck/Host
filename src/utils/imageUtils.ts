import { Platform } from 'react-native';

/**
 * 統一處理圖片資源加載，確保在 Web 平台上能正確顯示
 * @param imageRequire - require() 返回的圖片資源
 * @returns 適合當前平台的圖片源
 */
export const resolveImageSource = (imageRequire: any) => {
  // Web 平台上，resolveAssetSource 不可用，直接返回 require 的結果
  // Expo Web 會自動處理圖片資源
  if (Platform.OS === 'web') {
    return imageRequire;
  }
  
  // 在原生平台上，嘗試使用 resolveAssetSource（如果可用）
  // 使用動態導入避免在 Web 平台上載入 Image 模塊時觸發錯誤
  try {
    // 只在非 Web 平台上才嘗試訪問 resolveAssetSource
    const Image = require('react-native').Image;
    if (Image && Image.resolveAssetSource && typeof Image.resolveAssetSource === 'function') {
      const resolved = Image.resolveAssetSource(imageRequire);
      if (resolved && resolved.uri) {
        return resolved;
      }
      return resolved || imageRequire;
    }
  } catch (error) {
    // 如果 resolveAssetSource 不可用，直接返回 require 的結果
    console.warn('resolveAssetSource 不可用，使用原始 require 結果', error);
  }
  
  // 如果 resolveAssetSource 不可用，直接返回 require 的結果
  return imageRequire;
};

