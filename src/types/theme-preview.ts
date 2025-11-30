// 預覽主題 - 僅供預覽，不會套用到實際應用
export type ColorMode = 'light' | 'dark';

export interface PreviewTheme {
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
    accent: string;  // 新增：強調色
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
}

// 方案 A：現代簡約風格（淺色為主，柔和色調）
export const previewThemeA_Light: PreviewTheme = {
  colors: {
    primary: '#4F46E5',        // 靛藍色（現代感）
    secondary: '#7C3AED',      // 紫色
    background: '#F9FAFB',     // 極淺灰背景
    surface: '#FFFFFF',        // 純白卡片
    text: '#111827',           // 深黑文字
    textSecondary: '#6B7280', // 中灰文字
    border: '#E5E7EB',         // 淺灰邊框
    success: '#059669',        // 翠綠色
    error: '#DC2626',          // 鮮紅色
    warning: '#D97706',        // 橙黃色
    info: '#0284C7',           // 天藍色
    accent: '#F59E0B',        // 金色強調
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
};

export const previewThemeA_Dark: PreviewTheme = {
  colors: {
    primary: '#6366F1',        // 亮靛藍
    secondary: '#8B5CF6',      // 亮紫色
    background: '#0F172A',     // 深藍黑背景
    surface: '#1E293B',        // 深藍灰卡片
    text: '#F1F5F9',           // 淺灰白文字
    textSecondary: '#94A3B8', // 中灰文字
    border: '#334155',         // 深灰邊框
    success: '#10B981',        // 亮綠色
    error: '#F87171',          // 亮紅色
    warning: '#FBBF24',        // 亮黃色
    info: '#60A5FA',           // 亮藍色
    accent: '#F59E0B',        // 金色強調
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
};

// 方案 B：溫暖舒適風格（暖色調為主）
export const previewThemeB_Light: PreviewTheme = {
  colors: {
    primary: '#EA580C',        // 暖橙色
    secondary: '#DC2626',      // 暖紅色
    background: '#FFF7ED',    // 暖白背景
    surface: '#FFFFFF',        // 純白卡片
    text: '#1C1917',           // 深棕黑文字
    textSecondary: '#78716C',  // 中棕灰文字
    border: '#E7E5E4',         // 淺棕邊框
    success: '#16A34A',        // 暖綠色
    error: '#DC2626',          // 暖紅色
    warning: '#EA580C',        // 暖橙色
    info: '#0284C7',           // 天藍色
    accent: '#F59E0B',        // 金色
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
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
};

export const previewThemeB_Dark: PreviewTheme = {
  colors: {
    primary: '#FB923C',        // 亮橙色
    secondary: '#F87171',      // 亮紅色
    background: '#1C1917',     // 深棕黑背景
    surface: '#292524',       // 深棕灰卡片
    text: '#FAFAF9',           // 淺米白文字
    textSecondary: '#A8A29E', // 中棕灰文字
    border: '#44403C',         // 深棕邊框
    success: '#4ADE80',        // 亮綠色
    error: '#F87171',          // 亮紅色
    warning: '#FB923C',        // 亮橙色
    info: '#60A5FA',           // 亮藍色
    accent: '#FBBF24',        // 亮金色
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
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
};

// 方案 C：高對比專業風格（強烈對比）
export const previewThemeC_Light: PreviewTheme = {
  colors: {
    primary: '#000000',        // 純黑
    secondary: '#1F2937',     // 深灰
    background: '#FFFFFF',     // 純白
    surface: '#F3F4F6',       // 極淺灰
    text: '#000000',           // 純黑文字
    textSecondary: '#4B5563', // 深灰文字
    border: '#D1D5DB',         // 中灰邊框
    success: '#10B981',        // 綠色
    error: '#EF4444',          // 紅色
    warning: '#F59E0B',        // 橙色
    info: '#3B82F6',           // 藍色
    accent: '#6366F1',        // 靛藍
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
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },
};

export const previewThemeC_Dark: PreviewTheme = {
  colors: {
    primary: '#FFFFFF',        // 純白
    secondary: '#E5E7EB',     // 淺灰
    background: '#000000',     // 純黑
    surface: '#111827',       // 深灰
    text: '#FFFFFF',           // 純白文字
    textSecondary: '#9CA3AF', // 中灰文字
    border: '#374151',         // 深灰邊框
    success: '#10B981',        // 綠色
    error: '#EF4444',          // 紅色
    warning: '#F59E0B',        // 橙色
    info: '#3B82F6',           // 藍色
    accent: '#818CF8',        // 亮靛藍
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
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },
};

