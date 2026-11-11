import { BrainCircuit, HeartPulse, MapPinned, Scale, Waypoints, type LucideIcon } from 'lucide-react';
import type { ResearchLineId } from '@/types/research';

/**
 * Presentación visual de cada línea (icono y color). Se separa de los datos
 * para que `src/data/researchLines.ts` siga siendo serializable.
 *
 * Paleta de la familia azul-verde (brief fase 2, punto 4). Contrastes WCAG
 * verificados con la fórmula de luminancia relativa:
 *
 *   - `color` como texto sobre blanco y sobre su propio tinte al 8-10 %: ≥ 5.0:1.
 *   - `colorOnDark` como texto sobre `#1B396A` y sobre su tinte al 16 %: ≥ 4.8:1.
 *
 * Línea 4 usa un índigo para separarse de la línea 1 (azul); queda dentro de
 * la familia fría y puede ajustarse si el manual de identidad lo pide.
 */
export interface LineTheme {
  icon: LucideIcon;
  color: string;
  colorOnDark: string;
}

export const lineThemes: Record<ResearchLineId, LineTheme> = {
  'linea-1': { icon: Waypoints, color: '#1F5FBF', colorOnDark: '#A9CCF8' }, // azul          6.09 / 6.89
  'linea-2': { icon: BrainCircuit, color: '#117533', colorOnDark: '#86E3A5' }, // verde         5.81 / 7.36
  'linea-3': { icon: MapPinned, color: '#0B6B63', colorOnDark: '#6FDCCB' }, // verde azulado 6.37 / 6.94
  'linea-4': { icon: Scale, color: '#5B3FA8', colorOnDark: '#D3C6F7' }, // índigo        7.72 / 7.17
  'linea-5': { icon: HeartPulse, color: '#3D6B1F', colorOnDark: '#D5EDB4' }, // verde hoja    6.32 / 9.02
};

export const NEUTRAL_LINE_COLOR = '#5B6B82';

export function getLineTheme(id: ResearchLineId | null | undefined): LineTheme | undefined {
  return id ? lineThemes[id] : undefined;
}

/** Tinte suave del color de una línea para fondos de iconos o insignias. */
export function tint(color: string, percent = 10, base = 'white'): string {
  return `color-mix(in srgb, ${color} ${percent}%, ${base})`;
}
