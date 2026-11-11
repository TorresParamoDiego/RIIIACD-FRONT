import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { SelectField } from '@/components/common/SelectField';
import type { MemberFilterState, SelectOption, SortOrder } from '@/types/filters';
import type { ResearchLineId } from '@/types/research';
import { cn } from '@/utils/cn';

export interface MemberFilterOptions {
  instituciones: SelectOption[];
  lineas: SelectOption<ResearchLineId | 'todas' | 'sin-asignar'>[];
  roles: SelectOption[];
}

const SORT_OPTIONS: SelectOption<SortOrder>[] = [
  { value: 'apellidos-asc', label: 'Apellidos (A–Z)' },
  { value: 'apellidos-desc', label: 'Apellidos (Z–A)' },
  { value: 'nombres-asc', label: 'Nombre (A–Z)' },
];

interface MemberFiltersProps {
  filters: MemberFilterState;
  options: MemberFilterOptions;
  activeCount: number;
  onChange: (patch: Partial<MemberFilterState>) => void;
  onReset: () => void;
}

export function MemberFilters({ filters, options, activeCount, onChange, onReset }: MemberFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* En móvil los filtros se pliegan para no desplazar los resultados */}
      <div className="flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="filtros-directorio"
          className="inline-flex h-11 items-center gap-2 rounded-control border border-rule-strong bg-white px-4 font-medium text-ink"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
          {activeCount > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-brand-green text-xs font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
        {activeCount > 0 ? (
          <button type="button" onClick={onReset} className="h-11 rounded-control px-3 text-[0.9375rem] font-medium text-brand-green">
            Quitar filtros
          </button>
        ) : null}
      </div>

      <div id="filtros-directorio" className={cn('mt-4 grid gap-4 sm:grid-cols-2 md:mt-0 md:grid md:grid-cols-4', !expanded && 'hidden')}>
        <SelectField
          label="Institución"
          value={filters.institucion}
          options={options.instituciones}
          onChange={(value) => onChange({ institucion: value })}
        />
        <SelectField
          label="Línea de investigación"
          value={filters.linea}
          options={options.lineas}
          onChange={(value) => onChange({ linea: value })}
        />
        <SelectField label="Rol" value={filters.rol} options={options.roles} onChange={(value) => onChange({ rol: value })} />
        <SelectField label="Ordenar por" value={filters.orden} options={SORT_OPTIONS} onChange={(value) => onChange({ orden: value })} />
      </div>

      {activeCount > 0 ? (
        <div className="mt-4 hidden md:flex">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-1.5 rounded-control px-2.5 text-[0.9375rem] font-medium text-brand-green hover:bg-brand-green-50 hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
            Quitar filtros ({activeCount})
          </button>
        </div>
      ) : null}
    </div>
  );
}
