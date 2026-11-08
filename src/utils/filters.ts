import { ALL, UNASSIGNED, type MemberFilterState, type PageResult, type SortOrder } from '@/types/filters';
import type { PublicMember } from '@/types/member';
import { toSearchKey } from './text';

/**
 * Funciones puras de filtrado, orden y paginación del directorio.
 * Se mantienen fuera de los componentes para poder probarlas de forma
 * aislada y para replicar la misma lógica en el backend (query params).
 */

export function matchesQuery(member: PublicMember, query: string): boolean {
  const tokens = toSearchKey(query).split(' ').filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = toSearchKey(`${member.nombres} ${member.apellidos}`);
  return tokens.every((token) => haystack.includes(token));
}

export function filterMembers(
  members: PublicMember[],
  filters: Pick<MemberFilterState, 'query' | 'institucion' | 'linea' | 'rol'>,
): PublicMember[] {
  return members.filter((member) => {
    if (!matchesQuery(member, filters.query)) return false;

    if (filters.institucion === UNASSIGNED && member.institucionId !== null) return false;
    if (
      filters.institucion !== ALL &&
      filters.institucion !== UNASSIGNED &&
      member.institucionId !== filters.institucion
    ) {
      return false;
    }

    if (filters.linea === UNASSIGNED && member.lineaInvestigacionId !== null) return false;
    if (
      filters.linea !== ALL &&
      filters.linea !== UNASSIGNED &&
      member.lineaInvestigacionId !== filters.linea
    ) {
      return false;
    }

    if (filters.rol !== ALL && member.rol !== filters.rol) return false;

    return true;
  });
}

const collator = new Intl.Collator('es-MX', { sensitivity: 'base', numeric: true });

export function sortMembers(members: PublicMember[], order: SortOrder): PublicMember[] {
  const sorted = [...members];
  sorted.sort((a, b) => {
    switch (order) {
      case 'apellidos-desc':
        return collator.compare(b.apellidos, a.apellidos) || collator.compare(b.nombres, a.nombres);
      case 'nombres-asc':
        return collator.compare(a.nombres, b.nombres) || collator.compare(a.apellidos, b.apellidos);
      case 'apellidos-asc':
      default:
        return collator.compare(a.apellidos, b.apellidos) || collator.compare(a.nombres, b.nombres);
    }
  });
  return sorted;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PageResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    from: totalItems === 0 ? 0 : start + 1,
    to: start + pageItems.length,
  };
}

/** Cuenta elementos por clave; útil para mostrar totales junto a cada opción de filtro. */
export function countBy<T, K extends string>(items: T[], getKey: (item: T) => K | null): Map<K | null, number> {
  const counts = new Map<K | null, number>();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function hasActiveFilters(filters: MemberFilterState): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.institucion !== ALL ||
    filters.linea !== ALL ||
    filters.rol !== ALL
  );
}

/**
 * Genera numeración compacta para la paginación: 1 … 4 5 6 … 12
 * `null` representa un salto.
 */
export function getPageWindow(current: number, total: number, radius = 1): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | null)[] = [1];
  const start = Math.max(2, current - radius);
  const end = Math.min(total - 1, current + radius);
  if (start > 2) pages.push(null);
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < total - 1) pages.push(null);
  pages.push(total);
  return pages;
}
