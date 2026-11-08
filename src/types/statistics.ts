import type { InstitutionType } from './institution';

export interface NetworkStatistics {
  integrantes: number;
  instituciones: number;
  institucionesPorTipo: Record<InstitutionType, number>;
  /** Fecha de corte del dato (ISO 8601). Opcional hasta que se documente. */
  fechaCorte?: string;
}
