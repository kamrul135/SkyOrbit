import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

const STORAGE_KEY = 'skyorbit-theme';
const VALID_THEMES = ['light', 'dark'];

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  // 1. Explicit user preference saved in localStorage wins.
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_THEMES.includes(saved)) return saved;
  } catch (e) {
    /* ignore storage errors (Safari private mode etc.) */
  }

  // 2. Honor OS-level preference when no saved value exists.
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (e) {
    /* matchMedia unavailable */
  }

  // 3. Default to dark to match the existing brand experience.
  return 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Apply the theme class to <body> so every CSS rule under `body.dark` /
  // `body.light` (and `body.theme-X` fallbacks) takes effect.
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* no-op */
    }
  }, [theme]);

  // Keep multiple tabs in sync when the user toggles theme in one tab.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY && event.newValue && VALID_THEMES.includes(event.newValue)) {
        setThemeState(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((next) => {
    if (VALID_THEMES.includes(next)) setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback so a missing provider never crashes the tree.
    return { theme: 'dark', toggleTheme: () => {}, setTheme: () => {} };
  }
  return ctx;
};

export default ThemeContext;