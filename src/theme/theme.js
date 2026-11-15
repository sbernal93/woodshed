export const THEME_KEY = 'woodshed:theme';

export function getInitialTheme({ stored, prefersDark }) {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function readInitialTheme() {
  let stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch { /* storage blocked: fall back to OS */ }
  return getInitialTheme({ stored, prefersDark: matchMedia('(prefers-color-scheme: dark)').matches });
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage blocked: theme still applies for this visit */ }
}
