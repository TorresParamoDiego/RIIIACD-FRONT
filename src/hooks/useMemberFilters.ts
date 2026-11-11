import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ALL, DEFAULT_MEMBER_FILTERS, UNASSIGNED, type MemberFilterState, type SortOrder } from '@/types/filters';
import { isResearchLineId } from '@/types/research';

/**
 * Estado de filtros del directorio sincronizado con la URL
 * (/integrantes?q=…&institucion=…&linea=…&rol=…&orden=…&pagina=…).
 * Así los filtros se pueden compartir y la línea de investigación puede
 * enlazar directamente a su lista de integrantes.
 */

const PARAM = {
  query: 'q',
  institucion: 'institucion',
  linea: 'linea',
  rol: 'rol',
  orden: 'orden',
  pagina: 'pagina',
  integrante: 'integrante',
} as const;

const SORT_ORDERS: SortOrder[] = ['apellidos-asc', 'apellidos-desc', 'nombres-asc'];

function parseFilters(params: URLSearchParams): MemberFilterState {
  const linea = params.get(PARAM.linea);
  const orden = params.get(PARAM.orden);
  const pagina = Number.parseInt(params.get(PARAM.pagina) ?? '1', 10);

  return {
    query: params.get(PARAM.query) ?? DEFAULT_MEMBER_FILTERS.query,
    institucion: params.get(PARAM.institucion) ?? ALL,
    linea: linea && (isResearchLineId(linea) || linea === UNASSIGNED) ? linea : ALL,
    rol: params.get(PARAM.rol) ?? ALL,
    orden: SORT_ORDERS.find((o) => o === orden) ?? DEFAULT_MEMBER_FILTERS.orden,
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
  };
}

export interface UseMemberFiltersResult {
  filters: MemberFilterState;
  /** Cambia uno o varios filtros; regresa a la página 1 salvo que se cambie la página. */
  setFilters: (patch: Partial<MemberFilterState>) => void;
  resetFilters: () => void;
  selectedMemberId: string | null;
  openMember: (id: string) => void;
  closeMember: () => void;
}

export function useMemberFilters(): UseMemberFiltersResult {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  const setFilters = useCallback(
    (patch: Partial<MemberFilterState>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          const merged: MemberFilterState = {
            ...parseFilters(current),
            ...patch,
            pagina: patch.pagina ?? 1,
          };

          const write = (key: string, value: string, defaultValue: string): void => {
            if (value === defaultValue || value === '') next.delete(key);
            else next.set(key, value);
          };

          write(PARAM.query, merged.query, DEFAULT_MEMBER_FILTERS.query);
          write(PARAM.institucion, merged.institucion, ALL);
          write(PARAM.linea, merged.linea, ALL);
          write(PARAM.rol, merged.rol, ALL);
          write(PARAM.orden, merged.orden, DEFAULT_MEMBER_FILTERS.orden);
          write(PARAM.pagina, String(merged.pagina), '1');
          return next;
        },
        // La búsqueda por texto no debe llenar el historial con cada tecla.
        { replace: patch.query !== undefined },
      );
    },
    [setParams],
  );

  const resetFilters = useCallback(() => {
    setParams((current) => {
      const next = new URLSearchParams();
      const integrante = current.get(PARAM.integrante);
      if (integrante) next.set(PARAM.integrante, integrante);
      return next;
    });
  }, [setParams]);

  const openMember = useCallback(
    (id: string) => {
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set(PARAM.integrante, id);
        return next;
      });
    },
    [setParams],
  );

  const closeMember = useCallback(() => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete(PARAM.integrante);
      return next;
    });
  }, [setParams]);

  return {
    filters,
    setFilters,
    resetFilters,
    selectedMemberId: params.get(PARAM.integrante),
    openMember,
    closeMember,
  };
}
