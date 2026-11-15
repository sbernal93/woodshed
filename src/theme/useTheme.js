import { useCallback, useState } from 'react';
import { applyTheme, readInitialTheme } from './theme.js';

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || readInitialTheme());
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);
  return [theme, toggleTheme];
}
