import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  isAccessibilityMode: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  toggleDarkMode: () => void;
  toggleAccessibilityMode: () => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [isAccessibilityMode, setIsAccessibilityMode] = useState(() => {
    const saved = localStorage.getItem('accessibilityMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>(() => {
    const saved = localStorage.getItem('fontSize');
    return (saved as 'normal' | 'large' | 'extra-large') || 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (isAccessibilityMode) {
      root.classList.add('accessibility-mode');
    } else {
      root.classList.remove('accessibility-mode');
    }
    
    localStorage.setItem('accessibilityMode', JSON.stringify(isAccessibilityMode));
  }, [isAccessibilityMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-extra-large');
    root.classList.add(`font-${fontSize}`);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleAccessibilityMode = () => setIsAccessibilityMode(prev => !prev);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        isAccessibilityMode,
        fontSize,
        toggleDarkMode,
        toggleAccessibilityMode,
        setFontSize,
      }}
    >
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
