import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/mr-dafoe/400.css';
import '@fontsource/barlow-condensed/600-italic.css';
import '@fontsource/barlow-condensed/800-italic.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import './styles/theme.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
