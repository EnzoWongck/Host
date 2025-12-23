import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ScrollView,
  Platform,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

// 使用初始螢幕尺寸，防止鍵盤彈出時導致視窗跳動
const getInitialDimensions = () => {
  // 優先使用 screen 尺寸（不受鍵盤影響）
  const screen = Dimensions.get('screen');
  const window = Dimensions.get('window');
  return {
    width: screen.width || window.width,
    height: screen.height || window.height,
  };
};

const initialDimensions = getInitialDimensions();

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  closeOnBackdropPress?: boolean;
  leftIconName?: string;
  fullScreen?: boolean;
  maxWidth?: number | string;
  maxHeight?: number | string;
  containerStyle?: any;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  closeOnBackdropPress = true,
  leftIconName,
  fullScreen = false,
  maxWidth,
  maxHeight,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 使用初始螢幕尺寸，不隨鍵盤變化
  // 這樣可以防止鍵盤彈出時 Modal 跳動
  const [dimensions] = useState(() => {
    // 在 Web 平台上，使用 visualViewport 或 innerHeight 的最大值
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const vh = Math.max(
        window.innerHeight || 0,
        document.documentElement?.clientHeight || 0,
        window.visualViewport?.height || 0
      );
      const vw = Math.max(
        window.innerWidth || 0,
        document.documentElement?.clientWidth || 0
      );
      return { width: vw, height: vh };
    }
    return initialDimensions;
  });

  const screenWidth = dimensions.width;
  const screenHeight = dimensions.height;
  const isMobile = screenWidth < 768; // 判斷是否為手機

  // 計算響應式的 maxWidth 和 maxHeight
  const responsiveMaxWidth = maxWidth ?? (isMobile ? screenWidth - 32 : 800);
  // 對於手機，使用固定高度值而不是百分比，防止鍵盤彈出時視窗縮短
  const responsiveMaxHeight = maxHeight ?? (isMobile ? screenHeight * 0.9 : '95%');
  const responsiveContainerStyle = containerStyle ?? (isMobile ? { width: screenWidth - 32, maxWidth: screenWidth - 32 } : undefined);

  // 計算 Web 平台的最大高度和寬度，確保視窗完全在螢幕內
  const webPadding = isMobile ? 16 : (theme.spacing.md * 2);
  const calculatedMaxHeight = fullScreen ? screenHeight : (
    typeof responsiveMaxHeight === 'number' 
      ? Math.min(responsiveMaxHeight, screenHeight - webPadding)
      : (typeof responsiveMaxHeight === 'string' && responsiveMaxHeight.includes('%')
        ? Math.min(parseFloat(responsiveMaxHeight) / 100 * screenHeight, screenHeight - webPadding)
        : Math.min(screenHeight * 0.9, screenHeight - webPadding))
  );
  const calculatedMaxWidth = fullScreen ? screenWidth : (
    typeof responsiveMaxWidth === 'number' 
      ? Math.min(responsiveMaxWidth, screenWidth - webPadding)
      : (typeof responsiveMaxWidth === 'string' && responsiveMaxWidth.includes('%')
        ? Math.min(parseFloat(responsiveMaxWidth) / 100 * screenWidth, screenWidth - webPadding)
        : Math.min(screenWidth - webPadding, 800))
  );

  const styles = StyleSheet.create({
    overlay: {
      position: Platform.OS === 'web' ? 'fixed' : 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: fullScreen ? theme.colors.background : 'rgba(0, 0, 0, 0.6)',
      justifyContent: fullScreen ? 'flex-start' : 'center',
      alignItems: 'center',
      padding: fullScreen ? 0 : (isMobile ? 8 : theme.spacing.md),
      zIndex: Platform.OS === 'web' ? 9999 : 1000,
      ...(Platform.OS === 'web' && {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: fullScreen ? 'flex-start' : 'center',
        alignItems: 'center',
        backgroundColor: fullScreen 
          ? (theme.colorMode === 'light' ? '#FFFFFF' : theme.colors.background)
          : 'rgba(0, 0, 0, 0.6)',
        margin: 0,
      }),
    },
    modalContainer: {
      backgroundColor: theme.colorMode === 'light' ? '#FFFFFF' : theme.colors.background,
      borderRadius: fullScreen ? 0 : theme.borderRadius.lg,
      width: '100%',
      maxWidth: fullScreen ? '100%' : responsiveMaxWidth,
      height: fullScreen ? '100%' : undefined,
      // 確保使用固定高度值，防止鍵盤彈出時視窗縮短，且不超過視窗高度
      maxHeight: fullScreen ? '100%' : (
        typeof responsiveMaxHeight === 'string' && responsiveMaxHeight.includes('%') 
          ? Math.min(isMobile ? screenHeight * 0.9 : parseFloat(responsiveMaxHeight) / 100 * screenHeight, screenHeight * 0.9)
          : Math.min(typeof responsiveMaxHeight === 'number' ? responsiveMaxHeight : screenHeight * 0.9, screenHeight * 0.9)
      ),
      ...(Platform.OS === 'web' ? {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative', // 依賴 overlay 的 flex 置中
        zIndex: 10000,
        maxHeight: calculatedMaxHeight,
        maxWidth: calculatedMaxWidth,
        margin: 0,
      } : { 
        overflow: 'hidden',
        zIndex: 1001,
      }),
      // 多層柔和陰影
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: fullScreen ? 0 : 0.15,
      shadowRadius: fullScreen ? 0 : 24,
      elevation: fullScreen ? 0 : 16,
      ...(Platform.OS === 'web' && !fullScreen && {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing.xl,
      paddingRight: theme.spacing.md, // 增加右側間距
      paddingVertical: theme.spacing.md, // 增加上下間距
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.xl,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    titleIcon: {
      marginRight: theme.spacing.sm,
    },
    closeButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: 'transparent', // 無背景
      minWidth: 32,
      minHeight: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      fontSize: theme.fontSize.xl, // X 號字體稍大
      fontWeight: '300', // 細字體
      color: theme.colors.textSecondary,
      lineHeight: theme.fontSize.xl,
    },
    content: {
      padding: theme.spacing.lg, // 回復視窗內邊距
      flex: 1,
      ...(Platform.OS === 'web' && {
        overflow: 'auto', // Web 平台允許滾動
        scrollbarWidth: 'none', // Firefox 隱藏滾輪
        msOverflowStyle: 'none', // IE/Edge 隱藏滾輪
      }),
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: theme.spacing.xl, // 增加底部間距確保按鈕陰影完整顯示
      paddingHorizontal: 0, // 移除水平 padding，讓內容可以使用自己的 padding
      ...(maxWidth && typeof maxWidth === 'number' ? { maxWidth: maxWidth - (theme.spacing.lg * 2), alignSelf: 'center', width: '100%' } : {}),
    },
  });

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  // 設置統一的背景顏色，確保鍵盤彈出時的空白區域顏色一致（使用淡化背景）
  // 並添加 CSS 樣式隱藏滾輪
  useEffect(() => {
    if (!visible) return;

    if (Platform.OS === 'web') {
      // 添加 CSS 樣式隱藏滾輪
      const styleId = 'modal-scrollbar-hide';
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
          /* 隱藏所有瀏覽器的滾輪 */
          [data-modal-container] *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          [data-modal-container] * {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `;
        document.head.appendChild(styleElement);
      }
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      const rootElement = document.getElementById('root');
      
      // 獲取當前主題的背景顏色，如果是非全屏 Modal，使用淡化背景
      const baseBackgroundColor = theme.colorMode === 'light' ? '#FFFFFF' : theme.colors.background;
      // 使用與 overlay 相同的淡化背景（rgba(0, 0, 0, 0.6)）
      // 在 light mode 下，計算 rgba(0, 0, 0, 0.6) 在白色背景上的混合顏色：0.6 * 0 + 0.4 * 255 = 102
      // 所以應該使用 rgb(102, 102, 102) 來匹配 overlay 的視覺效果
      const backgroundColor = fullScreen 
        ? baseBackgroundColor 
        : (theme.colorMode === 'light' ? '#666666' : 'rgba(0, 0, 0, 0.6)');
      
      // 保存原始樣式
      const originalHtmlBackground = htmlElement.style.background || htmlElement.style.backgroundColor;
      const originalHtmlBackgroundColor = htmlElement.style.backgroundColor;
      const originalHtmlMinHeight = htmlElement.style.minHeight;
      const originalHtmlHeight = htmlElement.style.height;
      
      const originalBodyBackground = bodyElement.style.background || bodyElement.style.backgroundColor;
      const originalBodyBackgroundColor = bodyElement.style.backgroundColor;
      const originalBodyMinHeight = bodyElement.style.minHeight;
      const originalBodyHeight = bodyElement.style.height;
      
      const originalRootBackground = rootElement ? (rootElement.style.background || rootElement.style.backgroundColor) : '';
      const originalRootBackgroundColor = rootElement ? rootElement.style.backgroundColor : '';
      const originalRootMinHeight = rootElement ? rootElement.style.minHeight : '';
      const originalRootHeight = rootElement ? rootElement.style.height : '';
      
      // 設置統一的背景顏色，使用 background 屬性確保完全覆蓋
      htmlElement.style.background = backgroundColor;
      htmlElement.style.backgroundColor = backgroundColor;
      htmlElement.style.minHeight = '100vh';
      htmlElement.style.height = 'auto';
      
      bodyElement.style.background = backgroundColor;
      bodyElement.style.backgroundColor = backgroundColor;
      bodyElement.style.minHeight = '100vh';
      bodyElement.style.height = 'auto';
      
      if (rootElement) {
        rootElement.style.background = backgroundColor;
        rootElement.style.backgroundColor = backgroundColor;
        rootElement.style.minHeight = '100vh';
        rootElement.style.height = 'auto';
      }
      
      // 記錄初始視窗高度（使用 screen.height 來獲取真實螢幕高度，不受鍵盤影響）
      const initialHeight = window.screen?.height || window.innerHeight || document.documentElement.clientHeight;
      
      // 添加 CSS 樣式防止移動端鍵盤問題
      const mobileStyleId = 'modal-mobile-style';
      let mobileStyleElement = document.getElementById(mobileStyleId);
      if (!mobileStyleElement) {
        mobileStyleElement = document.createElement('style');
        mobileStyleElement.id = mobileStyleId;
      }
      
      // 使用固定高度
      mobileStyleElement.textContent = `
        /* 防止 iOS Safari 輸入時自動縮放 - 必須 >= 16px */
        input, textarea, select {
          font-size: 16px !important;
        }
      `;
      
      if (!document.getElementById(mobileStyleId)) {
        document.head.appendChild(mobileStyleElement);
      }
      
      // 不再需要特殊處理，因為確認按鈕已經在輸入框旁邊了
      const timeoutId: any = null;
      
      // 禁止背景滾動
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        // 清除 timeout
        clearTimeout(timeoutId);
        
        // 恢復滾動
        document.body.style.overflow = originalOverflow || '';
        
        // 移除移動端樣式
        const styleToRemove = document.getElementById(mobileStyleId);
        if (styleToRemove) {
          styleToRemove.remove();
        }
        
        // 恢復原始樣式
        if (originalHtmlBackground) {
          htmlElement.style.background = originalHtmlBackground;
        } else {
          htmlElement.style.background = '';
        }
        htmlElement.style.backgroundColor = originalHtmlBackgroundColor || '';
        htmlElement.style.minHeight = originalHtmlMinHeight || '';
        htmlElement.style.height = originalHtmlHeight || '';
        
        if (originalBodyBackground) {
          bodyElement.style.background = originalBodyBackground;
        } else {
          bodyElement.style.background = '';
        }
        bodyElement.style.backgroundColor = originalBodyBackgroundColor || '';
        bodyElement.style.minHeight = originalBodyMinHeight || '';
        bodyElement.style.height = originalBodyHeight || '';
        
        if (rootElement) {
          if (originalRootBackground) {
            rootElement.style.background = originalRootBackground;
          } else {
            rootElement.style.background = '';
          }
          rootElement.style.backgroundColor = originalRootBackgroundColor || '';
          rootElement.style.minHeight = originalRootMinHeight || '';
          rootElement.style.height = originalRootHeight || '';
        }
      };
    }
  }, [visible, theme.colorMode, theme.colors.background, fullScreen]);

  if (!visible) {
    return null;
  }

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      hardwareAccelerated
      presentationStyle="overFullScreen"
      supportedOrientations={["portrait", "landscape"]}
    >
      <Pressable onPress={handleBackdropPress}>
        <View style={styles.overlay} data-modal-overlay>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View 
              style={[styles.modalContainer, responsiveContainerStyle]} 
              data-modal-container
              {...(Platform.OS === 'web' ? {
                role: "dialog",
                'aria-modal': true,
                'aria-labelledby': 'modal-title',
              } : {
                accessibilityViewIsModal: true,
                accessibilityLabel: typeof title === 'string' ? title : 'Modal',
              })}
            >
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  {leftIconName ? (
                    <Icon name={leftIconName as any} size={20} style={styles.titleIcon} />
                  ) : null}
                  {typeof title === 'string' ? (
                    <Text 
                      style={styles.title}
                      accessibilityRole="header"
                      accessibilityLevel={1}
                      {...(Platform.OS === 'web' ? {
                        // Web 平台：添加 ARIA 屬性以符合無障礙性要求
                        role: "heading",
                        'aria-level': 1,
                        id: 'modal-title',
                      } : {})}
                    >
                      {title}
                    </Text>
                  ) : (
                    title
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={onClose} 
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="關閉"
                  {...(Platform.OS === 'web' ? {
                    'aria-label': '關閉',
                  } : {})}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                ref={scrollViewRef}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                nestedScrollEnabled={true}
                scrollEnabled={true}
              >
                {children}
              </ScrollView>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
};

export default Modal;
