/**
 * Líneas de investigación oficiales de la red.
 * El modelo es serializable (sin componentes ni colores) para que pueda
 * provenir directamente de una API en fases posteriores.
 */
export const RESEARCH_LINE_IDS = ['linea-1', 'linea-2', 'linea-3', 'linea-4', 'linea-5'] as const;

export type ResearchLineId = (typeof RESEARCH_LINE_IDS)[number];

export interface ResearchLine {
  id: ResearchLineId;
  /** Número oficial de la línea (1–5). */
  numero: number;
  /** Segmento de URL: /lineas-investigacion/:slug */
  slug: string;
  nombre: string;
  /** Versión breve para etiquetas, filtros y tarjetas compactas. */
  nombreCorto: string;
  descripcion: string;
  /** Ejes temáticos tomados literalmente del nombre oficial de la línea. */
  ejes: string[];
  /** Referencia al integrante responsable (id en el directorio). */
  responsableId: string;
  /**
   * Términos usados por el mapper del Excel para asociar el texto libre de la
   * columna "LÍNEA DE INVESTIGACIÓN PROPUESTA…" con esta línea.
   */
  palabrasClave: string[];
}

export function isResearchLineId(value: string): value is ResearchLineId {
  return (RESEARCH_LINE_IDS as readonly string[]).includes(value);
}
