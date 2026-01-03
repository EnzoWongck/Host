import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const WHATSAPP_NUMBER = '+85264658664';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`;

const CustomerServiceButton: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenWhatsApp = async () => {
    try {
      if (Platform.OS === 'web') {
        window.open(WHATSAPP_URL, '_blank');
      } else {
        const supported = await Linking.canOpenURL(WHATSAPP_URL);
        if (supported) {
          await Linking.openURL(WHATSAPP_URL);
        } else {
          // 如果 WhatsApp 沒安裝，打開網頁版
          await Linking.openURL(WHATSAPP_URL);
        }
      }
      setModalVisible(false);
    } catch (error) {
      console.error('無法打開 WhatsApp:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: insets.top + 20,
      left: 16,
      zIndex: 9999,
    },
    button: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      minWidth: 280,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 20,
    },
    whatsappButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#25D366',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginBottom: 12,
      width: '100%',
      justifyContent: 'center',
    },
    whatsappIconText: {
      fontSize: 24,
      marginRight: 10,
    },
    whatsappText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    phoneNumber: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    closeButton: {
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
    closeButtonText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <>
      {/* 客服按鈕 */}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* 客服彈窗 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>客戶服務</Text>
            
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={handleOpenWhatsApp}
              activeOpacity={0.8}
            >
              {/* WhatsApp Icon using emoji/text for cross-platform compatibility */}
              <Text style={styles.whatsappIconText}>📱</Text>
              <Text style={styles.whatsappText}>WhatsApp 聯繫</Text>
            </TouchableOpacity>
            
            <Text style={styles.phoneNumber}>+852 6465 8664</Text>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>關閉</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default CustomerServiceButton;

