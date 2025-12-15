import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { PAYPAL_CLIENT_ID, PAYPAL_SUBSCRIPTION_PLAN_ID, PAYPAL_SDK_URL } from '../config/dev';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface TrialEndedPaywallProps {
  visible: boolean;
  onClose?: () => void;
  onSubscribeSuccess?: () => void;
}

// 試用到期強制彈窗（全螢幕鎖定）
// 當用戶免費試用結束後，必須訂閱才能繼續使用
const TrialEndedPaywall: React.FC<TrialEndedPaywallProps> = ({
  visible,
  onClose,
  onSubscribeSuccess,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const [paywallClosedAt, setPaywallClosedAt] = useState<number | null>(null);

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.80)',
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(8px)',
      }),
    },
    card: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -210 }, { translateY: -200 }],
      width: '90%',
      maxWidth: 420,
      backgroundColor: colorMode === 'dark' ? '#121212' : '#FFFFFF',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 40,
      elevation: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 8,
    },
    closeButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    closeButtonText: {
      fontSize: 15,
      color: colorMode === 'dark' ? '#888888' : '#888888',
      textDecorationLine: 'underline',
    },
    content: {
      padding: 40,
      paddingTop: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#121212',
      marginBottom: 16,
      textAlign: 'center',
    },
    desc: {
      fontSize: 17,
      lineHeight: 26,
      color: colorMode === 'dark' ? '#AAAAAA' : '#555555',
      marginBottom: 32,
      textAlign: 'center',
    },
    paypalContainer: {
      width: '100%',
      minHeight: 48,
      marginBottom: 20,
    },
  });

  // 「稍後再說」：關閉 1 小時（避免用戶一直點逃避）
  const handleCloseTemporarily = () => {
    if (Platform.OS === 'web') {
      const closedAt = Date.now();
      localStorage.setItem('paywall_closed_at', closedAt.toString());
      setPaywallClosedAt(closedAt);
      // 1 小時後自動清除記錄
      setTimeout(() => {
        localStorage.removeItem('paywall_closed_at');
        setPaywallClosedAt(null);
      }, 60 * 60 * 1000);
    }
    onClose?.();
  };

  // 檢查是否在 1 小時內關閉過
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const closedAt = localStorage.getItem('paywall_closed_at');
      if (closedAt) {
        const timeDiff = Date.now() - parseInt(closedAt, 10);
        if (timeDiff < 60 * 60 * 1000) {
          setPaywallClosedAt(parseInt(closedAt, 10));
        } else {
          localStorage.removeItem('paywall_closed_at');
          setPaywallClosedAt(null);
        }
      }
    }
  }, []);

  // 監聽 PayPal 訂閱成功（透過全域事件或 callback）
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePayPalSuccess = () => {
        Alert.alert('訂閱成功！', '正在解鎖所有功能…', [
          {
            text: '確定',
            onPress: () => {
              onSubscribeSuccess?.();
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            },
          },
        ]);
      };

      // 監聽自訂事件（可從 PayPal 按鈕成功後觸發）
      window.addEventListener('paypal-subscription-success', handlePayPalSuccess);
      return () => {
        window.removeEventListener('paypal-subscription-success', handlePayPalSuccess);
      };
    }
  }, [onSubscribeSuccess]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseTemporarily}
    >
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.overlay} />
        <View style={styles.card}>
          {/* 右上角「稍後再說」按鈕 */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseTemporarily}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>稍後再說</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>需要訂閱以繼續使用</Text>
            <Text style={styles.desc}>
              你現可免費記錄 1 個牌局；超過 24 小時或結束牌局後，需先完成訂閱。{'\n'}
              立刻訂閱月費計劃，無上限記錄、編輯牌局！
            </Text>

            {/* PayPal 訂閱按鈕容器 */}
            <View style={styles.paypalContainer}>
              {Platform.OS === 'web' && (
                <PayPalPaywallButton
                  onSuccess={() => {
                    onSubscribeSuccess?.();
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('paypal-subscription-success'));
                    }
                  }}
                />
              )}
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#0070BA',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    Alert.alert(
                      '訂閱',
                      '請在網頁版完成訂閱：lunchips.com',
                      [{ text: '確定' }]
                    );
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    前往訂閱
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// PayPal 按鈕組件（用於 Paywall）
const PayPalPaywallButton: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonsInstanceRef = useRef<any>(null);
  const isMountedRef = useRef(true);
  const [isRendered, setIsRendered] = useState(false);
  // 使用配置中的 PayPal 設定（根據 PAYPAL_USE_SANDBOX 自動選擇環境）
  const PAYPAL_PLAN_ID = PAYPAL_SUBSCRIPTION_PLAN_ID;
  const CONTAINER_ID = `paypal-button-container-${PAYPAL_PLAN_ID}`;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let retryTimeout: NodeJS.Timeout;
    let mounted = true;

    // 等待 DOM 元素準備好
    const checkAndRender = () => {
      // 檢查組件是否仍然掛載
      if (!isMountedRef.current || !mounted) {
        return;
      }

      // 在 React Native Web 中，nativeID 會被轉換為 id
      let container = document.getElementById(CONTAINER_ID);
      // 如果找不到，嘗試通過 data-native-id 查找
      if (!container) {
        container = document.querySelector(`[data-native-id="${CONTAINER_ID}"]`) as HTMLElement;
      }
      // 如果還是找不到，嘗試通過 ref 查找
      if (!container && containerRef.current) {
        // @ts-ignore
        const node = containerRef.current._nativeNode || containerRef.current;
        if (node && node.nodeType === 1 && document.body.contains(node)) {
          container = node;
        }
      }

      // 確保容器存在且仍在 DOM 中
      if (!container || !document.body.contains(container)) {
        // 如果容器還不存在或已被移除，稍後再試（最多重試 50 次 = 5 秒）
        const retryCount = parseInt(sessionStorage.getItem('paypal-retry-count') || '0', 10);
        if (retryCount < 50 && isMountedRef.current && mounted) {
          sessionStorage.setItem('paypal-retry-count', (retryCount + 1).toString());
          retryTimeout = setTimeout(checkAndRender, 100);
        } else {
          sessionStorage.removeItem('paypal-retry-count');
          console.warn('PayPal 容器未找到，停止重試');
        }
        return;
      }

      // 重置重試計數
      sessionStorage.removeItem('paypal-retry-count');

      const loadPayPalScript = () =>
        new Promise<void>((resolve, reject) => {
          if (window.paypal) {
            resolve();
            return;
          }
          const existing = document.querySelector<HTMLScriptElement>(
            `script[src^="${PAYPAL_SDK_URL}"]`
          );
          if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', reject, { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = `${PAYPAL_SDK_URL}?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
          script.setAttribute('data-sdk-integration-source', 'button-factory');
          script.async = true;
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });

      loadPayPalScript()
        .then(() => {
          // 再次檢查組件是否仍然掛載
          if (!isMountedRef.current || !mounted) {
            return;
          }

          if (!window.paypal) {
            console.error('PayPal SDK 未載入');
            return;
          }

          // 再次確認容器存在且仍在 DOM 中
          const containerElement = document.getElementById(CONTAINER_ID);
          if (!containerElement || !document.body.contains(containerElement)) {
            console.error('PayPal 容器不存在或已被移除');
            return;
          }

          // 清除容器內容（如果之前已經渲染過）
          containerElement.innerHTML = '';

          // 如果有之前的實例，先清理
          if (buttonsInstanceRef.current) {
            try {
              // PayPal Buttons 沒有直接的 destroy 方法，但清除容器應該足夠
              buttonsInstanceRef.current = null;
            } catch (e) {
              // 忽略清理錯誤
            }
          }

          // 渲染 PayPal 訂閱按鈕
          try {
            const buttons = window.paypal.Buttons({
              style: {
                shape: 'pill',
                color: 'black',
                layout: 'vertical',
                label: 'paypal',
              },
              createSubscription: function(data: any, actions: any) {
                console.log('創建 PayPal 訂閱，計劃 ID:', PAYPAL_PLAN_ID);
                return actions.subscription.create({
                  plan_id: PAYPAL_PLAN_ID
                });
              },
              onApprove: function(data: any, actions: any) {
                // 訂閱成功
                console.log('PayPal 訂閱成功:', data.subscriptionID);
                alert(data.subscriptionID); // 顯示訂閱 ID
                onSuccess();
                // 觸發訂閱成功事件
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('paypal-subscription-success'));
                }
              },
              onError: function(err: any) {
                console.error('PayPal 訂閱錯誤:', err);
                // 檢查是否為 RESOURCE_NOT_FOUND 錯誤
                if (err?.name === 'RESOURCE_NOT_FOUND' || err?.message?.includes('RESOURCE_NOT_FOUND')) {
                  const errorMsg = `訂閱計劃未找到。請確認 Plan ID "${PAYPAL_PLAN_ID}" 在 PayPal Live 環境中存在。\n\n如需創建新計劃，請參考：\n1. 登入 https://developer.paypal.com/\n2. 前往 Products > Subscriptions\n3. 創建新的訂閱計劃\n4. 複製 Plan ID 並更新代碼中的 PAYPAL_PLAN_ID`;
                  alert(errorMsg);
                } else {
                  alert(`PayPal 訂閱錯誤：${err?.message || JSON.stringify(err)}`);
                }
              },
            });

            buttonsInstanceRef.current = buttons;

            // 再次確認容器存在（在渲染前）
            const finalContainer = document.getElementById(CONTAINER_ID);
            if (!finalContainer || !document.body.contains(finalContainer)) {
              console.error('PayPal 容器在渲染前被移除');
              return;
            }

            buttons
              .render(`#${CONTAINER_ID}`)
              .then(() => {
                if (isMountedRef.current && mounted) {
                  setIsRendered(true);
                  console.log('PayPal 按鈕渲染成功');
                }
              })
              .catch((err: any) => {
                // 只記錄錯誤，不顯示給用戶（可能是因為組件已卸載）
                if (err.message && err.message.includes('removed from DOM')) {
                  console.warn('PayPal 容器在渲染過程中被移除');
                } else {
                  console.error('渲染 PayPal Paywall 按鈕失敗', err);
                }
              });
          } catch (error: any) {
            console.error('創建 PayPal 按鈕失敗', error);
          }
        })
        .catch((err) => {
          console.error('載入 PayPal SDK 失敗', err);
        });
    };

    // 開始檢查和渲染
    checkAndRender();

    // 清理函數
    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      const container = document.getElementById(CONTAINER_ID);
      if (container) {
        container.innerHTML = '';
      }
      buttonsInstanceRef.current = null;
      sessionStorage.removeItem('paypal-retry-count');
    };
  }, [onSuccess]);

  if (Platform.OS !== 'web') {
    return null;
  }

  // 在 Web 平台上，使用原生 div 元素以確保穩定性
  return (
    <View style={{ width: '100%', minHeight: 48 }}>
      {/* @ts-ignore - Web 平台使用原生 HTML 元素 */}
      <div
        ref={containerRef}
        id={CONTAINER_ID}
        style={{ width: '100%', minHeight: 48 }}
      />
    </View>
  );
};

export default TrialEndedPaywall;

