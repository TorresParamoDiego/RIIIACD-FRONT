import { useEffect } from 'react';
import { siteConfig } from '@/config/site';

/** Actualiza el título de la pestaña para cada página. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${siteConfig.siglas}` : `${siteConfig.siglas} · ${siteConfig.nombreBreve}`;
  }, [title]);
}
