import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vitest 3 bundles its own esbuild-based Vite, which needs the automatic JSX runtime spelled out for .jsx tests.
  // shortcut: drop this once Vitest 5 installs (npm 10.9.2 crashes resolving its optional peers).
  esbuild: { jsx: 'automatic' },
  test: { globals: true },
});
