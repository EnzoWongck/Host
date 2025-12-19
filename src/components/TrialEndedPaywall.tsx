import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useChips } from '../context/ChipsContext';
import ChipsPurchaseModal from './ChipsPurchaseModal';

interface TrialEndedPaywallProps {
  visible: boolean;
  onClose?: () => void;
  onSubscribeSuccess?: () => void;
}

// Chips 購買提示視窗
// 當用戶 Chips 不足時顯示
const TrialEndedPaywall: React.FC<TrialEndedPaywallProps> = ({
  visible,
  onClose,
  onSubscribeSuccess,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { chips } = useChips();
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);

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
      transform: [{ translateX: -160 }, { translateY: -150 }],
      width: '90%',
      maxWidth: 320,
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
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
      paddingTop: 12,
      paddingRight: 12,
      paddingBottom: 4,
    },
    closeButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    closeButtonText: {
      fontSize: 14,
      color: colorMode === 'dark' ? '#666666' : '#888888',
      textDecorationLine: 'underline',
    },
    content: {
      padding: 24,
      paddingTop: 8,
      alignItems: 'center',
    },
    chipIcon: {
      width: 48,
      height: 48,
      resizeMode: 'contain',
      marginBottom: 16,
      fontSize: 48,
      marginBottom: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colorMode === 'dark' ? '#FFFFFF' : '#121212',
      marginBottom: 12,
      textAlign: 'center',
    },
    balanceText: {
      fontSize: 14,
      color: colorMode === 'dark' ? '#888888' : '#666666',
      marginBottom: 16,
      textAlign: 'center',
    },
    desc: {
      fontSize: 14,
      lineHeight: 22,
      color: colorMode === 'dark' ? '#AAAAAA' : '#555555',
      marginBottom: 20,
      textAlign: 'center',
    },
    purchaseButton: {
      backgroundColor: '#0891B2',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 24,
      width: '100%',
      alignItems: 'center',
    },
    purchaseButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const handleCloseTemporarily = () => {
    onClose?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <>
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
              {Platform.OS === 'web' && (
                <Image 
                  source={{ uri: '/icons/chips3.PNG' }} 
                  style={styles.chipIcon}
                />
              )}
              <Text style={styles.title}>Chips 不足</Text>
              <Text style={styles.balanceText}>
                目前餘額：{chips ?? 0} Chips
              </Text>
              <Text style={styles.desc}>
                每 1 Chip 提供 12 小時牌局編輯時間{'\n'}
                購買 Chips 以繼續記錄牌局
              </Text>

              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={() => setPurchaseModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.purchaseButtonText}>
                  購買 Chips
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ChipsPurchaseModal
        visible={purchaseModalVisible}
        onClose={() => {
          setPurchaseModalVisible(false);
          // 購買成功後刷新
          if (chips > 0) {
            onSubscribeSuccess?.();
          }
        }}
      />
    </>
  );
};

export default TrialEndedPaywall;

