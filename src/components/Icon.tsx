import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface IconProps {
  name:
    | 'buy-in'
    | 'close'
    | 'home'
    | 'insurance'
    | 'rent'
    | 'settings'
    | 'expense'
    | 'rake'
    | 'dealer'
    | 'table'
    | 'misc711'
    | 'player'
    | 'player2'
    | 'cashout'
    | 'cost'
    | 'summary'
    | 'taxi'
    | 'pokercard'
    | 'number'
    | 'burger'
    | 'user'
    | 'inout'
    | 'inout2'
    | 'other'
    | 'connect'
    | 'connect2'
    | 'copy'
    | 'apple'
    | 'chrome'
    | 'mail'
    | 'eye'
    | 'eye-off';
  size?: number;
  style?: any;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, style }) => {
  const getIconSource = () => {
    switch (name) {
      case 'buy-in':
        return require('../../assets/icons/buy-in.png');
      case 'close':
        return require('../../assets/icons/close.png');
      case 'home':
        return require('../../assets/icons/home.png');
      case 'insurance':
        return require('../../assets/icons/insurance.png');
      case 'rent':
        return require('../../assets/icons/cost.png');
      case 'settings':
        return require('../../assets/icons/settings.png');
      case 'table':
        return require('../../assets/icons/table.png');
      case 'misc711':
        return require('../../assets/icons/711.png');
      case 'player':
        return require('../../assets/icons/player.png');
      case 'player2':
        return require('../../assets/icons/player2.png');
      case 'cashout':
        return require('../../assets/icons/cashout.png');
      case 'rake':
        return require('../../assets/icons/rake.png');
      case 'dealer':
        return require('../../assets/icons/dealer.png');
      case 'cost':
        return require('../../assets/icons/cost.png');
      case 'expense':
        // 舊代碼若傳入 'expense'，改以 cost.png 呈現
        return require('../../assets/icons/cost.png');
      case 'summary':
        return require('../../assets/icons/summary.png');
      case 'taxi':
        return require('../../assets/icons/taxi.png');
      case 'pokercard':
        return require('../../assets/icons/pokercard.png');
      case 'number':
        return require('../../assets/icons/number.png');
      case 'other':
        return require('../../assets/icons/other.png');
      case 'burger':
        return require('../../assets/icons/burger.png');
      case 'user':
        return require('../../assets/icons/user.png');
      case 'inout':
        return require('../../assets/icons/inout2.png');
      case 'inout2':
        return require('../../assets/icons/inout2.png');
      case 'connect':
        return require('../../assets/icons/connect.png');
      case 'connect2':
        return require('../../assets/icons/connect2.png');
      case 'copy':
        return require('../../assets/icons/copy.png');
      case 'apple':
        return require('../../assets/icons/user.png'); // 使用 user 圖標代替 apple
      case 'chrome':
        return require('../../assets/icons/connect.png'); // 使用 connect 圖標代替 chrome
      case 'mail':
        return require('../../assets/icons/copy.png'); // 使用 copy 圖標代替 mail
      case 'eye':
        return require('../../assets/icons/user.png'); // 使用 user 圖標代替 eye
      case 'eye-off':
        return require('../../assets/icons/user.png'); // 使用 user 圖標代替 eye-off
      default:
        return require('../../assets/icons/home.png');
    }
  };

  const styles = StyleSheet.create({
    icon: {
      width: size,
      height: size,
      resizeMode: 'contain',
    },
  });

  return (
    <Image
      source={getIconSource()}
      style={[styles.icon, style]}
    />
  );
};

export default Icon;
