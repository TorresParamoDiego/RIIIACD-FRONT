import { BrainCircuit, HeartPulse, MapPinned, Scale, Waypoints, type LucideIcon } from 'lucide-react';
import type { ResearchLineId } from '@/types/research';

/**
 * Presentación visual de cada línea (icono y color). Se separa de los datos
 * para que `src/data/researchLines.ts` siga siendo serializable.
 *
 * Los colores pertenecen a la familia azul-cian de la identidad; `color` se
 * usa sobre fondos claros (contraste ≥ 4.5:1 con blanco) y `colorOnDark`
 * sobre el azul marino.
 */
export interface LineTheme {
  icon: LucideIcon;
  color: string;
  colorOnDark: string;
}

export const lineThemes: Record<ResearchLineId, LineTheme> = {
  'linea-1': { icon: Waypoints, color: '#2563EB', colorOnDark: '#6EA0F7' },
  'linea-2': { icon: BrainCircuit, color: '#0369A1', colorOnDark: '#38BDF8' },
  'linea-3': { icon: MapPinned, color: '#0E7490', colorOnDark: '#22D3EE' },
  'linea-4': { icon: Scale, color: '#4338CA', colorOnDark: '#A5B4FC' },
  'linea-5': { icon: HeartPulse, color: '#123C68', colorOnDark: '#E2E8F0' },
};

export const NEUTRAL_LINE_COLOR = '#64748B';

export function getLineTheme(id: ResearchLineId | null | undefined): LineTheme | undefined {
  return id ? lineThemes[id] : undefined;
}

/** Tinte suave del color de una línea para fondos de iconos o insignias. */
export function tint(color: string, percent = 10, base = 'white'): string {
  return `color-mix(in srgb, ${color} ${percent}%, ${base})`;
}
