import React, { useState } from 'react';
import { Image, StyleSheet, Platform } from 'react-native';
// 靜態導入所有圖標
import BuyInIcon from '../../assets/icons/buy-in.png';
import CloseIcon from '../../assets/icons/close.png';
import HomeIcon from '../../assets/icons/home.png';
import InsuranceIcon from '../../assets/icons/insurance.png';
import CostIcon from '../../assets/icons/cost.png';
import SettingsIcon from '../../assets/icons/settings.png';
import TableIcon from '../../assets/icons/table.png';
import Misc711Icon from '../../assets/icons/711.png';
import PlayerIcon from '../../assets/icons/player.png';
import Player2Icon from '../../assets/icons/player2.png';
import CashoutIcon from '../../assets/icons/cashout.png';
import RakeIcon from '../../assets/icons/rake.png';
import DealerIcon from '../../assets/icons/dealer.png';
import SummaryIcon from '../../assets/icons/summary.png';
import TaxiIcon from '../../assets/icons/taxi.png';
import PokercardIcon from '../../assets/icons/pokercard.png';
import NumberIcon from '../../assets/icons/number.png';
import OtherIcon from '../../assets/icons/other.png';
import BurgerIcon from '../../assets/icons/burger.png';
import AddButtonImage from '../../assets/icons/add.png';
import UserIcon from '../../assets/icons/user.png';
import Inout2Icon from '../../assets/icons/inout2.png';
import ConnectIcon from '../../assets/icons/connect.png';
import Connect2Icon from '../../assets/icons/connect2.png';
import CopyIcon from '../../assets/icons/copy.png';
import EyesIcon from '../../assets/icons/eyes.png';
import EyesWhiteIcon from '../../assets/icons/eyes.white.png';
import EarthIcon from '../../assets/icons/earth.png';
import EarthWhiteIcon from '../../assets/icons/earth.white.png';
import Earth2Icon from '../../assets/icons/earth2.png';

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
    | 'eye-off'
    | 'earth'
    | 'earth-white'
    | 'earth2'
    | 'add';
  size?: number;
  style?: any;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, style }) => {
  const [imageError, setImageError] = useState(false);
  
  const getIconSource = () => {
    // Web 平台使用 public 路徑，其他平台使用 require
    if (Platform.OS === 'web') {
      const iconMap: Record<string, string> = {
        'buy-in': '/icons/buy-in.png',
        'close': '/icons/close.png',
        'home': '/icons/home.png',
        'insurance': '/icons/insurance.png',
        'rent': '/icons/cost.png',
        'settings': '/icons/settings.png',
        'table': '/icons/table.png',
        'misc711': '/icons/711.png',
        'player': '/icons/player.png',
        'player2': '/icons/player2.png',
        'cashout': '/icons/cashout.png',
        'rake': '/icons/rake.png',
        'dealer': '/icons/dealer.png',
        'cost': '/icons/cost.png',
        'expense': '/icons/cost.png',
        'summary': '/icons/summary.png',
        'taxi': '/icons/taxi.png',
        'pokercard': '/icons/pokercard.png',
        'number': '/icons/number.png',
        'other': '/icons/other.png',
        'burger': '/icons/burger.png',
        'user': '/icons/user.png',
        'inout': '/icons/inout2.png',
        'inout2': '/icons/inout2.png',
        'connect': '/icons/connect.png',
        'connect2': '/icons/connect2.png',
        'copy': '/icons/copy.png',
        'apple': '/icons/user.png',
        'chrome': '/icons/connect.png',
        'mail': '/icons/copy.png',
        'eye': '/icons/eyes.png',
        'eye-off': '/icons/eyes.white.png',
        'earth': '/icons/earth.png',
        'earth-white': '/icons/earth.white.png',
        'earth2': '/icons/earth2.png',
        'add': '/icons/add.png',
      };
      return iconMap[name] || '/icons/home.png';
    } else {
      // 非 Web 平台使用靜態導入的圖標
      switch (name) {
        case 'buy-in':
          return BuyInIcon;
        case 'close':
          return CloseIcon;
        case 'home':
          return HomeIcon;
        case 'insurance':
          return InsuranceIcon;
        case 'rent':
          return CostIcon;
        case 'settings':
          return SettingsIcon;
        case 'table':
          return TableIcon;
        case 'misc711':
          return Misc711Icon;
        case 'player':
          return PlayerIcon;
        case 'player2':
          return Player2Icon;
        case 'cashout':
          return CashoutIcon;
        case 'rake':
          return RakeIcon;
        case 'dealer':
          return DealerIcon;
        case 'cost':
          return CostIcon;
        case 'expense':
          return CostIcon;
        case 'summary':
          return SummaryIcon;
        case 'taxi':
          return TaxiIcon;
        case 'pokercard':
          return PokercardIcon;
        case 'number':
          return NumberIcon;
        case 'other':
          return OtherIcon;
        case 'burger':
          return BurgerIcon;
        case 'add':
          return AddButtonImage;
        case 'user':
          return UserIcon;
        case 'inout':
          return Inout2Icon;
        case 'inout2':
          return Inout2Icon;
        case 'connect':
          return ConnectIcon;
        case 'connect2':
          return Connect2Icon;
        case 'copy':
          return CopyIcon;
        case 'apple':
          return UserIcon;
        case 'chrome':
          return ConnectIcon;
        case 'mail':
          return CopyIcon;
        case 'eye':
          return EyesIcon;
        case 'eye-off':
          return EyesWhiteIcon;
        case 'earth':
          return EarthIcon;
        case 'earth-white':
          return EarthWhiteIcon;
        case 'earth2':
          return Earth2Icon;
        default:
          return HomeIcon;
      }
    }
  };

  const styles = StyleSheet.create({
    icon: {
      width: size,
      height: size,
    },
  });

  const iconSource = getIconSource();
  const fallbackSource = Platform.OS === 'web' ? '/icons/home.png' : HomeIcon;
  
  return (
    <Image
      source={imageError ? fallbackSource : iconSource}
      style={[styles.icon, style]}
      resizeMode="contain"
      onError={() => {
        console.warn(`Failed to load icon: ${name}`);
        setImageError(true);
      }}
    />
  );
};

export default Icon;
