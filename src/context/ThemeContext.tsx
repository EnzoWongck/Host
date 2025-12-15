import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorMode, Theme, lightTheme, darkTheme } from '../types/theme';

interface ThemeContextType {
  colorMode: ColorMode;
  theme: Theme;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 預設為深色模式
  const [colorMode, setColorModeState] = useState<ColorMode>('dark');

  const theme = colorMode === 'light' ? lightTheme : darkTheme;

  const loadColorMode = async () => {
    try {
      const stored = await AsyncStorage.getItem('colorMode');
      if (stored === 'dark' || stored === 'light') {
        setColorModeState(stored);
      } else {
        // 如果沒有存儲的偏好，使用深色模式作為預設
        setColorModeState('dark');
      }
    } catch (error) {
      console.error('Error loading color mode:', error);
      // 錯誤時也使用深色模式作為預設
      setColorModeState('dark');
    }
  };

  const saveColorMode = async (mode: ColorMode) => {
    try {
      await AsyncStorage.setItem('colorMode', mode);
    } catch (error) {
      console.error('Error saving color mode:', error);
    }
  };

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
    saveColorMode(mode);
  };

  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
  };

  useEffect(() => {
    loadColorMode();
  }, []);

  const contextValue: ThemeContextType = {
    colorMode,
    theme,
    toggleColorMode,
    setColorMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};





