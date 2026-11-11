import { useEffect, useId, useState } from 'react';
import { Search, X } from 'lucide-react';

interface MemberSearchProps {
  value: string;
  onChange: (value: string) => void;
  /** Retardo antes de aplicar la búsqueda, en milisegundos. */
  debounceMs?: number;
}

export function MemberSearch({ value, onChange, debounceMs = 200 }: MemberSearchProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);

  // Sincroniza con cambios externos (p. ej. "Quitar filtros" o navegación),
  // ajustando el estado durante el render en lugar de en un efecto.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => onChange(draft), debounceMs);
    return () => window.clearTimeout(timer);
    // `value` se omite a propósito: solo el texto escrito debe disparar la búsqueda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, debounceMs, onChange]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        Buscar por nombre o apellidos
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
        <input
          id={id}
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onChange(draft);
          }}
          placeholder="Ej. Ramírez, Laura…"
          autoComplete="off"
          spellCheck={false}
          className="field-control h-12 pr-11 pl-11 text-base [&::-webkit-search-cancel-button]:hidden"
        />
        {draft ? (
          <button
            type="button"
            onClick={() => {
              setDraft('');
              onChange('');
            }}
            className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-ink-subtle hover:bg-mist hover:text-ink"
            aria-label="Borrar búsqueda"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
