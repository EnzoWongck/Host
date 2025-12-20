import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

interface SwipeHintProps {
  storageKey: string; // 用於區分不同頁面的提示
  show?: boolean;     // 是否顯示（由父組件控制）
}

const SWIPE_HINT_PREFIX = 'swipeHintShown_';

export const useSwipeHint = (storageKey: string) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkHintStatus = async () => {
      try {
        const key = `${SWIPE_HINT_PREFIX}${storageKey}`;
        const shown = await AsyncStorage.getItem(key);
        if (!shown) {
          setShouldShow(true);
        }
        setHasChecked(true);
      } catch (error) {
        console.error('Error checking swipe hint status:', error);
        setHasChecked(true);
      }
    };
    checkHintStatus();
  }, [storageKey]);

  const dismissHint = async () => {
    try {
      const key = `${SWIPE_HINT_PREFIX}${storageKey}`;
      await AsyncStorage.setItem(key, 'true');
      setShouldShow(false);
    } catch (error) {
      console.error('Error saving swipe hint status:', error);
    }
  };

  return { shouldShow: hasChecked && shouldShow, dismissHint };
};

const SwipeHint: React.FC<SwipeHintProps> = ({ storageKey, show = true }) => {
  const { theme, colorMode } = useTheme();
  const { shouldShow, dismissHint } = useSwipeHint(storageKey);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  useEffect(() => {
    if (shouldShow && show) {
      // 淡入動畫
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 3秒後自動消失
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          dismissHint();
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldShow, show, fadeAnim, slideAnim, dismissHint]);

  if (!shouldShow || !show) return null;

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    hintBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorMode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colorMode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
    },
    arrow: {
      fontSize: 16,
      color: '#6366F1',
      marginRight: 8,
    },
    text: {
      fontSize: 13,
      color: colorMode === 'dark' ? '#A5B4FC' : '#6366F1',
      fontWeight: '500',
    },
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <View style={styles.hintBox}>
        <Text style={styles.arrow}>←</Text>
        <Text style={styles.text}>滑動可編輯/刪除</Text>
      </View>
    </Animated.View>
  );
};

export default SwipeHint;


