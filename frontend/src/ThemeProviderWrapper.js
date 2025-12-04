// src/ThemeProviderWrapper.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { getTheme } from './theme';

const STORAGE_KEY = 'app_theme_mode_v1';

const ThemeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
  setMode: (m) => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProviderWrapper = ({ children }) => {
  const [mode, setMode] = useState('light');

  // On mount: read from localStorage, fallback to system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        setMode(stored);
        return;
      }
    } catch (e) {
      // ignore storage errors
    }

    // system pref
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    setMode(prefersDark ? 'dark' : 'light');
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  const ctx = useMemo(() => ({ mode, toggleMode, setMode }), [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
