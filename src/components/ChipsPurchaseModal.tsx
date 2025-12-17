import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useChips } from '../context/ChipsContext';
import { ChipsPackage } from '../config/stripe';
import Icon from './Icon';

interface ChipsPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChipsPurchaseModal: React.FC<ChipsPurchaseModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { chips, packages, createCheckoutSession } = useChips();
  
  const [selectedPackage, setSelectedPackage] = useState<ChipsPackage | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (pkg: ChipsPackage) => {
    if (Platform.OS !== 'web') {
      alert('目前只支援網頁版購買');
      return;
    }

    setSelectedPackage(pkg);
    setLoading(true);

    try {
      const checkoutUrl = await createCheckoutSession(pkg);
      
      if (checkoutUrl) {
        // 跳轉到 Stripe Checkout
        window.location.href = checkoutUrl;
      } else {
        alert('創建結帳頁面失敗，請稍後再試');
      }
    } catch (error) {
      console.error('購買失敗:', error);
      alert('購買失敗，請稍後再試');
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      width: '90%',
      maxWidth: 420,
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    closeButtonText: {
      fontSize: 28,
      color: theme.colors.textSecondary,
      lineHeight: 28,
    },
    balanceContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.sm,
    },
    balanceValue: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    packagesContainer: {
      gap: theme.spacing.md,
    },
    packageCard: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    packageCardPopular: {
      borderColor: theme.colors.primary,
    },
    packageCardSelected: {
      borderColor: theme.colors.success,
    },
    popularBadge: {
      position: 'absolute',
      top: -10,
      right: 16,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    popularText: {
      fontSize: theme.fontSize.xs,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    packageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    packageName: {
      fontSize: theme.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text,
    },
    packagePrice: {
      fontSize: theme.fontSize.xl,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    packageDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    packageDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    savingsBadge: {
      backgroundColor: 'rgba(76, 175, 80, 0.15)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    savingsText: {
      fontSize: theme.fontSize.xs,
      fontWeight: '600',
      color: '#4CAF50',
    },
    buyButton: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    buyButtonDisabled: {
      opacity: 0.6,
    },
    buyButtonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    footer: {
      marginTop: theme.spacing.lg,
      alignItems: 'center',
    },
    footerText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.borderRadius.xl,
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
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modal}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎰 購買 Chips</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Current Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>目前餘額：</Text>
            <Text style={styles.balanceValue}>{chips} Chips</Text>
          </View>

          {/* Packages */}
          <View style={styles.packagesContainer}>
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  pkg.popular && styles.packageCardPopular,
                  selectedPackage?.id === pkg.id && styles.packageCardSelected,
                ]}
                onPress={() => handlePurchase(pkg)}
                disabled={loading}
                activeOpacity={0.8}
              >
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>最受歡迎</Text>
                  </View>
                )}
                
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>${pkg.priceHKD}</Text>
                </View>
                
                <View style={styles.packageDetails}>
                  <Text style={styles.packageDescription}>
                    {pkg.chips === 1 
                      ? '每個 Chip 可使用 12 小時'
                      : `共 ${pkg.chips} 個 Chips`
                    }
                  </Text>
                  {pkg.savings && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{pkg.savings}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    loading && selectedPackage?.id === pkg.id && styles.buyButtonDisabled,
                  ]}
                  onPress={() => handlePurchase(pkg)}
                  disabled={loading}
                >
                  {loading && selectedPackage?.id === pkg.id ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.buyButtonText}>立即購買</Text>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              付款由 Stripe 安全處理 🔒{'\n'}
              支援信用卡、Apple Pay、Google Pay
            </Text>
          </View>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={{ color: '#FFFFFF', marginTop: theme.spacing.md }}>
                正在跳轉至付款頁面...
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ChipsPurchaseModal;

