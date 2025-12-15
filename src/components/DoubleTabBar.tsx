import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Alert } from 'react-native';
import Button from './Button';
import TabBarIcon from './TabBarIcon';
import Icon from './Icon';

const DoubleTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme, colorMode } = useTheme();
  const { t } = useLanguage();
  const { state: gameState, setGameSummaryModalVisible } = useGame();
  const { trialEnded, isSubscribed } = useSubscription();
  
  const canEdit = !(trialEnded && !isSubscribed);

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
      borderTopWidth: 0, // 移除默認邊框，使用自定義下陷效果
      borderTopColor: theme.colors.border,
      position: 'relative',
      overflow: 'visible', // 允許按鈕超出容器
    },
    borderContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 0.5,
      flexDirection: 'row',
    },
    borderLeft: {
      flex: 1,
      height: 0.5,
      backgroundColor: theme.colors.border,
      marginRight: 44, // 留出按鈕空間
    },
    borderRight: {
      flex: 1,
      height: 0.5,
      backgroundColor: theme.colors.border,
      marginLeft: 44, // 留出按鈕空間
    },
    borderFull: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 0.5,
      backgroundColor: theme.colors.border,
    },
    upperRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      gap: theme.spacing.lg, // 增加按鈕之間的間距
      paddingLeft: 16, // 貼近左側屏幕邊緣
      paddingRight: 16, // 貼近右側屏幕邊緣
    },
    lowerRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 4,
      position: 'relative',
    },
    activeTabBackground: {
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: [{ translateX: -20 }],
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(59, 130, 246, 0.15)', // 半透明藍色背景
      zIndex: -1,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '500',
      marginTop: 4,
      letterSpacing: 0.2,
      color: theme.colors.textSecondary, // 未選中時為灰色
    },
    activeTabLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 4,
      letterSpacing: 0.2,
    },
    floatingAddButton: {
      position: 'absolute',
      top: -50, // 向下移動
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
    },
    addButtonTouchable: {
      width: 88,
      height: 88,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    addButtonIcon: {
      width: 88,
      height: 88,
    },
  });

  const activeRouteName = state.routes[state.index]?.name;
  const showUpper = activeRouteName === 'Game' && !gameState.gameSummaryModalVisible;

  return (
    <View style={styles.container}>
      {/* 下陷的邊框線條 */}
      {!gameState.gameSummaryModalVisible && showUpper && (
        <View style={styles.borderContainer}>
          <View style={styles.borderLeft} />
          <View style={styles.borderRight} />
        </View>
      )}
      {!gameState.gameSummaryModalVisible && !showUpper && (
        <View style={styles.borderFull} />
      )}
      
      {/* 浮起的 add.png 按鈕（一半在 tabbar 上方，一半在 tabbar 區域內） */}
      {showUpper && (
        <View style={styles.floatingAddButton}>
          <TouchableOpacity
            onPress={() => {
              if (!canEdit) {
                Alert.alert(
                  '試用已到期',
                  '你的免費試用已完結，請訂閱後再新增買入。',
                  [{ text: '確定' }]
                );
                return;
              }
              // 導航到 Game 頁面並打開買入 modal
              navigation.navigate('Game', { action: 'buy_in' });
            }}
            activeOpacity={0.85}
            style={styles.addButtonTouchable}
            disabled={!canEdit}
          >
            <Icon 
              name="add" 
              size={88} 
              style={styles.addButtonIcon}
            />
          </TouchableOpacity>
        </View>
      )}

      {showUpper && (
        <View style={styles.upperRow}>
          <Button
            title={t('modals.gameSummary')}
            onPress={() => {
              console.log('牌局總結按鈕被點擊');
              setGameSummaryModalVisible(true);
            }}
            size="md"
            style={{ flex: 1 }}
            leftIconName="number"
            textStyle={colorMode === 'light' ? { color: '#64748B' } : undefined}
          />
          <Button
            title={t('modals.endGame')}
            onPress={() => {
              if (!canEdit) {
                Alert.alert(
                  '試用已到期',
                  '你的免費試用已完結，請訂閱後再結束牌局。',
                  [{ text: '確定' }]
                );
                return;
              }
              // 直接導航到結束牌局頁面，顯示 EndGameModal
              navigation.navigate('Game', { action: 'end_direct' });
            }}
            size="md"
            variant="primary"
            style={{ flex: 1, opacity: !canEdit ? 0.5 : 1 }}
            leftIconName="close"
            textStyle={colorMode === 'light' ? { color: '#64748B' } : undefined}
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
            
            // 如果點擊"目前牌局"，無論任何視窗，都關閉所有視窗並返回目前牌局主頁
            if (route.name === 'Game') {
              // 關閉牌局總結視窗
              if (gameState.gameSummaryModalVisible) {
                setGameSummaryModalVisible(false);
              }
              // 導航到目前牌局頁面（如果不在該頁面）
              if (!isFocused) {
                navigation.navigate('Game' as never);
              }
              return;
            }
            
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
              {/* 去除選中狀態的填充背景，只在選擇時改變顏色 */}
              {IconRenderer ? (
                <IconRenderer color={color} size={size} focused={isFocused} />
              ) : (
                <TabBarIcon name={'home'} color={color} size={size} focused={isFocused} />
              )}
              <Text style={[
                isFocused ? styles.activeTabLabel : styles.tabLabel,
                { 
                  color: labelColor,
                }
              ]}>{label as string}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 浮起的紅色大按鈕（放在 tabbar 上方） */}
      {showUpper && (
        <View style={styles.floatingAddButton}>
          <TouchableOpacity
            onPress={() => {
              if (!canEdit) {
                Alert.alert(
                  '試用已到期',
                  '你的免費試用已完結，請訂閱後再新增買入。',
                  [{ text: '確定' }]
                );
                return;
              }
              // 導航到 Game 頁面並打開買入 modal
              navigation.navigate('Game', { action: 'buy_in' });
            }}
            activeOpacity={0.85}
            style={styles.addButtonTouchable}
            disabled={!canEdit}
          >
            <Icon 
              name="add" 
              size={88} 
              style={styles.addButtonIcon}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default DoubleTabBar;


