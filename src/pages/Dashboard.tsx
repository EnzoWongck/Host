// src/pages/Dashboard.tsx

import React, { useEffect } from 'react';

import { Platform } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Asset } from 'expo-asset';
// 靜態導入圖標
import HomeIconAsset from '../../assets/icons/home.png';
import PokercardIconAsset from '../../assets/icons/pokercard.png';
import SettingsIconAsset from '../../assets/icons/settings.png';
import Player2IconAsset from '../../assets/icons/player2.png';
import Connect2IconAsset from '../../assets/icons/connect2.png';
import CopyIconAsset from '../../assets/icons/copy.png';
import Inout2IconAsset from '../../assets/icons/inout2.png';
import RakeIconAsset from '../../assets/icons/rake.png';
import CostIconAsset from '../../assets/icons/cost.png';
import DealerIconAsset from '../../assets/icons/dealer.png';
import EarthIconAsset from '../../assets/icons/earth.png';
import EarthWhiteIconAsset from '../../assets/icons/earth.white.png';

import { useTheme } from '@/context/ThemeContext';

import { useLanguage } from '@/context/LanguageContext';

import HomeScreen from '@/screens/HomeScreen';

import GameScreen from '@/screens/GameScreen';

import SettingsScreen from '@/screens/SettingsScreen';

import TabBarIcon from '@/components/TabBarIcon';

import DoubleTabBar from '@/components/DoubleTabBar';

import { RootTabParamList } from '@/types/navigation';



const Tab = createBottomTabNavigator<RootTabParamList>();



export default function Dashboard() {

  const { theme } = useTheme();

  const { t } = useLanguage();

  

  useEffect(() => {

    // 預先載入常用 icon，避免 Expo Go 上延遲顯示
    // 在 Web 平台上跳過 Asset.loadAsync，因為它可能會使用 resolveAssetSource
    if (Platform.OS !== 'web') {
      Asset.loadAsync([

        HomeIconAsset,

        PokercardIconAsset,

        SettingsIconAsset,

        Player2IconAsset,

        Connect2IconAsset,

        CopyIconAsset,

        Inout2IconAsset,

        RakeIconAsset,

        CostIconAsset,

        DealerIconAsset,

        EarthIconAsset,

        EarthWhiteIconAsset,

      ]).catch(() => {});
    }

  }, []);



  // 防止手機輸入欄位彈出鍵盤時網頁自動放大

  useEffect(() => {

    if (Platform.OS === 'web' && typeof document !== 'undefined') {

      const handleFocus = (e: FocusEvent) => {

        const target = e.target as HTMLElement;

        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {

          document.body.style.zoom = '1';

        }

      };

      

      const handleBlur = () => {

        document.body.style.zoom = '';

      };



      document.addEventListener('focusin', handleFocus);

      document.addEventListener('focusout', handleBlur);



      return () => {

        document.removeEventListener('focusin', handleFocus);

        document.removeEventListener('focusout', handleBlur);

      };

    }

  }, []);



  return (

    <NavigationContainer>

      <Tab.Navigator

        tabBar={(props) => <DoubleTabBar {...props} />}

        screenOptions={{

          headerShown: false,

          tabBarStyle: {

            backgroundColor: theme.colors.background,

            borderTopWidth: 1,

            borderTopColor: theme.colors.border,

            height: 80,

            paddingBottom: 20,

            paddingTop: 10,

          },

          tabBarActiveTintColor: theme.colors.primary,

          tabBarInactiveTintColor: theme.colors.textSecondary,

          tabBarLabelStyle: {

            fontSize: 12,

            fontWeight: '600',

          },

        }}

      >

        <Tab.Screen

          name="Home"

          component={HomeScreen}

          options={{

            title: t('navigation.home'),

            tabBarIcon: ({ color, size, focused }) => (

              <TabBarIcon name="home" color={color} size={size} focused={focused} />

            ),

          }}

        />

        <Tab.Screen

          name="Game"

          component={GameScreen}

          options={{

            title: t('navigation.game'),

            tabBarIcon: ({ color, size, focused }) => (

              <TabBarIcon name="target" color={color} size={size} focused={focused} />

            ),

          }}

        />

        <Tab.Screen

          name="Settings"

          component={SettingsScreen}

          options={{

            title: t('navigation.settings'),

            tabBarIcon: ({ color, size, focused }) => (

              <TabBarIcon name="settings" color={color} size={size} focused={focused} />

            ),

          }}

        />

      </Tab.Navigator>

    </NavigationContainer>

  );

}
