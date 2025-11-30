/* ===== host27o.com 新的 UI 設計預覽（YouTube 2025 風格 + 撲克主題）===== */

export type ColorMode = 'light' | 'dark';

export interface YouTubePokerTheme {
  colors: {
    // 背景色
    bgPrimary: string;      // 主背景
    bgSurface: string;       // 表面背景
    cardBg: string;         // 卡片背景
    cardHover: string;      // 卡片懸停背景
    
    // 邊框
    borderLine: string;     // 邊框線
    
    // 文字
    textPrimary: string;    // 主要文字
    textSecondary: string;  // 次要文字
    textMuted: string;      // 弱化文字
    
    // 強調色（撲克主題）
    accentRed: string;      // 撲克紅心/方塊（比YouTube紅更亮眼）
    accentBlue: string;     // YouTube/Grok 藍，hover 用
    
    // 陰影
    shadowCard: string;     // 卡片陰影
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;           // 圓形按鈕（999px）
  };
  transitions: {
    default: string;        // 預設過渡效果
  };
}

// ── 暗黑模式（完全複製 YouTube 暗色）──
export const youtubePokerDarkTheme: YouTubePokerTheme = {
  colors: {
    bgPrimary: '#0F0F0F',           // YouTube 暗色主背景
    bgSurface: '#181818',           // YouTube 暗色表面
    cardBg: '#212121',              // 卡片背景
    cardHover: '#2A2A2A',           // 卡片懸停
    borderLine: '#303030',          // 邊框線
    textPrimary: '#FFFFFF',        // 主要文字（白色）
    textSecondary: '#AAAAAA',       // 次要文字
    textMuted: '#717171',           // 弱化文字
    accentRed: '#FF3333',           // 撲克紅心/方塊（比YouTube紅更亮眼）
    accentBlue: '#3EA6FF',          // YouTube/Grok 藍
    shadowCard: '0 1px 3px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,                      // 圓形按鈕
  },
  transitions: {
    default: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
  },
};

// ── 淺色模式（100% 複製 YouTube 淺色）──
export const youtubePokerLightTheme: YouTubePokerTheme = {
  colors: {
    bgPrimary: '#FFFFFF',           // YouTube 淺色主背景
    bgSurface: '#F9F9F9',           // YouTube 淺色表面
    cardBg: '#F1F1F1',              // 卡片背景
    cardHover: '#E5E5E5',           // 卡片懸停
    borderLine: '#DADCE0',          // 邊框線
    textPrimary: '#030303',         // 主要文字（深黑）
    textSecondary: '#5F6368',       // 次要文字
    textMuted: '#9AA0A6',           // 弱化文字
    accentRed: '#FF3333',           // 紅在淺色下依然醒目
    accentBlue: '#065FD4',          // YouTube 藍
    shadowCard: '0 1px 2px rgba(0,0,0,0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,                      // 圓形按鈕
  },
  transitions: {
    default: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
  },
};

