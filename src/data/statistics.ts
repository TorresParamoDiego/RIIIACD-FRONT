import type { InstitutionType } from '@/types/institution';
import type { NetworkStatistics } from '@/types/statistics';

/**
 * Cifras oficiales de la red. ÚNICO lugar donde se definen: los componentes
 * las leen de aquí y nunca las escriben directamente.
 *
 * Cuando el padrón oficial del Excel esté integrado, estas cifras podrán
 * calcularse a partir de los datos (ver `computeStatisticsFromData`).
 */
export const networkStatistics: NetworkStatistics = {
  integrantes: 88,
  instituciones: 36,
  institucionesPorTipo: {
    tecnologico: 23,
    'centro-investigacion': 2,
    universidad: 11,
  },
};

export interface StatisticItem {
  id: string;
  valor: number;
  etiqueta: string;
  tipo?: InstitutionType;
}

/** Lista plana de indicadores para tarjetas y lectores de pantalla. */
export const statisticItems: StatisticItem[] = [
  { id: 'integrantes', valor: networkStatistics.integrantes, etiqueta: 'Integrantes' },
  { id: 'instituciones', valor: networkStatistics.instituciones, etiqueta: 'Instituciones' },
  {
    id: 'tecnologicos',
    valor: networkStatistics.institucionesPorTipo.tecnologico,
    etiqueta: 'Institutos tecnológicos',
    tipo: 'tecnologico',
  },
  {
    id: 'centros',
    valor: networkStatistics.institucionesPorTipo['centro-investigacion'],
    etiqueta: 'Centros de investigación',
    tipo: 'centro-investigacion',
  },
  {
    id: 'universidades',
    valor: networkStatistics.institucionesPorTipo.universidad,
    etiqueta: 'Universidades',
    tipo: 'universidad',
  },
];

/** Advierte en desarrollo si el desglose por tipo no coincide con el total. */
export function validateStatistics(stats: NetworkStatistics = networkStatistics): string[] {
  const issues: string[] = [];
  const sumaTipos = Object.values(stats.institucionesPorTipo).reduce((acc, n) => acc + n, 0);
  if (sumaTipos !== stats.instituciones) {
    issues.push(
      `La suma por tipo (${sumaTipos}) no coincide con el total de instituciones (${stats.instituciones}).`,
    );
  }
  return issues;
}
