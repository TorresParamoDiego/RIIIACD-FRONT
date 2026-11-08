export const INSTITUTION_TYPES = ['tecnologico', 'centro-investigacion', 'universidad'] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export interface InstitutionTypeInfo {
  id: InstitutionType;
  /** Singular, p. ej. "Instituto tecnológico". */
  etiqueta: string;
  /** Plural, p. ej. "Institutos tecnológicos". */
  etiquetaPlural: string;
}

export interface Institution {
  id: string;
  nombre: string;
  siglas?: string;
  tipo: InstitutionType;
  /** Ruta al logotipo oficial (src/assets/logos o URL pública) cuando se disponga de él. */
  logoUrl?: string;
  /** Marca los registros de prueba que no corresponden a instituciones reales. */
  esDemostrativo: boolean;
}

/** Institución con el número de integrantes asociados, calculado a partir del directorio. */
export interface InstitutionWithCount extends Institution {
  integrantes: number;
}

export function isInstitutionType(value: string): value is InstitutionType {
  return (INSTITUTION_TYPES as readonly string[]).includes(value);
}
