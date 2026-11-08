import type { ResearchLineId } from './research';

/** Valor especial para "sin filtro". */
export const ALL = 'todas' as const;
/** Valor especial para integrantes sin institución confirmada. */
export const UNASSIGNED = 'sin-asignar' as const;

export type SortOrder = 'apellidos-asc' | 'apellidos-desc' | 'nombres-asc';

export interface MemberFilterState {
  query: string;
  institucion: string | typeof ALL | typeof UNASSIGNED;
  linea: ResearchLineId | typeof ALL | typeof UNASSIGNED;
  rol: string | typeof ALL;
  orden: SortOrder;
  pagina: number;
}

export const DEFAULT_MEMBER_FILTERS: MemberFilterState = {
  query: '',
  institucion: ALL,
  linea: ALL,
  rol: ALL,
  orden: 'apellidos-asc',
  pagina: 1,
};

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  /** Índice (base 1) del primer elemento mostrado; 0 si no hay resultados. */
  from: number;
  to: number;
}
