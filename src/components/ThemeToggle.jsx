import { useTheme } from '../theme/useTheme.js';
import { MoonIcon, SunIcon } from './icons.jsx';

export default function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();
  const dark = theme === 'dark';
  return (
    <button type="button" onClick={toggleTheme} aria-label={dark ? 'Switch to Ocean Drive (light)' : 'Switch to Night Drive (dark)'}
      className="grid size-14 place-items-center rounded-full text-ink hover:bg-ink/10">
      {dark ? <SunIcon className="size-7" /> : <MoonIcon className="size-7" />}
    </button>
  );
}
