import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PAYPAL_CLIENT_ID, PAYPAL_SUBSCRIPTION_PLAN_ID, PAYPAL_SDK_URL } from '../config/dev';
import Icon from './Icon';

// 使用配置中的 PayPal 設定（根據 PAYPAL_USE_SANDBOX 自動選擇環境）
const PAYPAL_PLAN_ID = PAYPAL_SUBSCRIPTION_PLAN_ID;

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (subscriptionID: string) => void;
}

const PayPalSubscriptionModal: React.FC<PayPalSubscriptionModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { theme, colorMode } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const CONTAINER_ID = `paypal-button-container-${PAYPAL_PLAN_ID}`;

  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return;

    // 載入 PayPal SDK
    const loadPayPalSDK = () => {
      // 檢查是否已經載入
      if (window.paypal) {
        setPaypalLoaded(true);
        return;
      }

      // 檢查是否已經有 script 標籤
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src*="${PAYPAL_SDK_URL}"]`
      );

      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setPaypalLoaded(true);
        }, { once: true });
        return;
      }

      // 創建新的 script 標籤
      const script = document.createElement('script');
      script.src = `${PAYPAL_SDK_URL}?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
      script.setAttribute('data-sdk-integration-source', 'button-factory');
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      script.onerror = () => {
        console.error('載入 PayPal SDK 失敗');
      };
      document.head.appendChild(script);
    };

    loadPayPalSDK();
  }, [visible]);

  useEffect(() => {
    if (!visible || !paypalLoaded || Platform.OS !== 'web' || !containerRef.current) return;

    // 清除容器內容
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // 渲染 PayPal 按鈕
    if (window.paypal && containerRef.current) {
      try {
        window.paypal.Buttons({
          style: {
            shape: 'pill',
            color: 'gold',
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
            console.log('PayPal 訂閱成功:', data.subscriptionID);
            alert(data.subscriptionID); // 顯示訂閱 ID
            if (onSuccess) {
              onSuccess(data.subscriptionID);
            }
            // 觸發訂閱成功事件
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('paypal-subscription-success', {
                detail: { subscriptionID: data.subscriptionID }
              }));
            }
            onClose();
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
          onCancel: function() {
            console.log('用戶取消訂閱');
          },
        }).render(`#${CONTAINER_ID}`);
      } catch (error) {
        console.error('渲染 PayPal 按鈕失敗:', error);
      }
    }

    // 清理函數
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [visible, paypalLoaded, onSuccess, onClose]);

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      width: '90%',
      maxWidth: 500,
      alignItems: 'center',
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },
    paypalContainer: {
      width: '100%',
      minHeight: 200,
      marginBottom: theme.spacing.lg,
    },
    closeButton: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.sm,
    },
    closeButtonText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
  });

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>訂閱服務</Text>
          <Text style={styles.subtitle}>現在訂閱，享受無上限服務。</Text>
          
          <View style={styles.paypalContainer}>
            {/* @ts-ignore - Web 平台使用原生 HTML 元素 */}
            <div 
              ref={containerRef}
              id={CONTAINER_ID}
              style={{ width: '100%', minHeight: 200 }}
            />
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>取消</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default PayPalSubscriptionModal;








