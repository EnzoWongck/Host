import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { PAYPAL_CLIENT_ID, PAYPAL_SUBSCRIPTION_PLAN_ID, PAYPAL_SDK_URL } from '../config/dev';

// 使用配置中的 PayPal 設定（根據 PAYPAL_USE_SANDBOX 自動選擇環境）
const PAYPAL_PLAN_ID = PAYPAL_SUBSCRIPTION_PLAN_ID;

declare global {
  interface Window {
    paypal?: any;
    __clickPaypalHostedButton?: () => void;
    __createPayPalSubscription?: () => Promise<void>;
  }
}

interface PayPalSubscriptionButtonProps {
  planId?: string;
}

const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({ 
  planId 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonsInstanceRef = useRef<any>(null);
  const CONTAINER_ID = `paypal-button-container-${PAYPAL_PLAN_ID}`;
  // 使用配置中的計劃 ID
  const effectivePlanId = planId || PAYPAL_PLAN_ID;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // 強制等 DOM 完全 ready
    const timer = setTimeout(() => {
      // 獲取或創建容器
      let container = document.getElementById(CONTAINER_ID) as HTMLDivElement;
      const wrapper = document.getElementById('paypal-wrapper');
      
      if (!wrapper) {
        console.warn('PayPal wrapper 未找到，等待渲染...');
        return;
      }

      if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        wrapper.appendChild(container);
      }
      containerRef.current = container;

      if (!containerRef.current) return;

      // 清除舊的避免重複渲染
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      // 檢查是否已經載入 PayPal SDK
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src^="${PAYPAL_SDK_URL}"]`
      );

      const initPayPal = () => {
        // @ts-ignore - PayPal 全域變數
        if (!window.paypal) {
          console.warn('PayPal SDK 尚未載入');
          return;
        }

        console.log('初始化 PayPal 訂閱按鈕...');

        const buttons = window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
            height: 50,
          },

          createSubscription: (data: any, actions: any) => {
            console.log('創建 PayPal 訂閱，計劃 ID:', effectivePlanId);
            return actions.subscription.create({
              plan_id: effectivePlanId
            });
          },

          onApprove: (data: any, actions: any) => {
            console.log('PayPal 訂閱成功！訂閱 ID：', data.subscriptionID);
            alert(data.subscriptionID); // 顯示訂閱 ID
            // 觸發訂閱成功事件
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('paypal-subscription-success', {
                detail: { subscriptionID: data.subscriptionID }
              }));
            }
          },

          onError: (err: any) => {
            console.error('PayPal 錯誤', err);
            // 檢查是否為 RESOURCE_NOT_FOUND 錯誤
            if (err?.name === 'RESOURCE_NOT_FOUND' || err?.message?.includes('RESOURCE_NOT_FOUND')) {
              const errorMsg = `訂閱計劃未找到。請確認 Plan ID "${effectivePlanId}" 在 PayPal Live 環境中存在。\n\n如需創建新計劃，請參考：\n1. 登入 https://developer.paypal.com/\n2. 前往 Products > Subscriptions\n3. 創建新的訂閱計劃\n4. 複製 Plan ID 並更新代碼中的 PAYPAL_PLAN_ID`;
              alert(errorMsg);
            } else {
              alert(`PayPal 錯誤：${err?.message || JSON.stringify(err)}`);
            }
          },

          onCancel: () => {
            console.log('用戶取消訂閱');
          }
        });

        buttonsInstanceRef.current = buttons;

        // 渲染按鈕
        buttons
          .render(containerRef.current!)
          .then(() => {
            console.log('PayPal 訂閱按鈕渲染成功');
            
            // 設置編程式訂閱方法
            if (typeof window !== 'undefined') {
              window.__createPayPalSubscription = async () => {
                try {
                  console.log('開始編程式訂閱流程...');
                  
                  if (!containerRef.current) {
                    throw new Error('PayPal 容器未準備好');
                  }

                  // 等待按鈕完全渲染
                  await new Promise(resolve => setTimeout(resolve, 500));

                  // 嘗試找到並點擊按鈕
                  const button = containerRef.current.querySelector('button') as HTMLElement;
                  if (button) {
                    console.log('找到 PayPal 按鈕，觸發點擊');
                    button.click();
                    button.focus();
                    
                    // 觸發多種事件確保響應
                    const events = ['mousedown', 'mouseup', 'click'];
                    events.forEach(eventType => {
                      const event = new MouseEvent(eventType, {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        buttons: 1
                      });
                      button.dispatchEvent(event);
                    });
                    return;
                  }

                  // 如果找不到按鈕，檢查 iframe
                  const iframe = containerRef.current.querySelector('iframe');
                  if (iframe) {
                    console.log('找到 PayPal iframe，嘗試觸發');
                    iframe.click();
                    return;
                  }

                  console.warn('無法找到 PayPal 按鈕或 iframe');
                  alert('無法自動觸發 PayPal 訂閱，請手動點擊 PayPal 按鈕。');
                } catch (error) {
                  console.error('編程式訂閱失敗:', error);
                  alert('訂閱流程啟動失敗，請刷新頁面後再試。');
                }
              };

              // 保留舊的觸發方法作為備用
              window.__clickPaypalHostedButton = () => {
                if (window.__createPayPalSubscription) {
                  window.__createPayPalSubscription();
                }
              };
            }
          })
          .catch((err: any) => {
            console.error('渲染 PayPal 按鈕失敗', err);
          });
      };

      if (existingScript && window.paypal) {
        // SDK 已載入，直接初始化
        initPayPal();
      } else {
        // 需要載入 SDK
        const script = document.createElement('script');
        script.src = `${PAYPAL_SDK_URL}?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
        script.setAttribute('data-sdk-integration-source', 'button-factory');
        script.async = true;
        script.onload = () => {
          initPayPal();
        };
        script.onerror = () => {
          console.error('載入 PayPal SDK 失敗，請檢查網路');
          alert('載入 PayPal SDK 失敗，請檢查網路');
        };
        document.head.appendChild(script);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      // 清理函數
      if (typeof window !== 'undefined') {
        delete window.__clickPaypalHostedButton;
        delete window.__createPayPalSubscription;
      }
    };
  }, [planId]);

  // 只在 web 版顯示
  if (Platform.OS !== 'web') {
    return <View />;
  }

  // Web 平台：使用 View 並通過 nativeID 獲取 DOM 元素
  return (
    <View 
      id="paypal-wrapper"
      nativeID="paypal-wrapper"
      style={{ width: '100%', minHeight: 60, marginVertical: 20 }}
    />
  );
};

export default PayPalSubscriptionButton;
