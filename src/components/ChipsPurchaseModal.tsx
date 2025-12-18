import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useChips } from '../context/ChipsContext';
import { ChipsPackage } from '../config/stripe';

interface ChipsPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChipsPurchaseModal: React.FC<ChipsPurchaseModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { chips, packages, createCheckoutSession } = useChips();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<ChipsPackage | null>(null);
  const [loading, setLoading] = useState(false);

  // 計算價格
  const unitPrice = 30; // $30/Chip
  const calculatePrice = (qty: number) => {
    // 檢查是否符合優惠套餐
    if (qty >= 36) {
      const bundles = Math.floor(qty / 36);
      const remaining = qty % 36;
      return bundles * 899 + remaining * unitPrice;
    } else if (qty >= 11) {
      const bundles = Math.floor(qty / 11);
      const remaining = qty % 11;
      return bundles * 299 + remaining * unitPrice;
    }
    return qty * unitPrice;
  };

  const totalPrice = calculatePrice(quantity);
  const avgPrice = quantity > 0 ? Math.round(totalPrice / quantity) : 30;

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    setQuantity(Math.max(1, Math.min(999, num)));
  };

  const handlePurchase = async (pkg?: ChipsPackage) => {
    if (Platform.OS !== 'web') {
      alert('目前只支援網頁版購買');
      return;
    }

    const targetPkg = pkg || packages.find(p => p.chips === 1);
    if (!targetPkg) return;

    setSelectedPackage(targetPkg);
    setLoading(true);

    try {
      // 如果是自定義數量，需要多次購買或使用自定義邏輯
      const checkoutUrl = await createCheckoutSession(targetPkg);
      
      if (checkoutUrl) {
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

  const handleBundlePurchase = async (pkg: ChipsPackage) => {
    if (Platform.OS !== 'web') {
      alert('目前只支援網頁版購買');
      return;
    }

    setSelectedPackage(pkg);
    setLoading(true);

    try {
      const checkoutUrl = await createCheckoutSession(pkg);
      
      if (checkoutUrl) {
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
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modal: {
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
      borderRadius: 20,
      width: '100%',
      maxWidth: 360,
      maxHeight: SCREEN_HEIGHT * 0.85,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    scrollContent: {
      padding: 16,
    },
    balanceCard: {
      backgroundColor: colorMode === 'dark' ? '#252525' : '#F5F5F5',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    balanceValue: {
      fontSize: 24,
      fontWeight: '700',
      color: chips > 0 ? '#10B981' : '#EF4444',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    bundlesContainer: {
      gap: 10,
      marginBottom: 20,
    },
    bundleCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colorMode === 'dark' ? '#252525' : '#F8F8F8',
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#333' : '#E5E5E5',
    },
    bundleInfo: {
      flex: 1,
    },
    bundleName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    bundlePrice: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    bundleSavings: {
      fontSize: 12,
      color: '#10B981',
      fontWeight: '600',
      marginTop: 2,
    },
    bundleButton: {
      backgroundColor: '#0891B2',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    bundleButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    customSection: {
      marginTop: 8,
    },
    customCard: {
      backgroundColor: colorMode === 'dark' ? '#252525' : '#F8F8F8',
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#333' : '#E5E5E5',
    },
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    quantityButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colorMode === 'dark' ? '#333' : '#E5E5E5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityButtonText: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    quantityInput: {
      width: 80,
      height: 40,
      marginHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colorMode === 'dark' ? '#1A1A1A' : '#FFFFFF',
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? '#444' : '#DDD',
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    priceLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    priceValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    avgPrice: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'right',
    },
    customButton: {
      backgroundColor: '#0891B2',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    customButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    footer: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: colorMode === 'dark' ? '#333' : '#F0F0F0',
      alignItems: 'center',
    },
    footerText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
    loadingText: {
      color: '#FFFFFF',
      marginTop: 12,
      fontSize: 14,
    },
  });

  if (Platform.OS !== 'web') {
    return null;
  }

  // 優惠套餐（排除單個購買）
  const bundlePackages = packages.filter(p => p.chips > 1);
  const singleChipPackage = packages.find(p => p.chips === 1);

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
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>目前餘額</Text>
              <Text style={styles.balanceValue}>{chips} Chips</Text>
            </View>

            {/* Bundle Packages */}
            <Text style={styles.sectionTitle}>優惠套餐</Text>
            <View style={styles.bundlesContainer}>
              {bundlePackages.map((pkg) => {
                const isLoading = loading && selectedPackage?.id === pkg.id;
                return (
                  <View key={pkg.id} style={styles.bundleCard}>
                    <View style={styles.bundleInfo}>
                      <Text style={styles.bundleName}>{pkg.name}</Text>
                      <Text style={styles.bundlePrice}>${pkg.priceHKD}</Text>
                      {pkg.savings && (
                        <Text style={styles.bundleSavings}>{pkg.savings}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.bundleButton}
                      onPress={() => handleBundlePurchase(pkg)}
                      disabled={loading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.bundleButtonText}>購買</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Custom Quantity */}
            <View style={styles.customSection}>
              <Text style={styles.sectionTitle}>自選數量</Text>
              <View style={styles.customCard}>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    value={String(quantity)}
                    onChangeText={handleQuantityChange}
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity(Math.min(999, quantity + 1))}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>總價</Text>
                  <View>
                    <Text style={styles.priceValue}>${totalPrice}</Text>
                    <Text style={styles.avgPrice}>${avgPrice}/Chip</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.customButton}
                  onPress={() => singleChipPackage && handlePurchase(singleChipPackage)}
                  disabled={loading || !singleChipPackage}
                >
                  {loading && selectedPackage?.id === singleChipPackage?.id ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.customButtonText}>購買 {quantity} Chips</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🔒 付款由 Stripe 安全處理 • 支援 Visa・Mastercard
            </Text>
          </View>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#FFFFFF" size="large" />
              <Text style={styles.loadingText}>正在跳轉至付款頁面...</Text>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ChipsPurchaseModal;
