import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, Translations } from '../types/language';
import { zhTW } from '../locales/zh-TW';
import { zhCN } from '../locales/zh-CN';

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationsMap: Record<Language, Translations> = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh-TW');

  const translations = translationsMap[language];

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem('language');
      if (stored === 'zh-TW' || stored === 'zh-CN') {
        setLanguageState(stored);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const saveLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  useEffect(() => {
    loadLanguage();
  }, []);

  // Helper function to get nested translation by key path (e.g., "game.title")
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return typeof value === 'string' ? value : key;
  };

  const contextValue: LanguageContextType = {
    language,
    translations,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

