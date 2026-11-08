/**
 * memberMapper — transforma los registros del Excel de integrantes al modelo
 * de la aplicación.
 *
 * Flujo previsto (fase de integración):
 *
 *   Excel (.xlsx)
 *     └─ lector de hojas (p. ej. SheetJS: XLSX.utils.sheet_to_json)
 *          └─ importMemberRows(rows)       → MemberRecord[]  (administrativo)
 *               └─ toPublicMember(record)  → PublicMember[]  (sitio público)
 *
 * Idealmente este proceso se ejecuta en el backend o en un script de
 * importación, NO en el navegador: el archivo contiene datos personales que
 * no deben viajar al cliente.
 *
 * Este módulo no depende de React ni de ninguna librería de Excel.
 */
import { institutions as defaultInstitutions } from '@/data/institutions';
import { researchLines as defaultResearchLines } from '@/data/researchLines';
import type { Institution } from '@/types/institution';
import {
  EXCEL_COLUMNS,
  MEMBER_ROLES,
  type ExcelCellValue,
  type ExcelColumn,
  type ExcelMemberRow,
  type MemberRecord,
  type PublicMember,
} from '@/types/member';
import type { ResearchLine, ResearchLineId } from '@/types/research';
import { collapseWhitespace, slugify, stripDiacritics, toSearchKey } from './text';

/* -------------------------------------------------------------------------- */
/*  Tipos del proceso de importación                                           */
/* -------------------------------------------------------------------------- */

export type ImportWarningCode =
  | 'fila-sin-nombre'
  | 'correo-invalido'
  | 'institucion-no-reconocida'
  | 'linea-no-reconocida'
  | 'linea-ambigua'
  | 'numero-invalido'
  | 'columna-desconocida';

export interface ImportWarning {
  /** Número de fila en el Excel (encabezado = fila 1). */
  fila: number;
  codigo: ImportWarningCode;
  mensaje: string;
  campo?: keyof MemberRecord | string;
}

export type DuplicateReason = 'nombre' | 'correo-institucional' | 'cvu-tecnm';

export interface DuplicateGroup {
  motivo: DuplicateReason;
  clave: string;
  ids: string[];
}

export interface ImportResult {
  registros: MemberRecord[];
  duplicados: DuplicateGroup[];
  advertencias: ImportWarning[];
  /** Filas descartadas (sin nombre ni apellidos). */
  omitidas: number[];
}

export interface MapperContext {
  institutions: Institution[];
  researchLines: ResearchLine[];
  /**
   * Alias adicionales de instituciones: clave normalizada → id del catálogo.
   * Ejemplo: { 'tecnm campus celaya': 'it-celaya' }
   */
  institutionAliases?: Record<string, string>;
}

const defaultContext: MapperContext = {
  institutions: defaultInstitutions,
  researchLines: defaultResearchLines,
};

/* -------------------------------------------------------------------------- */
/*  1. Encabezados                                                             */
/* -------------------------------------------------------------------------- */

/** "  Número CVU  TecNM " → "numero cvu tecnm" */
export function normalizeHeader(header: string): string {
  return stripDiacritics(header)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const HEADER_LOOKUP = new Map<string, ExcelColumn>(EXCEL_COLUMNS.map((col) => [normalizeHeader(col), col]));

/**
 * Convierte un objeto con encabezados arbitrarios (tal como lo entrega el
 * lector de Excel) en una `ExcelMemberRow` con encabezados canónicos.
 * Tolera diferencias de mayúsculas, acentos, espacios y puntuación.
 */
export function normalizeRawRow(
  raw: Record<string, unknown>,
): { row: ExcelMemberRow; unknownColumns: string[] } {
  const row: ExcelMemberRow = {};
  const unknownColumns: string[] = [];

  for (const [header, value] of Object.entries(raw)) {
    const column = HEADER_LOOKUP.get(normalizeHeader(header));
    if (!column) {
      if (!header.startsWith('__EMPTY')) unknownColumns.push(header);
      continue;
    }
    row[column] = toCellValue(value);
  }

  return { row, unknownColumns };
}

function toCellValue(value: unknown): ExcelCellValue {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof Date
  ) {
    return value;
  }
  return String(value);
}

/* -------------------------------------------------------------------------- */
/*  2. Limpieza de valores                                                     */
/* -------------------------------------------------------------------------- */

const EMPTY_MARKERS = new Set(['', '-', '--', '.', 'na', 'n/a', 'n.a.', 'no aplica', 'ninguno', 'ninguna', 's/n', 'sin dato', 'null', 'undefined']);

/**
 * Limpia una celda: convierte a texto, colapsa espacios y devuelve
 * `undefined` para celdas vacías o marcadores como "N/A", "-" o "No aplica".
 */
export function cleanCell(value: ExcelCellValue): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) return value.toISOString();
  const text = collapseWhitespace(String(value));
  if (EMPTY_MARKERS.has(text.toLowerCase())) return undefined;
  return text;
}

/**
 * Identificadores numéricos (CVU, Scopus): Excel suele convertirlos en
 * números o notación científica. Se conservan como texto sin decimales.
 */
export function cleanIdentifier(value: ExcelCellValue): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value).toString();
  }
  const text = cleanCell(value);
  return text?.replace(/\s+/g, '');
}

const NAME_PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'van', 'von', 'da', 'di']);

/**
 * Normaliza nombres propios: "  MARÍA  yasmín " → "María Yasmín".
 * Las partículas (de, del, la…) quedan en minúscula salvo al inicio:
 * "DE LA CRUZ NICOLÁS" → "De la Cruz Nicolás".
 * Se respetan guiones y apóstrofos: "PÉREZ-GARCÍA" → "Pérez-García".
 */
export function normalizePersonName(value: string | undefined): string {
  if (!value) return '';
  const words = collapseWhitespace(value).toLocaleLowerCase('es-MX').split(' ');

  return words
    .map((word, index) => {
      if (index > 0 && NAME_PARTICLES.has(word)) return word;
      return word
        .split(/([-'’])/)
        .map((part) => (part.length > 0 && !/[-'’]/.test(part) ? capitalize(part) : part))
        .join('');
    })
    .join(' ');
}

function capitalize(word: string): string {
  return word.charAt(0).toLocaleUpperCase('es-MX') + word.slice(1);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: ExcelCellValue): { email?: string; invalid: boolean } {
  const text = cleanCell(value);
  if (!text) return { invalid: false };
  // Algunas celdas contienen varios correos; se toma el primero válido.
  const candidates = text
    .toLowerCase()
    .split(/[\s,;/]+/)
    .map((c) => c.replace(/^mailto:/, ''));
  const email = candidates.find((c) => EMAIL_PATTERN.test(c));
  return email ? { email, invalid: false } : { invalid: true };
}

/* -------------------------------------------------------------------------- */
/*  3. Instituciones                                                           */
/* -------------------------------------------------------------------------- */

/** Prefijos frecuentes que no aportan a la identificación de la institución. */
const INSTITUTION_NOISE = [
  /^tecnologico nacional de mexico\s*(campus)?\s*/,
  /^tecnm\s*(campus)?\s*/,
  /^tec nm\s*(campus)?\s*/,
];

/** Clave comparable de una institución: "TecNM Campus Celaya" → "celaya". */
export function institutionKey(value: string): string {
  let key = toSearchKey(value).replace(/[.-]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const pattern of INSTITUTION_NOISE) key = key.replace(pattern, '');
  key = key
    .replace(/^instituto tecnologico (superior )?de /, 'it ')
    .replace(/^instituto tecnologico (superior )?/, 'it ')
    .replace(/^i t /, 'it ')
    .trim();
  return key;
}

/**
 * Asocia el texto de "INSTITUCIÓN DE ADSCRIPCIÓN" con el catálogo.
 * Devuelve el texto limpio y el id encontrado (o null).
 */
export function normalizeInstitution(
  value: ExcelCellValue,
  context: MapperContext = defaultContext,
): { nombre: string; institucionId: string | null } {
  const nombre = cleanCell(value) ?? '';
  if (!nombre) return { nombre: '', institucionId: null };

  const key = institutionKey(nombre);
  const aliasId = context.institutionAliases?.[key];
  if (aliasId) return { nombre, institucionId: aliasId };

  const match = context.institutions.find((inst) => {
    if (institutionKey(inst.nombre) === key) return true;
    if (inst.siglas && institutionKey(inst.siglas) === key) return true;
    // "CENIDET" dentro de "TecNM / CENIDET"
    return inst.siglas ? key.split(' ').includes(institutionKey(inst.siglas)) : false;
  });

  return { nombre, institucionId: match?.id ?? null };
}

/* -------------------------------------------------------------------------- */
/*  4. Líneas de investigación                                                 */
/* -------------------------------------------------------------------------- */

export interface LineResolution {
  lineaId: ResearchLineId | null;
  ambigua: boolean;
}

/**
 * Asocia el texto libre de la línea propuesta con una línea oficial:
 *  1. Número explícito: "Línea 3", "L3", "3.-…"
 *  2. Coincidencia con el nombre oficial completo.
 *  3. Puntuación por palabras clave (src/data/researchLines.ts).
 */
export function resolveResearchLine(
  value: ExcelCellValue,
  context: MapperContext = defaultContext,
): LineResolution {
  const text = cleanCell(value);
  if (!text) return { lineaId: null, ambigua: false };
  const key = toSearchKey(text);

  const numbered = key.match(/^(?:linea\s*|l\s*)?([1-5])(?:\s|\.|-|\)|$)/);
  if (numbered) {
    const line = context.researchLines.find((l) => l.numero === Number(numbered[1]));
    if (line) return { lineaId: line.id, ambigua: false };
  }

  const exact = context.researchLines.find((l) => key.includes(toSearchKey(l.nombre)));
  if (exact) return { lineaId: exact.id, ambigua: false };

  const scores = context.researchLines
    .map((line) => ({
      id: line.id,
      score: line.palabrasClave.reduce((acc, kw) => (key.includes(toSearchKey(kw)) ? acc + 1 : acc), 0),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scores.length === 0) return { lineaId: null, ambigua: false };
  if (scores.length > 1 && scores[0].score === scores[1].score) return { lineaId: null, ambigua: true };
  return { lineaId: scores[0].id, ambigua: false };
}

/* -------------------------------------------------------------------------- */
/*  5. Rol (columna ROLL)                                                      */
/* -------------------------------------------------------------------------- */

const ROLE_ALIASES: Record<string, string> = {
  'lider de la red': MEMBER_ROLES.liderRed,
  'lider red': MEMBER_ROLES.liderRed,
  'coordinador de la red': MEMBER_ROLES.liderRed,
  'coordinadora de la red': MEMBER_ROLES.liderRed,
  'lider de linea': MEMBER_ROLES.liderLinea,
  'responsable de linea': MEMBER_ROLES.liderLinea,
  integrante: MEMBER_ROLES.integrante,
  miembro: MEMBER_ROLES.integrante,
  colaborador: MEMBER_ROLES.integrante,
  colaboradora: MEMBER_ROLES.integrante,
};

/** Normaliza la columna `ROLL` del Excel como `rol`. */
export function normalizeRole(value: ExcelCellValue): string | undefined {
  const text = cleanCell(value);
  if (!text) return undefined;
  const alias = ROLE_ALIASES[toSearchKey(text)];
  if (alias) return alias;
  const lower = text.toLocaleLowerCase('es-MX');
  return capitalize(lower);
}

/* -------------------------------------------------------------------------- */
/*  6. Fila → MemberRecord                                                     */
/* -------------------------------------------------------------------------- */

export function buildMemberId(nombres: string, apellidos: string, numero: number): string {
  const base = slugify(`${nombres} ${apellidos}`);
  return base ? `m-${base}` : `m-${numero}`;
}

/**
 * Transforma una fila del Excel en un `MemberRecord`.
 * Devuelve `null` si la fila no tiene nombre ni apellidos.
 */
export function mapExcelRow(
  row: ExcelMemberRow,
  fila: number,
  context: MapperContext = defaultContext,
): { record: MemberRecord | null; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = [];

  const nombres = normalizePersonName(cleanCell(row['NOMBRES']));
  const apellidos = normalizePersonName(cleanCell(row['APELLIDOS']));
  if (!nombres && !apellidos) {
    warnings.push({ fila, codigo: 'fila-sin-nombre', mensaje: 'Fila sin nombre ni apellidos; se omitió.' });
    return { record: null, warnings };
  }

  const rawNumero = cleanCell(row['No.']);
  const parsedNumero = rawNumero ? Number.parseInt(rawNumero, 10) : Number.NaN;
  const numero = Number.isFinite(parsedNumero) ? parsedNumero : fila - 1;
  if (rawNumero && !Number.isFinite(parsedNumero)) {
    warnings.push({ fila, codigo: 'numero-invalido', campo: 'numero', mensaje: `"No." no es numérico: "${rawNumero}".` });
  }

  const correoInstitucional = normalizeEmail(row['CORREO INSTITUCIONAL']);
  if (correoInstitucional.invalid) {
    warnings.push({ fila, codigo: 'correo-invalido', campo: 'correoInstitucional', mensaje: 'Correo institucional con formato no válido.' });
  }
  // El correo personal se valida pero nunca se publica.
  const correoPersonal = normalizeEmail(row['CORREO PERSONAL']);
  if (correoPersonal.invalid) {
    warnings.push({ fila, codigo: 'correo-invalido', campo: 'correoPersonal', mensaje: 'Correo personal con formato no válido.' });
  }

  const institucion = normalizeInstitution(row['INSTITUCIÓN DE ADSCRIPCIÓN'], context);
  if (institucion.nombre && !institucion.institucionId) {
    warnings.push({
      fila,
      codigo: 'institucion-no-reconocida',
      campo: 'institucion',
      mensaje: `"${institucion.nombre}" no está en el catálogo de instituciones; agrégala o define un alias.`,
    });
  }

  const lineaTexto = cleanCell(row['LÍNEA DE INVESTIGACIÓN PROPUESTA PARA TRABAJAR EN LA RED']);
  const linea = resolveResearchLine(lineaTexto, context);
  if (lineaTexto && !linea.lineaId) {
    warnings.push({
      fila,
      codigo: linea.ambigua ? 'linea-ambigua' : 'linea-no-reconocida',
      campo: 'lineaInvestigacion',
      mensaje: linea.ambigua
        ? `La línea "${lineaTexto}" coincide con varias líneas oficiales; requiere revisión.`
        : `La línea "${lineaTexto}" no corresponde a ninguna línea oficial.`,
    });
  }

  const record: MemberRecord = {
    id: buildMemberId(nombres, apellidos, numero),
    numero,
    nombres,
    apellidos,
    nombreCompleto: `${nombres} ${apellidos}`.trim(),

    cvuTecNM: cleanIdentifier(row['NÚMERO CVU TecNM']),
    archivoCvuTecNM: cleanCell(row['Nombre del archivo del CVU de TecNM enviado']),
    cvuConahcyt: cleanIdentifier(row['NÚMERO CVU de CONAHCyT PARA Profesores externos']),
    archivoCvuConahcyt: cleanCell(row['Nombre del archivo del CVU de CONAHCYT enviado']),

    correoInstitucional: correoInstitucional.email,
    telefonoParticular: cleanIdentifier(row['TELÉFONO PARTICULAR']),
    correoPersonal: correoPersonal.email,

    institucion: institucion.nombre,
    institucionId: institucion.institucionId,

    rol: normalizeRole(row['ROLL']),

    scopusAuthorId: cleanIdentifier(row['Scopus Author Identifier']),
    archivoCartaCompromiso: cleanCell(row['NOMBRE DEL ARCHIVO DE CARTA COMPROMISO ENVIADO']),

    lineaInvestigacion: lineaTexto,
    lineaInvestigacionId: linea.lineaId,

    infraestructura: cleanCell(row['Infraestructura que aporta su IT a la Red']),
    programasAcademicos: cleanCell(row['Programas académicos de licenciatura y de posgrado que asociará a la red']),

    // El Excel no registra autorización de publicación: por defecto, no se publica.
    autorizaCorreoPublico: false,
  };

  return { record, warnings };
}

/* -------------------------------------------------------------------------- */
/*  7. Duplicados                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Detecta registros que probablemente corresponden a la misma persona:
 * mismo nombre normalizado, mismo correo institucional o mismo CVU TecNM.
 */
export function findDuplicates(records: MemberRecord[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];

  const collect = (motivo: DuplicateReason, getKey: (r: MemberRecord) => string | undefined): void => {
    const byKey = new Map<string, string[]>();
    for (const record of records) {
      const key = getKey(record);
      if (!key) continue;
      byKey.set(key, [...(byKey.get(key) ?? []), record.id]);
    }
    for (const [clave, ids] of byKey) {
      if (ids.length > 1) groups.push({ motivo, clave, ids });
    }
  };

  collect('nombre', (r) => toSearchKey(r.nombreCompleto) || undefined);
  collect('correo-institucional', (r) => r.correoInstitucional);
  collect('cvu-tecnm', (r) => r.cvuTecNM);

  return groups;
}

/** Garantiza ids únicos añadiendo sufijos cuando dos personas comparten nombre. */
function ensureUniqueIds(records: MemberRecord[]): MemberRecord[] {
  const seen = new Map<string, number>();
  return records.map((record) => {
    const count = seen.get(record.id) ?? 0;
    seen.set(record.id, count + 1);
    return count === 0 ? record : { ...record, id: `${record.id}-${count + 1}` };
  });
}

/* -------------------------------------------------------------------------- */
/*  8. Importación completa                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Procesa todas las filas de la hoja de integrantes.
 *
 * @param rawRows Filas tal como las entrega el lector de Excel (objetos indexados por encabezado).
 * @example
 *   const workbook = XLSX.read(buffer);
 *   const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]]);
 *   const { registros, advertencias, duplicados } = importMemberRows(rows);
 */
export function importMemberRows(
  rawRows: Record<string, unknown>[],
  context: MapperContext = defaultContext,
): ImportResult {
  const advertencias: ImportWarning[] = [];
  const omitidas: number[] = [];
  const registros: MemberRecord[] = [];
  const reportedColumns = new Set<string>();

  rawRows.forEach((raw, index) => {
    const fila = index + 2; // fila 1 = encabezados
    const { row, unknownColumns } = normalizeRawRow(raw);

    for (const column of unknownColumns) {
      if (reportedColumns.has(column)) continue;
      reportedColumns.add(column);
      advertencias.push({ fila, codigo: 'columna-desconocida', campo: column, mensaje: `Columna no reconocida: "${column}".` });
    }

    const { record, warnings } = mapExcelRow(row, fila, context);
    advertencias.push(...warnings);
    if (record) registros.push(record);
    else omitidas.push(fila);
  });

  const unique = ensureUniqueIds(registros);
  return { registros: unique, duplicados: findDuplicates(unique), advertencias, omitidas };
}

/* -------------------------------------------------------------------------- */
/*  9. Separación público / administrativo                                     */
/* -------------------------------------------------------------------------- */

/**
 * Construye la versión pública de un integrante mediante lista blanca:
 * cada campo se copia explícitamente; nunca se usa el operador spread sobre
 * el registro administrativo, para que un campo nuevo no se filtre por error.
 */
export function toPublicMember(record: MemberRecord): PublicMember {
  return {
    id: record.id,
    nombres: record.nombres,
    apellidos: record.apellidos,
    nombreCompleto: record.nombreCompleto,
    institucionId: record.institucionId,
    rol: record.rol ?? MEMBER_ROLES.integrante,
    lineaInvestigacionId: record.lineaInvestigacionId,
    ...(record.autorizaCorreoPublico && record.correoInstitucional
      ? { correoPublico: record.correoInstitucional }
      : {}),
    esDemostrativo: false,
  };
}

export function toPublicMembers(records: MemberRecord[]): PublicMember[] {
  return records.map(toPublicMember);
}
