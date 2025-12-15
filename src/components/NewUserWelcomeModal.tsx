import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface NewUserWelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

const NewUserWelcomeModal: React.FC<NewUserWelcomeModalProps> = ({ visible, onClose }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAInstall, setShowPWAInstall] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // 檢查是否已經安裝為 PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShowPWAInstall(false);
      return;
    }

    // 監聽 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      // 如果沒有 deferredPrompt，顯示手動安裝說明
      if (Platform.OS === 'web') {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
          Alert.alert(
            '添加到主畫面',
            '1. 點擊瀏覽器底部的分享按鈕\n2. 選擇「加入主畫面」\n3. 點擊「加入」',
            [{ text: '確定' }]
          );
        } else if (isAndroid) {
          Alert.alert(
            '安裝應用程式',
            '請點擊瀏覽器選單中的「安裝應用程式」或「添加到主畫面」',
            [{ text: '確定' }]
          );
        } else {
          Alert.alert(
            '添加到主畫面',
            '請使用瀏覽器的「安裝應用程式」功能，或點擊瀏覽器選單中的相關選項',
            [{ text: '確定' }]
          );
        }
      }
      return;
    }

    // 顯示安裝提示
    deferredPrompt.prompt();
    
    // 等待用戶回應
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用戶接受了 PWA 安裝提示');
    } else {
      console.log('用戶拒絕了 PWA 安裝提示');
    }
    
    setDeferredPrompt(null);
    setShowPWAInstall(false);
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colorMode === 'dark' ? '#121212' : '#FFFFFF',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    message: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
      lineHeight: 24,
    },
    installButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      width: '100%',
      alignItems: 'center',
    },
    installButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSize.md,
      fontWeight: '600',
    },
    closeButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    closeButtonText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
  });

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
          <Text style={styles.title}>歡迎使用 LunChips！</Text>
          <Text style={styles.message}>
            你現可免費記錄 1 個牌局；超過 24 小時或結束牌局後，需先完成訂閱。
          </Text>
          
          {showPWAInstall && Platform.OS === 'web' && (
            <TouchableOpacity
              style={styles.installButton}
              onPress={handleInstallPWA}
              activeOpacity={0.8}
            >
              <Text style={styles.installButtonText}>添加到主畫面</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>開始使用</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default NewUserWelcomeModal;




