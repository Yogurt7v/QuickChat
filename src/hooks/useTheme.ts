import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}