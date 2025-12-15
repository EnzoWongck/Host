// src/preview/GrokStylePreview.tsx（Web 加強版，直接覆蓋剛才那個）
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const columns = isWeb ? (width > 800 ? 4 : 3) : 3; // 桌面 4 欄，手機 3 欄

const buttons = [
  { icon: '💰', label: '買入' },
  { icon: '💵', label: '兌現' },
  { icon: '🎫', label: '入場費' },
  { icon: '💸', label: '服務費' },
  { icon: '📝', label: '支出' },
  { icon: '🛡️', label: '保險' },
  { icon: '👤', label: '發牌員' },
  { icon: '📊', label: '牌局總結' },
];

export default function GrokStylePreview() {
  const [isDark, setIsDark] = React.useState(true);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#0F1419' : '#F7F9F9',
    card: isDark ? '#1E293B' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#0F1419',
    secondary: '#71767B',
    accent: '#1D9BF0',
    tagActiveBg: isDark ? '#FFFFFF' : '#0F1419',
    tagActiveText: isDark ? '#000000' : '#FFFFFF',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Math.max(16, isWeb ? Math.min(16, (width - 400) / 2) : 16), // 桌面留白更大
          paddingTop: isWeb ? 60 : insets.top + 20,
          paddingBottom: isWeb ? 100 : insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        // Web 專用極致順滑
        {...(isWeb ? { 
          style: { 
            scrollBehavior: 'smooth' as any,
            overscrollBehavior: 'none' as any,
          } 
        } : {})}>
        
        {/* 標題 */}
        <Text style={{ 
          fontSize: 36, 
          fontWeight: '800', 
          color: theme.text, 
          marginBottom: 40, 
          fontFamily: isWeb ? '-apple-system, BlinkMacSystemFont, sans-serif' : undefined 
        }}>
          Host27o × Grok 風格（Web 版已完美）
        </Text>

        {/* 按鈕格子 */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: isWeb ? 20 : 12, 
          justifyContent: 'center', // 桌面置中更好看
          marginBottom: 60 
        }}>
          {buttons.map((b, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <Pressable
                key={i}
                style={({ pressed }) => [{
                  backgroundColor: i < 6 ? theme.card : theme.surface,
                  height: 92,
                  width: isWeb ? 160 : (width - 56 - (columns-1)*12) / columns,
                  borderRadius: 22,
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: [{ scale: pressed ? 0.95 : isHovered ? 1.03 : 1 }], // Web hover 縮放
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isHovered ? 0.2 : 0.12,
                  shadowRadius: 16,
                  elevation: 12,
                }]}
                // Web 專用 hover 效果
                {...(isWeb ? { 
                  onHoverIn: () => setHoveredIndex(i),
                  onHoverOut: () => setHoveredIndex(null),
                } : {})}>
                <Text style={{ fontSize: 34 }}>{b.icon}</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginTop: 8 }}>
                  {b.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 狀態標籤範例 */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 40, justifyContent: 'center' }}>
          <View style={{ backgroundColor: theme.tagActiveBg, paddingHorizontal: 16, height: 32, borderRadius: 16, justifyContent: 'center' }}>
            <Text style={{ color: theme.tagActiveText, fontSize: 13, fontWeight: '600' }}>進行中</Text>
          </View>
          <View style={{ backgroundColor: theme.surface, paddingHorizontal: 16, height: 32, borderRadius: 16, justifyContent: 'center' }}>
            <Text style={{ color: theme.secondary, fontSize: 13, fontWeight: '600' }}>已兌現</Text>
          </View>
        </View>

        {/* 切換按鈕 */}
        <Pressable
          onPress={() => setIsDark(!isDark)}
          style={({ pressed }) => [{
            backgroundColor: theme.accent,
            height: 60,
            width: isWeb ? 320 : width - 80,
            alignSelf: 'center',
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
          }]}>
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>
            切換至 {isDark ? '淺色' : '深色'} 模式
          </Text>
        </Pressable>

        {isWeb && (
          <Text style={{ marginTop: 40, textAlign: 'center', color: theme.secondary, fontSize: 14 }}>
            ← 桌面鼠標懸停有放大效果 · 手機觸摸一樣流暢
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

