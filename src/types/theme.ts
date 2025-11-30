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
    primary: '#E2E8F0',      // 深灰按鈕
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
    default: 'SF Pro Display',
    zhTW: 'PingFang TC',
    zhCN: 'Microsoft YaHei',
  },
  colorMode: 'light',
};

export const darkTheme: Theme = {
  colors: {
    primary: '#303134',      // 深灰按鈕
    secondary: '#303134',    // 深灰
    background: '#1A1A1A',   // 深灰色背景
    surface: '#202124',      // 卡片背景（比背景稍亮，保持層次感）
    text: '#FFFFFF',         // 白色文字
    textSecondary: '#D1D5DB', // 更亮的次要文字
    border: '#3A3A3A',       // 邊框顏色（比surface稍亮）
    success: '#FFFFFF',      // 白色（深色模式下替代綠色文字）
    error: '#EF4444',        // 紅色
    warning: '#F59E0B',      // 橙色（保留用於警告）
    info: '#6B7280',         // 灰色
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
    default: 'SF Pro Display',
    zhTW: 'PingFang TC',
    zhCN: 'Microsoft YaHei',
  },
  colorMode: 'dark',
};
