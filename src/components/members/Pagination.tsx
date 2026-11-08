import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPageWindow } from '@/utils/filters';
import { cn } from '@/utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = getPageWindow(page, totalPages);

  const arrowClass =
    'inline-flex h-10 items-center gap-1 rounded-control px-3 text-[0.9375rem] font-medium text-navy-950 hover:bg-mist disabled:pointer-events-none disabled:text-ink-subtle/60';

  return (
    <nav aria-label="Paginación del directorio" className="flex items-center justify-between gap-2 sm:justify-center">
      <button type="button" className={arrowClass} disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span>Anterior</span>
      </button>

      <ol className="hidden items-center gap-1 sm:flex">
        {pages.map((p, index) =>
          p === null ? (
            <li key={`gap-${index}`} className="px-1 text-ink-subtle" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Página ${p}`}
                className={cn(
                  'grid size-10 place-items-center rounded-control text-[0.9375rem] font-medium tabular-nums',
                  p === page ? 'bg-navy-950 text-white' : 'text-navy-950 hover:bg-mist',
                )}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>

      <p className="text-sm text-ink-muted sm:hidden" aria-live="polite">
        Página {page} de {totalPages}
      </p>

      <button type="button" className={arrowClass} disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        <span>Siguiente</span>
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
