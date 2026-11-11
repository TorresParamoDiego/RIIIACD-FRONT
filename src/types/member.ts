import type { ResearchLineId } from './research';

/* -------------------------------------------------------------------------- */
/*  Límites del perfil editable (brief fase 2, sección 1.3)                     */
/* -------------------------------------------------------------------------- */

/** Biografía académica: texto libre, máximo 1,000 caracteres (decisión cerrada). */
export const BIOGRAFIA_MAX_LENGTH = 1000;

/**
 * Perfil profesional: texto breve. PROPUESTO: 500 caracteres.
 * PENDIENTE: confirmar con la coordinación (forma parte del punto 4.7 del brief).
 */
export const PERFIL_PROFESIONAL_MAX_LENGTH = 500;

/**
 * Registro de la autorización aprobada para publicar el correo institucional
 * (tabla `consents` del backend). Sin este registro, el correo nunca se publica.
 */
export interface EmailConsent {
  /** Fecha ISO 8601 en que la coordinación aprobó la autorización. */
  aprobadoEn: string;
  /** Versión del texto de autorización que aceptó el integrante. */
  versionTexto: string;
  /** Identificador de la persona de la coordinación que la aprobó. */
  aprobadoPor: string;
}

/* -------------------------------------------------------------------------- */
/*  1. Fila cruda del Excel                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Encabezados del archivo Excel de registro de integrantes, tal como aparecen
 * en el documento. El mapper normaliza los encabezados (mayúsculas, acentos,
 * espacios), por lo que variaciones menores también se reconocen.
 */
export const EXCEL_COLUMNS = [
  'No.',
  'NOMBRES',
  'APELLIDOS',
  'NÚMERO CVU TecNM',
  'Nombre del archivo del CVU de TecNM enviado',
  'NÚMERO CVU de CONAHCyT PARA Profesores externos',
  'Nombre del archivo del CVU de CONAHCYT enviado',
  'CORREO INSTITUCIONAL',
  'TELÉFONO PARTICULAR',
  'CORREO PERSONAL',
  'INSTITUCIÓN DE ADSCRIPCIÓN',
  'ROLL',
  'Scopus Author Identifier',
  'NOMBRE DEL ARCHIVO DE CARTA COMPROMISO ENVIADO',
  'LÍNEA DE INVESTIGACIÓN PROPUESTA PARA TRABAJAR EN LA RED',
  'Infraestructura que aporta su IT a la Red',
  'Programas académicos de licenciatura y de posgrado que asociará a la red',
] as const;

export type ExcelColumn = (typeof EXCEL_COLUMNS)[number];

/** Valor de celda tal como lo entrega un lector de hojas de cálculo (p. ej. SheetJS). */
export type ExcelCellValue = string | number | boolean | Date | null | undefined;

/** Fila del Excel indexada por encabezado. Cualquier columna puede venir vacía. */
export type ExcelMemberRow = Partial<Record<ExcelColumn, ExcelCellValue>>;

/* -------------------------------------------------------------------------- */
/*  2. Registro administrativo (uso interno, nunca se publica)                 */
/* -------------------------------------------------------------------------- */

/**
 * Registro completo de un integrante, con información administrativa y
 * personal. Este tipo SOLO debe existir en procesos internos (importación,
 * futuro panel administrativo, backend). Ningún archivo de `src/data` ni
 * ningún componente público debe contener objetos de este tipo.
 *
 * Importante: excluir campos en el frontend no es una medida de seguridad.
 * En la integración con backend, la API deberá devolver al sitio público
 * únicamente `PublicMember`.
 */
export interface MemberRecord {
  id: string;
  numero: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;

  cvuTecNM?: string;
  archivoCvuTecNM?: string;

  cvuConahcyt?: string;
  archivoCvuConahcyt?: string;

  correoInstitucional?: string;
  telefonoParticular?: string;
  correoPersonal?: string;

  /** Texto de adscripción ya limpio, tal como quedó tras la normalización. */
  institucion: string;
  /** Institución del catálogo a la que se asoció el texto; null si no se reconoció. */
  institucionId: string | null;

  /** Columna `ROLL` del Excel, normalizada como `rol`. */
  rol?: string;

  scopusAuthorId?: string;
  archivoCartaCompromiso?: string;

  /** Texto original de la línea propuesta. */
  lineaInvestigacion?: string;
  /** Línea oficial asociada a partir del texto; null si no se pudo determinar. */
  lineaInvestigacionId: ResearchLineId | null;

  infraestructura?: string;
  programasAcademicos?: string;

  /* --- Perfil editable por el integrante (solo valores YA aprobados) ------- */

  /** Biografía académica aprobada. Máximo `BIOGRAFIA_MAX_LENGTH` caracteres. */
  biografia?: string;
  /** Perfil profesional aprobado. Máximo `PERFIL_PROFESIONAL_MAX_LENGTH` caracteres. */
  perfilProfesional?: string;
  /** Líneas oficiales adicionales aprobadas a propuesta del integrante. */
  lineasPropuestas?: ResearchLineId[];

  /* --- Correo público: solicitud y aprobación van separadas --------------- */

  /**
   * Lo que pidió el integrante en su formulario. NO basta para publicar el
   * correo: es solo una solicitud pendiente de revisión.
   * El Excel actual no tiene esta columna, por lo que el valor por defecto es `false`.
   */
  solicitaCorreoPublico: boolean;
  /** Autorización aprobada por la coordinación. Es la única condición para publicar. */
  consentimientoCorreo: EmailConsent | null;
}

/* -------------------------------------------------------------------------- */
/*  3. Integrante público (lo único que consume la interfaz pública)            */
/* -------------------------------------------------------------------------- */

export type AcademicTitle = 'Dr.' | 'Dra.' | 'Mtro.' | 'Mtra.' | 'Ing.' | 'Lic.';

export interface PublicMember {
  id: string;
  tratamiento?: AcademicTitle;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  /** null cuando la adscripción aún no está confirmada en el catálogo. */
  institucionId: string | null;
  rol: string;
  lineaInvestigacionId: ResearchLineId | null;
  /**
   * Correo institucional público. Solo presente cuando existe una autorización
   * APROBADA (`MemberRecord.consentimientoCorreo`); la solicitud del integrante
   * por sí sola no lo publica.
   */
  correoPublico?: string;

  /** Biografía académica aprobada (≤ 1,000 caracteres). */
  biografia?: string;
  /** Perfil profesional aprobado. */
  perfilProfesional?: string;
  /** Líneas oficiales adicionales, ya aprobadas por la coordinación. */
  lineasPropuestas?: ResearchLineId[];

  /** Preparado para fases posteriores. */
  fotoUrl?: string;
  perfilAcademicoUrl?: string;

  /** Marca los registros de prueba. Nunca debe ser `true` para personas reales. */
  esDemostrativo: boolean;
}

/**
 * Lista blanca: campos que la interfaz pública tiene permitido mostrar.
 * El CVU (TecNM o CONAHCyT), el teléfono, el correo personal, los archivos y
 * la carta compromiso NUNCA forman parte de esta lista.
 */
export const PUBLIC_MEMBER_FIELDS = [
  'id',
  'tratamiento',
  'nombres',
  'apellidos',
  'nombreCompleto',
  'institucionId',
  'rol',
  'lineaInvestigacionId',
  'correoPublico',
  'biografia',
  'perfilProfesional',
  'lineasPropuestas',
  'fotoUrl',
  'perfilAcademicoUrl',
  'esDemostrativo',
] as const satisfies readonly (keyof PublicMember)[];

/** Roles conocidos dentro de la red. El Excel puede contener otros valores. */
export const MEMBER_ROLES = {
  liderRed: 'Líder de la red',
  liderLinea: 'Responsable de línea',
  integrante: 'Integrante',
} as const;
