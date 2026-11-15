import { getInitialTheme } from '../../src/theme/theme.js';

test('stored choice wins', () => expect(getInitialTheme({ stored: 'dark', prefersDark: false })).toBe('dark'));
test('falls back to OS preference', () => expect(getInitialTheme({ stored: null, prefersDark: true })).toBe('dark'));
test('ignores junk in storage', () => expect(getInitialTheme({ stored: 'purple', prefersDark: false })).toBe('light'));
