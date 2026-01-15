import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, Animated, Platform } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  formatNumber?: (num: number) => string;
  decimals?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  prefix = '',
  suffix = '',
  style,
  formatNumber,
  decimals = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;

    // 重置動畫值
    animatedValue.setValue(0);

    // 創建動畫
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false, // 文字更新需要關閉原生驅動
    }).start();

    // 監聽動畫值變化
    const listenerId = animatedValue.addListener(({ value: progress }) => {
      const currentValue = startValue + (endValue - startValue) * progress;
      setDisplayValue(currentValue);
    });

    // 更新前一個值
    previousValue.current = endValue;

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, duration, animatedValue]);

  // 格式化數字
  const formattedValue = formatNumber
    ? formatNumber(displayValue)
    : decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <Text style={style}>
      {prefix}{formattedValue}{suffix}
    </Text>
  );
};

export default AnimatedNumber;



