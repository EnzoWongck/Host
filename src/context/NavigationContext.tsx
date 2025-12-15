import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface NavigationContextType {
  navigateToWelcome: () => void;
  setNavigateToWelcomeCallback: (callback: () => void) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigationContext = (): NavigationContextType => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigationContext must be used within NavigationProvider');
  return ctx;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [navigateCallback, setNavigateCallback] = useState<(() => void) | null>(null);

  const navigateToWelcome = useCallback(() => {
    if (navigateCallback) {
      navigateCallback();
    }
  }, [navigateCallback]);

  const setNavigateToWelcomeCallback = useCallback((callback: () => void) => {
    setNavigateCallback(() => callback);
  }, []);

  const value = useMemo(() => ({
    navigateToWelcome,
    setNavigateToWelcomeCallback,
  }), [navigateToWelcome, setNavigateToWelcomeCallback]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};


