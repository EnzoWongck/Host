export type ColorMode = 'light' | 'dark';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    info: string;
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
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontFamily: {
    default: string;
    zhTW: string;
    zhCN: string;
  };
  colorMode: ColorMode;
}

export const lightTheme: Theme = {
  colors: {
    primary: '#10B981',      // 綠色按鈕
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
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
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  fontFamily: {
    default: undefined,
    zhTW: undefined,
    zhCN: 'Microsoft YaHei',
  },
  colorMode: 'light',
};

export const darkTheme: Theme = {
  colors: {
    primary: '#10B981',      // 綠色按鈕
    secondary: '#8B5CF6',    // 更鮮豔的紫色
    background: '#1A1A1A',   // 深灰色背景（RGB: 26, 26, 26，亮度約 10%）
    surface: '#2A2A2A',      // 卡片背景（比背景稍亮，保持層次感）
    text: '#F9FAFB',         // 更亮的白色文字
    textSecondary: '#D1D5DB', // 更亮的次要文字
    border: '#3A3A3A',       // 邊框顏色（比surface稍亮）
    success: '#10B981',      // 更鮮豔的綠色
    error: '#EF4444',        // 更鮮豔的紅色
    warning: '#F59E0B',      // 更鮮豔的橙色
    info: '#06B6D4',         // 更鮮豔的青色
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
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  fontFamily: {
    default: undefined,
    zhTW: undefined,
    zhCN: 'Microsoft YaHei',
  },
  colorMode: 'dark',
};
