import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';
import TabBarIcon from './TabBarIcon';

const DoubleTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state: gameState, setGameSummaryModalVisible } = useGame();

  const getTabTextColor = (routeName: string, isFocused: boolean) => {
    if (!isFocused) return theme.colors.textSecondary; // 未選取為灰色
    
    switch (routeName) {
      case 'Home':
        return '#10B981'; // 綠色
      case 'Game':
        return '#3B82F6'; // 藍色
      case 'Settings':
        return '#8B5CF6'; // 紫色
      default:
        return theme.colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingTop: 12,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.border,
    },
    upperRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      marginBottom: 8,
    },
    lowerRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 20,
      paddingTop: 8,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 4,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '500',
      marginTop: 4,
      letterSpacing: 0.2,
      color: theme.colors.text,
    },
    activeTabLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 4,
      letterSpacing: 0.2,
    },
  });

  const activeRouteName = state.routes[state.index]?.name;
  const showUpper = activeRouteName === 'Game' && !gameState.gameSummaryModalVisible;

  return (
    <View style={styles.container}>
      {showUpper && (
        <View style={styles.upperRow}>
          <Button
            title={t('modals.gameSummary')}
            onPress={() => {
              console.log('牌局總結按鈕被點擊');
              setGameSummaryModalVisible(true);
            }}
            size="md"
            style={{ flex: 1, marginRight: theme.spacing.xs }}
            leftIconName="number"
            textStyle={colorMode === 'light' ? { color: '#64748B' } : undefined}
          />
          <Button
            title={t('modals.endGame')}
            onPress={() => {
              // 直接導航到結束牌局頁面，顯示 EndGameModal
              navigation.navigate('Game', { action: 'end_direct' });
            }}
            size="md"
            variant="danger"
            style={{ flex: 1, marginLeft: theme.spacing.xs }}
            leftIconName="close"
          />
        </View>
      )}

      <View style={styles.lowerRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          // Safari 上 isFocused 可能異常，改用 route key 與 state.index 比對以保險
          const isFocused = state.routes[state.index]?.key === route.key;
          const onPress = () => {
            try { console.log('[tabPress]', { routeName: route.name, index, stateIndex: state.index }); } catch {}
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          // 讓圖示顏色跟隨標籤文字顏色，未選取時為灰色
          const labelColor = isFocused
            ? getTabTextColor(route.name, true)
            : theme.colors.textSecondary;
          const color = labelColor;
          const size = 24;
          const IconRenderer = options.tabBarIcon as any;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={1}
            >
              {IconRenderer ? (
                <IconRenderer color={color} size={size} focused={isFocused} />
              ) : (
                <TabBarIcon name={'home'} color={color} size={size} focused={isFocused} />
              )}
              <Text style={[
                isFocused ? styles.activeTabLabel : styles.tabLabel,
                { color: labelColor }
              ]}>{label as string}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default DoubleTabBar;


