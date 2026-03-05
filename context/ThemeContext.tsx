import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

const ThemeContext = createContext({
  dark: false,
  colors: Colors.light,
  setDark: (dark: boolean) => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [dark, setDark] = useState(systemColorScheme === 'dark');

  const theme = {
    dark,
    colors: dark ? Colors.dark : Colors.light,
    setDark,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);