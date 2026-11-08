import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { validateStatistics } from '@/data/statistics';
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
