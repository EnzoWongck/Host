import React from 'react';
import { View, Image, Platform, StyleSheet } from 'react-native';
import Icon from './Icon';

interface TabBarIconProps {
  name: 'home' | 'target' | 'settings';
  color: string;
  size: number;
  focused: boolean;
}

// 將 hex 顏色轉換為 CSS filter（用於 Web 平台）
const hexToFilter = (hex: string): string => {
  // 預定義的顏色對應 filter 值
  const filterMap: Record<string, string> = {
    '#10B981': 'brightness(0) saturate(100%) invert(58%) sepia(52%) saturate(563%) hue-rotate(115deg) brightness(94%) contrast(94%)', // 綠色
    '#3B82F6': 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(206deg) brightness(99%) contrast(95%)', // 藍色
    '#8B5CF6': 'brightness(0) saturate(100%) invert(46%) sepia(94%) saturate(2895%) hue-rotate(239deg) brightness(98%) contrast(94%)', // 紫色
  };

  // 如果是預定義顏色，返回對應的 filter
  if (filterMap[hex]) {
    return filterMap[hex];
  }

  // 對於其他顏色（如灰色），返回一個通用的灰度 filter
  // 這會使圖標變成灰色
  return 'brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(80%)';
};

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color, size, focused }) => {
  const getIconName = (iconName: string): 'home' | 'settings' | 'dealer' | 'table' | 'pokercard' | 'player' => {
    switch (iconName) {
      case 'home':
        return 'home';
      case 'target':
        return 'pokercard'; // 目前牌局使用撲克牌圖標
      case 'settings':
        return 'settings';
      default:
        return 'home';
    }
  };

  // 圖示顏色完全跟隨外部傳入的 color（由 DoubleTabBar 控制）
  const iconStyle = Platform.OS === 'web' 
    ? {
        filter: hexToFilter(color),
        opacity: 1,
      } as any
    : {
        tintColor: color,
        opacity: 1,
      };

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Icon
        name={getIconName(name)}
        size={size}
        style={iconStyle}
      />
    </View>
  );
};

export default TabBarIcon;
