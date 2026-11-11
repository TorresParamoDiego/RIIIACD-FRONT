import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { validateStatistics } from '@/data/statistics';
// Archivo alojada localmente (Fontsource, ejes de peso 100-900 y anchura 62-125 %).
// Ya no se carga desde Google Fonts: sin dependencia externa ni excepción en la CSP.
import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/archivo/standard-italic.css';
import './styles/globals.css';

if (import.meta.env.DEV) {
  for (const issue of validateStatistics()) console.warn(`[RIIIACD] ${issue}`);
}

const container = document.getElementById('root');
if (!container) throw new Error('No se encontró el elemento #root en index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
