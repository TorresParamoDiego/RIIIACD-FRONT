import { dataSourceConfig } from '@/config/dataSource';
import { MEMBER_ROLES, type PublicMember } from '@/types/member';
import type { ResearchLineId } from '@/types/research';

/**
 * Directorio público de integrantes.
 *
 * Este archivo contiene EXCLUSIVAMENTE datos de tipo `PublicMember`. Nunca
 * debe incluir teléfonos, correos personales, números CVU ni nombres de
 * archivos. Cuando se integre el Excel, este arreglo se generará con
 * `importMemberRows()` + `toPublicMember()` (src/utils/memberMapper.ts), o
 * lo entregará directamente la API.
 */

/**
 * Integrantes documentados: responsables de la red y de las líneas de
 * investigación, según la documentación institucional proporcionada.
 * La adscripción del resto se completará con el padrón oficial.
 */
const documentedMembers: PublicMember[] = [
  {
    id: 'm-eddie-clemente-torres',
    tratamiento: 'Dr.',
    nombres: 'Eddie Helbert',
    apellidos: 'Clemente Torres',
    nombreCompleto: 'Eddie Helbert Clemente Torres',
    institucionId: 'cenidet',
    rol: MEMBER_ROLES.liderRed,
    lineaInvestigacionId: 'linea-4',
    correoPublico: 'eddie.ct@cenidet.tecnm.mx',
    esDemostrativo: false,
  },
  {
    id: 'm-ernesto-de-la-cruz-nicolas',
    tratamiento: 'Dr.',
    nombres: 'Ernesto',
    apellidos: 'De La Cruz Nicolás',
    nombreCompleto: 'Ernesto De La Cruz Nicolás',
    institucionId: null,
    rol: MEMBER_ROLES.liderLinea,
    lineaInvestigacionId: 'linea-1',
    esDemostrativo: false,
  },
  {
    id: 'm-norma-ramirez-perez',
    tratamiento: 'Dra.',
    nombres: 'Norma Verónica',
    apellidos: 'Ramírez Pérez',
    nombreCompleto: 'Norma Verónica Ramírez Pérez',
    institucionId: null,
    rol: MEMBER_ROLES.liderLinea,
    lineaInvestigacionId: 'linea-2',
    esDemostrativo: false,
  },
  {
    id: 'm-laura-flores-lopez',
    tratamiento: 'Dra.',
    nombres: 'Laura Yasmin',
    apellidos: 'Flores López',
    nombreCompleto: 'Laura Yasmin Flores López',
    institucionId: null,
    rol: MEMBER_ROLES.liderLinea,
    lineaInvestigacionId: 'linea-3',
    esDemostrativo: false,
  },
  {
    id: 'm-maria-hernandez-perez',
    tratamiento: 'Dra.',
    nombres: 'María Yasmín',
    apellidos: 'Hernández Pérez',
    nombreCompleto: 'María Yasmín Hernández Pérez',
    institucionId: null,
    rol: MEMBER_ROLES.liderLinea,
    lineaInvestigacionId: 'linea-5',
    esDemostrativo: false,
  },
];

/* -------------------------------------------------------------------------- */
/*  DATOS DEMOSTRATIVOS                                                        */
/*  No representan personas reales. Sirven para probar búsqueda, filtros,      */
/*  orden y paginación hasta que se cargue el padrón oficial.                  */
/*  Se ocultan con VITE_SHOW_DEMO_DATA=false.                                  */
/* -------------------------------------------------------------------------- */

const DEMO_INSTITUTION_IDS = [
  'demo-it-a',
  'demo-it-b',
  'demo-it-c',
  'demo-it-d',
  'demo-ci-a',
  'demo-un-a',
  'demo-un-b',
] as const;

const DEMO_LINE_IDS: ResearchLineId[] = ['linea-1', 'linea-2', 'linea-3', 'linea-4', 'linea-5'];

const DEMO_COUNT = 31;

function buildDemoMember(index: number): PublicMember {
  const numero = String(index + 1).padStart(2, '0');
  const institucionId = DEMO_INSTITUTION_IDS[(index * 3) % DEMO_INSTITUTION_IDS.length];
  // Algunos registros sin línea asociada, para probar ese caso en la interfaz.
  const lineaInvestigacionId = index % 11 === 10 ? null : DEMO_LINE_IDS[(index * 2 + 1) % DEMO_LINE_IDS.length];
  const autorizaCorreo = index % 4 === 0;

  return {
    id: `demo-${numero}`,
    nombres: 'Integrante',
    apellidos: `Demostrativo ${numero}`,
    nombreCompleto: `Integrante Demostrativo ${numero}`,
    institucionId,
    rol: MEMBER_ROLES.integrante,
    lineaInvestigacionId,
    ...(autorizaCorreo ? { correoPublico: `integrante${numero}@institucion.example` } : {}),
    esDemostrativo: true,
  };
}

const demoMembers: PublicMember[] = Array.from({ length: DEMO_COUNT }, (_, i) => buildDemoMember(i));

export const publicMembers: PublicMember[] = dataSourceConfig.showDemoData
  ? [...documentedMembers, ...demoMembers]
  : documentedMembers;

/** Acceso sincrónico para datos fijos (p. ej. responsables de línea en la portada). */
export function getDocumentedMemberById(id: string): PublicMember | undefined {
  return documentedMembers.find((m) => m.id === id);
}
