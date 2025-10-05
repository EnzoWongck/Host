import React from 'react';
import { View, Image } from 'react-native';
import Icon from './Icon';

interface TabBarIconProps {
  name: 'home' | 'target' | 'settings';
  color: string;
  size: number;
  focused: boolean;
}

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

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Icon
        name={getIconName(name)}
        size={size}
        style={{
          tintColor: color,
          opacity: 1,
        }}
      />
    </View>
  );
};

export default TabBarIcon;
