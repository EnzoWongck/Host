import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  title?: string;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ 
  onPress, 
  disabled = false,
  title = '使用 Google 登入'
}) => {
  const { theme, colorMode } = useTheme();
  const [imageError, setImageError] = useState(false);

  // Google 官方 logo URL（跨平台使用）
  // 使用 PNG 格式，因為 SVG 在 React Native 中可能不支持
  const googleLogoUrl = 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg';
  // 備用 URL（PNG 格式，更兼容移動端）
  const googleLogoUrlPng = 'https://developers.google.com/identity/images/g-logo.png';
  
  // 在所有平台都嘗試使用官方 logo
  const renderIcon = () => {
    // 如果圖片載入失敗，使用文字圖標作為備用
    if (imageError) {
      return (
        <View style={styles.googleIcon}>
          <Text style={styles.googleIconText}>G</Text>
        </View>
      );
    }
    
    // 嘗試使用官方 logo（優先使用 PNG，因為兼容性更好）
    return (
      <Image
        source={{ uri: googleLogoUrlPng }}
        style={styles.googleLogoImage}
        resizeMode="contain"
        onError={() => {
          // 如果 PNG 載入失敗，嘗試 SVG（僅 Web）
          if (Platform.OS === 'web') {
            setImageError(true);
          } else {
            // 移動端 PNG 失敗，回退到文字圖標
            setImageError(true);
          }
        }}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleLogoImage: {
    width: 18,
    height: 18,
  },
  googleIcon: {
    width: 18,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Google G logo 樣式：藍色 G 在白色方塊中
    borderWidth: 0.5,
    borderColor: '#4285F4',
  },
  googleIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4285F4',
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'Roboto, Arial, sans-serif' : undefined,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C4043',
    letterSpacing: 0.25,
    fontFamily: Platform.OS === 'web' ? 'Roboto, Arial, sans-serif' : undefined,
  },
});

export default GoogleButton;

