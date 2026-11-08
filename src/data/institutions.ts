import { dataSourceConfig } from '@/config/dataSource';
import type { Institution, InstitutionType, InstitutionTypeInfo } from '@/types/institution';

export const institutionTypes: InstitutionTypeInfo[] = [
  { id: 'tecnologico', etiqueta: 'Instituto tecnológico', etiquetaPlural: 'Institutos tecnológicos' },
  {
    id: 'centro-investigacion',
    etiqueta: 'Centro de investigación',
    etiquetaPlural: 'Centros de investigación',
  },
  { id: 'universidad', etiqueta: 'Universidad', etiquetaPlural: 'Universidades' },
];

export function getInstitutionTypeInfo(tipo: InstitutionType): InstitutionTypeInfo {
  const info = institutionTypes.find((t) => t.id === tipo);
  if (!info) throw new Error(`Tipo de institución desconocido: ${tipo}`);
  return info;
}

/**
 * Catálogo de instituciones.
 *
 * Instituciones confirmadas: solo se registran las que aparecen en la
 * documentación proporcionada. El CENIDET se identifica a partir del dominio
 * institucional del correo de contacto de la red (cenidet.tecnm.mx).
 *
 * El listado completo de las 36 instituciones se generará desde la columna
 * "INSTITUCIÓN DE ADSCRIPCIÓN" del Excel (ver src/utils/memberMapper.ts).
 */
const confirmedInstitutions: Institution[] = [
  {
    id: 'cenidet',
    nombre: 'Centro Nacional de Investigación y Desarrollo Tecnológico',
    siglas: 'CENIDET',
    tipo: 'centro-investigacion',
    esDemostrativo: false,
  },
];

/**
 * DATOS DEMOSTRATIVOS — no corresponden a instituciones reales.
 * Permiten probar la cuadrícula, los filtros por tipo y el directorio.
 */
const demoInstitutions: Institution[] = [
  { id: 'demo-it-a', nombre: 'Instituto tecnológico demostrativo A', siglas: 'IT-A', tipo: 'tecnologico', esDemostrativo: true },
  { id: 'demo-it-b', nombre: 'Instituto tecnológico demostrativo B', siglas: 'IT-B', tipo: 'tecnologico', esDemostrativo: true },
  { id: 'demo-it-c', nombre: 'Instituto tecnológico demostrativo C', siglas: 'IT-C', tipo: 'tecnologico', esDemostrativo: true },
  { id: 'demo-it-d', nombre: 'Instituto tecnológico demostrativo D', siglas: 'IT-D', tipo: 'tecnologico', esDemostrativo: true },
  { id: 'demo-ci-a', nombre: 'Centro de investigación demostrativo A', siglas: 'CI-A', tipo: 'centro-investigacion', esDemostrativo: true },
  { id: 'demo-un-a', nombre: 'Universidad demostrativa A', siglas: 'U-A', tipo: 'universidad', esDemostrativo: true },
  { id: 'demo-un-b', nombre: 'Universidad demostrativa B', siglas: 'U-B', tipo: 'universidad', esDemostrativo: true },
];

export const institutions: Institution[] = dataSourceConfig.showDemoData
  ? [...confirmedInstitutions, ...demoInstitutions]
  : confirmedInstitutions;

const institutionById = new Map(institutions.map((inst) => [inst.id, inst]));

export function getInstitutionById(id: string | null | undefined): Institution | undefined {
  return id ? institutionById.get(id) : undefined;
}

/** Texto mostrado cuando la adscripción de un integrante aún no está confirmada. */
export const UNCONFIRMED_INSTITUTION_LABEL = 'Adscripción por confirmar';
